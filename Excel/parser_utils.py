"""Предметные функции разбора Excel-строк и построения каталога."""

import re
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Any, Optional, Dict, List
import math
from product_id_registry import ProductIdRegistry, normalize_product_name

# Порядок размеров для каталога (product.sizes)
SIZE_ORDER = ["xs", "s", "m", "l", "xl", "onesize"]

# Маркеры в последней скобке названия, означающие, что размеры пока не разбиты.
# Текстовый маркер сохранён для обратной совместимости; новый канонический
# формат хранит общее количество прямо в названии: "(10 шт.)".
SIZES_UNKNOWN_MARKERS = ["на уточнении"]
QUANTITY_ONLY_PATTERN = re.compile(
    r'^\s*(\d+)\s*(?:шт\.?|штук(?:а|и)?)\s*$',
    re.IGNORECASE,
)
QUANTITY_TOKEN_PATTERN = re.compile(
    r'(?<![A-ZА-ЯЁa-zа-яё])(?:шт\.?|штук(?:а|и)?)(?![A-ZА-ЯЁa-zа-яё])',
    re.IGNORECASE,
)
UNDER_QUESTION_PATTERN = re.compile(r'\bпод\s+вопросом\b', re.IGNORECASE)
POSITION_MARKER_PATTERNS = (
    re.compile(r'\bобразец\b', re.IGNORECASE),
    UNDER_QUESTION_PATTERN,
)


def _get_last_bracket(name: str) -> Optional[str]:
    """Возвращает содержимое последней пары скобок или None."""
    if not name:
        return None

    bracket_groups = re.findall(r'\(([^)]+)\)', name)
    return bracket_groups[-1].strip() if bracket_groups else None


def _strip_position_markers(value: str) -> str:
    """Удаляет независимые позиционные маркеры из содержимого скобок."""
    cleaned = value
    for pattern in POSITION_MARKER_PATTERNS:
        cleaned = pattern.sub('', cleaned)

    cleaned = re.sub(r'(?:\s*[,;]\s*)+', ', ', cleaned)
    return re.sub(r'\s+', ' ', cleaned).strip(' ,;')


def has_under_question_marker(name: str) -> bool:
    """Проверяет маркер ``под вопросом`` в последних скобках названия."""
    last_bracket = _get_last_bracket(name)
    return bool(last_bracket and UNDER_QUESTION_PATTERN.search(last_bracket))


def parse_quantity_only_from_name(
    name: str,
    excel_row: Optional[int] = None,
) -> Optional[int]:
    """Парсит каноническое общее количество без размерной сетки: ``(10 шт.)``.

    Любое упоминание ``шт`` в другой форме считается ошибкой: общее количество
    нельзя смешивать с размерами, делать нулевым, отрицательным или дробным.
    """
    last_bracket = _get_last_bracket(name)
    if last_bracket is None:
        return None

    last_bracket = _strip_position_markers(last_bracket)
    if not last_bracket:
        return None

    match = QUANTITY_ONLY_PATTERN.fullmatch(last_bracket)
    if match:
        quantity = int(match.group(1))
        if quantity > 0:
            return quantity

        row_prefix = f"Строка {excel_row}: " if excel_row is not None else ""
        raise ValueError(
            f"{row_prefix}общее количество в наименовании должно быть больше нуля"
        )

    if QUANTITY_TOKEN_PATTERN.search(last_bracket):
        row_prefix = f"Строка {excel_row}: " if excel_row is not None else ""
        raise ValueError(
            f"{row_prefix}неверный формат общего количества {last_bracket!r}; "
            "используйте отдельную последнюю скобку вида '(10 шт.)' и не "
            "смешивайте количество с размерами"
        )

    return None


def has_sizes_unknown_marker(name: str) -> bool:
    """
    Проверяет, содержит ли последняя скобка названия маркер "размеры не заданы".

    Args:
        name: Полное название товара

    Returns:
        True, если в последней скобке найден маркер из SIZES_UNKNOWN_MARKERS
    """
    if not name:
        return False

    last_bracket = _get_last_bracket(name)
    if last_bracket is None:
        return False

    normalized = last_bracket.lower()
    return (
        parse_quantity_only_from_name(name) is not None
        or any(marker.lower() in normalized for marker in SIZES_UNKNOWN_MARKERS)
    )


def parse_sizes_from_name(name: str, excel_row: Optional[int] = None) -> Dict[str, int]:
    """
    Парсит размеры из названия: "(XS-5, S-7, M-5)", "(one size-5)" или "(образец XS-2)".
    Если в последней скобке маркер "на уточнении" либо общее количество вида
    "(10 шт.)", размеры не парсятся — позиция ожидает размерную сетку.
    
    Args:
        name: Полное название товара с размерами в скобках
        excel_row: Номер строки Excel для диагностического сообщения
        
    Returns:
        Словарь размеров: {"xs": 5, "s": 7, "m": 5} или {"OneSize": 5}.
        Пустой словарь, если размеров нет или размеры на уточнении.

    Raises:
        ValueError: Если формат количества неоднозначен или размер продублирован.
    """
    if not name:
        return {}
    
    # Размеры живут в последней скобке: в названии могут быть другие скобки раньше.
    sizes_str = _get_last_bracket(name)
    if sizes_str is None:
        return {}

    quantity_only = parse_quantity_only_from_name(name, excel_row=excel_row)
    if quantity_only is not None:
        return {}
    
    # Независимые маркеры не являются размерами и могут сочетаться с ними.
    sizes_str = _strip_position_markers(sizes_str)
    if not sizes_str:
        return {}
    
    # Парсим обычные размеры и OneSize единым проходом, чтобы дубликаты
    # проверялись одинаково для всех допустимых вариантов записи.
    sizes = {}
    size_pattern = r'(one\s*size|[A-Z]+)\s*-\s*(\d+)'
    for match in re.finditer(size_pattern, sizes_str, re.IGNORECASE):
        raw_size = match.group(1)
        normalized_size = re.sub(r'\s+', '', raw_size).lower()
        size = "OneSize" if normalized_size == "onesize" else normalized_size
        count = int(match.group(2))

        if size in sizes:
            row_prefix = f"Строка {excel_row}: " if excel_row is not None else ""
            display_size = "ONE SIZE" if size == "OneSize" else raw_size.upper()
            raise ValueError(
                f"{row_prefix}обнаружено дублирование размера {display_size} "
                "в наименовании товара"
            )

        sizes[size] = count
    
    return sizes


def extract_product_name(full_name: str) -> str:
    """
    Удаляет часть в скобках (размеры) из названия товара.
    Нормализует множественные пробелы.
    
    Args:
        full_name: Полное название с размерами, например "Жакет (XS-5)"
        
    Returns:
        Очищенное название: "Жакет"
    """
    if not full_name:
        return ""
    
    # Находим последнюю открывающую скобку
    last_bracket = full_name.rfind('(')
    if last_bracket == -1:
        cleaned = full_name.strip()
    else:
        # Обрезаем до скобки и удаляем пробелы
        cleaned = full_name[:last_bracket].strip()
    
    # Нормализуем множественные пробелы (заменяем на один)
    cleaned = ' '.join(cleaned.split())
    
    return cleaned


def infer_category(name: str) -> str:
    """
    Определяет категорию товара по названию (по корням слов).
    Приоритет: Экзотика (питон) > Кожа > Мех > Замша.
    Если категория не определяется, это считается ошибкой входных данных.
    """
    if not name or not name.strip():
        raise ValueError("Нельзя определить категорию для пустого названия товара")
    s = name.lower().strip()
    if "питон" in s:
        return "Экзотика"
    if "кож" in s:
        return "Кожа"
    if "мех" in s:
        return "Мех"
    if "замш" in s:
        return "Замша"
    raise ValueError(
        "Не удалось определить категорию по названию "
        f"{name!r}. Допустимые корни: питон / кож / мех / замш."
    )


def find_or_create_product_id(
    name: str,
    products: List[Dict],
    product_id_registry: ProductIdRegistry,
    excel_row: Optional[int] = None,
) -> str:
    """
    Находит productId в каталоге по названию или создаёт новый товар и возвращает его id.
    Каталог (products) мутируется при создании нового товара.
    """
    clean_name = extract_product_name(name)
    if not clean_name:
        raise ValueError(
            "Не удалось извлечь нормальное название товара из строки "
            f"{name!r}. Проверьте формат наименования в Excel."
        )

    normalized_clean = normalize_product_name(clean_name)
    for product in products:
        product_name = product.get('name', '')
        if normalize_product_name(product_name) == normalized_clean:
            if excel_row is not None:
                rows = product.setdefault("excelRows", [])
                if excel_row not in rows:
                    rows.append(excel_row)
            return product.get('id', '')

    new_id = product_id_registry.get_or_create(clean_name)
    new_product = {
        "id": new_id,
        "name": clean_name,
        "category": infer_category(clean_name),
        "excelRows": [excel_row] if excel_row is not None else [],
        "sizes": [],
        "materials": {},
    }
    products.append(new_product)
    print(f"  + Добавлен в каталог: {clean_name}")
    return new_id


def assign_product_photos(products: List[Dict], jpg_dir: Path) -> None:
    """
    Записывает photo только для товаров, у которых реально есть JPG/JPEG.
    Точное имя файла берётся с диска, чтобы регистр расширения был корректным
    и на case-sensitive окружениях Netlify.
    """
    if not jpg_dir.exists():
        raise FileNotFoundError(f"Папка каталожных JPG не найдена: {jpg_dir}")

    supported_extensions = {".jpg", ".jpeg"}
    files_by_name = {
        path.name.casefold(): path.name
        for path in jpg_dir.iterdir()
        if path.is_file() and path.suffix.casefold() in supported_extensions
    }

    for product in products:
        name = str(product.get("name", "")).strip()
        product.pop("photo", None)
        if not name:
            continue

        for extension in (".jpg", ".jpeg"):
            actual_name = files_by_name.get(f"{name}{extension}".casefold())
            if actual_name:
                product["photo"] = f"/images/products/jpg/{actual_name}"
                break


def parse_product_materials(raw_value: Any) -> Dict[str, str]:
    """
    Преобразует колонку "Состав" из Excel в структуру materials каталога.
    Формат в Excel может быть свободным, поэтому используем мягкий парсинг:
    - первая содержательная строка -> outer
    - строка с "подклад" -> lining
    - всё остальное -> comments
    """
    if is_empty_value(raw_value):
        return {}

    text = str(raw_value).strip()
    if not text:
        return {}

    lines = [" ".join(line.split()) for line in re.split(r'[\r\n]+', text) if line and line.strip()]
    if not lines:
        return {}

    outer = ""
    lining = ""
    comments: List[str] = []

    for line in lines:
        lower = line.lower()
        if "подклад" in lower:
            cleaned = re.sub(r'^\s*подкладк?[аи]?\s*[:\-]?\s*', '', line, flags=re.IGNORECASE).strip()
            cleaned = cleaned or line
            if not lining:
                lining = cleaned
            elif cleaned != lining and cleaned not in comments:
                comments.append(cleaned)
            continue

        if not outer:
            outer = line
        elif line != outer and line not in comments:
            comments.append(line)

    materials: Dict[str, str] = {}
    if outer:
        materials["outer"] = outer
    if lining:
        materials["lining"] = lining
    if comments:
        materials["comments"] = "\n".join(comments)

    return materials


def apply_product_materials(product_id: str, materials: Dict[str, str], products: List[Dict]) -> None:
    """
    Записывает materials в товар каталога, не затирая уже заполненные поля пустыми значениями.
    Если один и тот же товар встречается в нескольких строках Excel, объединяем данные аккуратно.
    """
    if not product_id or not materials:
        return

    for product in products:
        if product.get("id") != product_id:
            continue

        current = product.get("materials")
        if not isinstance(current, dict):
            current = {}

        merged = dict(current)
        for key, value in materials.items():
            if not value:
                continue

            existing = merged.get(key)
            if not existing:
                merged[key] = value
            elif key == "comments" and value not in str(existing):
                merged[key] = f"{existing}\n{value}"

        product["materials"] = merged
        return


def aggregate_product_sizes(shipments: List[Dict], products: List[Dict]) -> None:
    """
    Заполняет product["sizes"] для каждого товара: объединение всех размеров,
    встречающихся у этого товара в позициях поставок (rawItems).
    Позиции с sizesUnknown игнорируются, чтобы не добавлять фиктивный размер в каталог.
    Один проход по поставкам, без повторного парсинга Excel.
    """
    by_id = defaultdict(set)
    for shipment in shipments:
        for item in shipment.get("rawItems", []):
            pid = item.get("productId")
            if not pid:
                continue
            if item.get("sizesUnknown"):
                continue
            for size_key in item.get("sizes", {}).keys():
                by_id[pid].add(size_key)

    def _size_sort_key(s: str) -> tuple:
        norm = s.lower() if s != "OneSize" else "onesize"
        idx = SIZE_ORDER.index(norm) if norm in SIZE_ORDER else 99
        return (idx, s)

    for product in products:
        pid = product.get("id")
        if not pid:
            continue
        product["sizes"] = sorted(by_id.get(pid, set()), key=_size_sort_key)


def parse_date(value: Any) -> Optional[str]:
    """
    Преобразует дату в формат "DD.MM.YYYY".
    
    Обрабатывает:
    - datetime объекты Python
    - Строки в формате "DD.MM.YYYY"
    - Строки в формате "YYYY-MM-DD"
    
    Args:
        value: Значение даты в любом формате
        
    Returns:
        Строка в формате "DD.MM.YYYY" или None
    """
    if is_empty_value(value):
        return None
    
    # Обработка datetime объектов
    if isinstance(value, datetime):
        return value.strftime('%d.%m.%Y')
    
    # Обработка строк
    if isinstance(value, str):
        value = value.strip()
        if not value:
            return None
        
        # Проверка формата "DD.MM.YYYY"
        if re.match(r'^\d{2}\.\d{2}\.\d{4}$', value):
            return value
        
        # Попытка парсинга "YYYY-MM-DD" или "YYYY-MM-DD HH:MM:SS"
        try:
            # Убираем время, если есть
            date_part = value.split()[0] if ' ' in value else value
            dt = datetime.strptime(date_part, '%Y-%m-%d')
            return dt.strftime('%d.%m.%Y')
        except (ValueError, AttributeError):
            pass
    
    return None


def is_date_value(value: Any) -> bool:
    """
    Проверяет, является ли значение датой.
    
    Args:
        value: Проверяемое значение
        
    Returns:
        True если значение является датой, иначе False
    """
    if is_empty_value(value):
        return False
    
    # Проверка на datetime
    if isinstance(value, datetime):
        return True
    
    # Проверка строковых форматов
    if isinstance(value, str):
        value = value.strip()
        if not value:
            return False
        
        # Формат "DD.MM.YYYY"
        if re.match(r'^\d{2}\.\d{2}\.\d{4}$', value):
            return True
        
        # Формат "YYYY-MM-DD"
        if re.match(r'^\d{4}-\d{2}-\d{2}', value):
            return True
    
    return False


def normalize_status_text(status: Any) -> Optional[str]:
    """
    Нормализует текст статуса из Excel: обрезает пробелы, возвращает строку.
    Не делает маппинг — прокидывает текст как есть.
    
    Args:
        status: Значение статуса из ячейки Excel
        
    Returns:
        Текст статуса (без начальных/конечных пробелов) или None, если пусто
    """
    if is_empty_value(status):
        return None
    
    text = str(status).strip()
    return text if text else None


def clean_eta_text(text: str) -> str:
    """
    Удаляет переносы строк из текста eta, заменяя их на пробелы.
    
    Args:
        text: Текст с возможными переносами строк
        
    Returns:
        Очищенный текст
    """
    if not text:
        return ""
    
    # Заменяем переносы строк на пробелы
    text = text.replace('\n', ' ').replace('\r', ' ')
    
    # Удаляем лишние пробелы
    text = ' '.join(text.split())
    
    return text.strip()


def safe_get_cell(row: List[Any], index: int, default=None) -> Any:
    """
    Безопасное извлечение значения ячейки из строки.
    
    Args:
        row: Строка Excel
        index: Индекс колонки
        default: Значение по умолчанию
        
    Returns:
        Значение ячейки или default
    """
    if index >= len(row):
        return default
    
    value = row[index]
    
    # Обработка пустых ячеек и NaN
    if value is None or isinstance(value, float) and math.isnan(value):
        return default
    
    return value


def is_empty_value(value: Any) -> bool:
    """
    Проверяет, является ли значение пустым.
    
    Args:
        value: Проверяемое значение
        
    Returns:
        True если значение пустое, иначе False
    """
    if value is None:
        return True
    
    if isinstance(value, float) and math.isnan(value):
        return True
    
    if isinstance(value, str):
        return len(value.strip()) == 0
    
    return False


def parse_numeric_value(value: Any) -> Optional[float]:
    """
    Парсит числовое значение из различных форматов.
    Обрабатывает int, float, строки с запятыми/точками, пробелами.
    
    Args:
        value: Значение для парсинга
        
    Returns:
        Число как float или None, если не удалось распарсить
    """
    if isinstance(value, bool) or is_empty_value(value):
        return None
    
    try:
        if isinstance(value, (int, float)):
            return float(value)
        elif isinstance(value, str):
            # Убираем пробелы, заменяем запятую на точку
            cleaned = value.strip().replace(',', '.').replace(' ', '')
            if cleaned:
                return float(cleaned)
        else:
            # Пробуем преобразовать напрямую
            return float(value)
    except (ValueError, TypeError, AttributeError):
        return None
    
    return None
