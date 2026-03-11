"""
Вспомогательные функции для парсинга Excel
Утилиты для обработки данных, нормализации и преобразования
"""

import re
from collections import defaultdict
from datetime import datetime
from typing import Any, Optional, Dict, List
import pandas as pd

# Порядок размеров для каталога (product.sizes)
SIZE_ORDER = ["xs", "s", "m", "l", "xl", "onesize"]


def parse_sizes_from_name(name: str) -> Dict[str, int]:
    """
    Парсит размеры из названия: "(XS-5, S-7, M-5)" или "(one size-5)" или "(образец XS-2)"
    
    Args:
        name: Полное название товара с размерами в скобках
        
    Returns:
        Словарь размеров: {"xs": 5, "s": 7, "m": 5} или {"OneSize": 5}
        Пустой словарь, если размеров нет
    """
    if not name:
        return {}
    
    # Ищем последнюю скобку с размерами
    match = re.search(r'\(([^)]+)\)', name)
    if not match:
        return {}
    
    sizes_str = match.group(1)
    
    # Проверяем на "образец" - если только "образец" без размеров, возвращаем пустой словарь
    # Но если есть "образец" вместе с размерами (например, "образец XS-2"), парсим размеры
    if 'образец' in sizes_str.lower():
        # Убираем слово "образец" из строки для парсинга размеров
        sizes_str_cleaned = re.sub(r'образец\s*', '', sizes_str, flags=re.IGNORECASE).strip()
        # Если после удаления "образец" ничего не осталось, значит это просто образец без размеров
        if not sizes_str_cleaned:
            return {}
        # Иначе продолжаем парсить размеры из очищенной строки
        sizes_str = sizes_str_cleaned
    
    # Проверяем на "one size"
    one_size_match = re.search(r'one\s+size[-\s]*(\d+)', sizes_str, re.IGNORECASE)
    if one_size_match:
        count = int(one_size_match.group(1))
        return {"OneSize": count}
    
    # Парсим обычные размеры: XS-5, S-7, M-5
    sizes = {}
    size_pattern = r'([A-Z]+)\s*-\s*(\d+)'
    for match in re.finditer(size_pattern, sizes_str, re.IGNORECASE):
        size = match.group(1).lower()
        count = int(match.group(2))
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
    Приоритет: Экзотика (питон) > Кожа > Мех > Замша, иначе «Прочее».
    """
    if not name or not name.strip():
        return "Прочее"
    s = name.lower().strip()
    if "питон" in s:
        return "Экзотика"
    if "кож" in s:
        return "Кожа"
    if "мех" in s:
        return "Мех"
    if "замш" in s:
        return "Замша"
    return "Прочее"


def get_next_auto_id(products: List[Dict]) -> str:
    """
    Возвращает следующий уникальный id вида auto-NNN для нового товара в каталоге.
    Ищет среди product['id'] совпадения с шаблоном auto-(\\d+), берёт максимум, +1.
    """
    auto_numbers = []
    for p in products:
        pid = p.get('id') or ''
        m = re.match(r'^auto-(\d+)$', pid, re.IGNORECASE)
        if m:
            auto_numbers.append(int(m.group(1)))
    next_num = max(auto_numbers, default=0) + 1
    return f"auto-{next_num:03d}"


def find_or_create_product_id(name: str, products: List[Dict]) -> str:
    """
    Находит productId в каталоге по названию или создаёт новый товар и возвращает его id.
    Каталог (products) мутируется при создании нового товара.
    """
    clean_name = extract_product_name(name)
    if not clean_name:
        new_id = get_next_auto_id(products)
        new_product = {
            "id": new_id,
            "name": name.strip()[:200] or "Без названия",
            "category": infer_category(name),
            "photo": "",
            "sizes": [],
            "materials": {},
            "inStock": True,
            "tags": [],
        }
        products.append(new_product)
        print(f"  + Добавлен в каталог: {new_product['name']}")
        return new_id

    normalized_clean = ' '.join(clean_name.split())
    for product in products:
        product_name = product.get('name', '')
        if ' '.join(product_name.split()) == normalized_clean:
            return product.get('id', '')

    new_id = get_next_auto_id(products)
    photo_path = f"/images/products/jpg/{clean_name}.jpg"
    new_product = {
        "id": new_id,
        "name": clean_name,
        "category": infer_category(clean_name),
        "photo": photo_path,
        "sizes": [],
        "materials": {},
        "inStock": True,
        "tags": [],
    }
    products.append(new_product)
    print(f"  + Добавлен в каталог: {clean_name}")
    return new_id


def parse_product_materials(raw_value: Any) -> Dict[str, str]:
    """
    Преобразует колонку "Состав" из Excel в структуру materials каталога.
    Формат в Excel может быть свободным, поэтому используем мягкий парсинг:
    - первая содержательная строка -> outer
    - строка с "подклад" -> lining
    - всё остальное -> comments
    """
    if pd.isna(raw_value) or raw_value is None:
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
    Один проход по поставкам, без повторного парсинга Excel.
    """
    by_id = defaultdict(set)
    for shipment in shipments:
        for item in shipment.get("rawItems", []):
            pid = item.get("productId")
            if not pid:
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
    - datetime объекты pandas (pd.Timestamp)
    - datetime объекты Python
    - Строки в формате "DD.MM.YYYY"
    - Строки в формате "YYYY-MM-DD"
    
    Args:
        value: Значение даты в любом формате
        
    Returns:
        Строка в формате "DD.MM.YYYY" или None
    """
    if pd.isna(value) or value is None:
        return None
    
    # Обработка pandas Timestamp
    if isinstance(value, pd.Timestamp):
        return value.strftime('%d.%m.%Y')
    
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
    if pd.isna(value) or value is None:
        return False
    
    # Проверка на pandas Timestamp
    if isinstance(value, pd.Timestamp):
        return True
    
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
    if status is None or pd.isna(status):
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


def safe_get_cell(row: pd.Series, index: int, default=None) -> Any:
    """
    Безопасное извлечение значения ячейки из строки.
    
    Args:
        row: Строка DataFrame
        index: Индекс колонки
        default: Значение по умолчанию
        
    Returns:
        Значение ячейки или default
    """
    if index >= len(row):
        return default
    
    value = row.iloc[index]
    
    # Обработка NaN
    if pd.isna(value):
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
    
    if pd.isna(value):
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
    if is_empty_value(value):
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

