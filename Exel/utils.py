"""
Вспомогательные функции для парсинга Excel
Утилиты для обработки данных, нормализации и преобразования
"""

import re
from datetime import datetime
from typing import Any, Optional, Dict, List
import pandas as pd


def parse_sizes_from_name(name: str) -> Dict[str, int]:
    """
    Парсит размеры из названия: "(XS-5, S-7, M-5)" или "(one size-5)"
    
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
    
    # Проверяем на "образец"
    if 'образец' in sizes_str.lower():
        return {}
    
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


def find_product_id(name: str, products: List[Dict]) -> Optional[str]:
    """
    Находит productId в каталоге товаров по названию.
    
    Args:
        name: Полное название из Excel
        products: Список товаров из products.json
        
    Returns:
        product.id или None, если не найден
    """
    if not name or not products:
        return None
    
    # Очищаем название от размеров и нормализуем пробелы
    clean_name = extract_product_name(name)
    
    # Нормализуем пробелы в названиях из каталога для сравнения
    for product in products:
        product_name = product.get('name', '')
        # Нормализуем пробелы в названии из каталога
        normalized_product_name = ' '.join(product_name.split())
        
        if normalized_product_name == clean_name:
            return product.get('id')
    
    # Логируем предупреждение
    print(f"⚠️  Товар не найден в каталоге: {clean_name}")
    return None


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


def normalize_position_status(status: str) -> Optional[str]:
    """
    Нормализует статус позиции из Excel в формат JSON.
    
    Args:
        status: Статус из колонки E (Статусы позиций)
        
    Returns:
        Нормализованный статус или None
    """
    if not status or pd.isna(status):
        return None
    
    status = str(status).strip()
    
    # Маппинг статусов
    status_map = {
        "Получено, оплачено ✅": "received",
        "Получено, не оплачено 📦": "received_unpaid",
        "В производстве 🛠️": "in_progress",
        "Готово, ожидает отправки 🕒": "ready",
        "В пути 🚚": "in_progress",  # inTransit устанавливается отдельно
    }
    
    return status_map.get(status)


def normalize_shipment_status(status: str) -> str:
    """
    Нормализует статус поставки из Excel в формат JSON.
    
    Args:
        status: Статус из колонки F (Статусы поставок)
        
    Returns:
        Нормализованный статус (по умолчанию "inProgress")
    """
    if not status or pd.isna(status):
        return "inProgress"
    
    status = str(status).strip()
    
    # Маппинг статусов
    status_map = {
        "Получено, оплачено ✅": "receivedPaid",
        "Получено, не оплачено 📦": "receivedUnpaid",
        "Готово, ожидает отправки 🕒": "done",
        "В пути 🚚": "inTransit",
        "В работе 🧵": "inProgress",
    }
    
    return status_map.get(status, "inProgress")


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

