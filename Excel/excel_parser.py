"""
Основной парсер Excel файла для преобразования в JSON формат поставок.
Реализует логику согласно документу "логика парсинга.txt"

Статусы партий и позиций прокидываются как текст из Excel (без маппинга в коды).
Логика «оплачен / не оплачен» определяется на стороне TypeScript (isPaidStatus).
"""

import pandas as pd
import re
from datetime import datetime
from typing import List, Dict, Optional, Tuple, Any
from utils import (
    parse_sizes_from_name,
    find_product_id,
    parse_date,
    is_date_value,
    normalize_status_text,
    clean_eta_text,
    safe_get_cell,
    is_empty_value,
    parse_numeric_value,
)


class ExcelParser:
    """Парсер Excel файла для преобразования поставок в JSON"""
    
    # Индексы колонок
    COL_SHIPMENT_NUM = 0  # A: № Поставки
    COL_NAME = 2          # C: Наименование
    COL_POSITION_STATUS = 4  # E: Статусы позиций
    COL_SHIPMENT_STATUS = 5  # F: Статусы поставок
    COL_QUANTITY = 6      # G: Кол-во в заказе
    COL_PRICE_USD = 7     # H: Стоймость 1 ед $ (цена в долларах)
    COL_COST_WITH_CARGO = 13  # N: Себестоимость с учётом карго (в рублях) - используется для cost
    COL_DATE = 15         # P: Дата поступления продукции
    
    def __init__(self, excel_file: str, products: List[Dict]):
        """
        Инициализация парсера.
        
        Args:
            excel_file: Путь к Excel файлу
            products: Список товаров из products.json
        """
        self.excel_file = excel_file
        self.products = products
        self.current_year: Optional[int] = None
    
    def parse(self) -> List[Dict]:
        """
        Главный метод парсинга Excel файла.
        
        Returns:
            Список поставок в формате JSON
        """
        # Читаем Excel лист "Поставки"
        df = pd.read_excel(self.excel_file, sheet_name='Поставки', header=None)
        
        # Проверяем структуру файла
        self._validate_excel_structure(df)
        
        shipments = []
        current_shipment: Optional[Dict] = None
        current_shipment_rows: List[pd.Series] = []
        
        # Итерация по строкам (начиная с индекса 1, пропуская заголовок)
        for idx in range(1, len(df)):
            row = df.iloc[idx]
            
            # Проверка разделителя года
            year = self._check_year_separator(row)
            if year is not None:
                self.current_year = year
                # Завершаем текущую поставку, если есть
                if current_shipment:
                    self._finish_shipment(current_shipment, current_shipment_rows, shipments)
                    current_shipment = None
                    current_shipment_rows = []
                continue
            
            # Проверка пустой строки
            if self._is_empty_row(row):
                # Завершаем текущую поставку
                if current_shipment:
                    self._finish_shipment(current_shipment, current_shipment_rows, shipments)
                    current_shipment = None
                    current_shipment_rows = []
                continue
            
            # Проверка начала новой поставки
            shipment_num = self._get_shipment_number(row)
            name = self._get_name(row)
            
            if shipment_num is not None and name:
                # Сохраняем предыдущую поставку
                if current_shipment:
                    self._finish_shipment(current_shipment, current_shipment_rows, shipments)
                
                # Начинаем новую поставку
                current_shipment = self._create_shipment(row, shipment_num)
                current_shipment_rows = [row]
                
                # Первая строка также является позицией
                item = self._parse_item(row)
                if item:
                    current_shipment['rawItems'].append(item)
            
            # Добавляем позицию к текущей поставке
            elif name and current_shipment:
                current_shipment_rows.append(row)
                item = self._parse_item(row)
                if item:
                    current_shipment['rawItems'].append(item)
        
        # Сохраняем последнюю поставку
        if current_shipment:
            self._finish_shipment(current_shipment, current_shipment_rows, shipments)
        
        # Сортируем поставки: сначала по году (по убыванию), затем по номеру поставки (по убыванию)
        shipments.sort(key=self._get_shipment_sort_key)
        
        return shipments
    
    def _finish_shipment(
        self,
        shipment: Dict,
        rows: List[pd.Series],
        shipments_list: List[Dict]
    ) -> None:
        """
        Завершает поставку и добавляет её в список.
        
        Args:
            shipment: Словарь поставки
            rows: Все строки этой поставки
            shipments_list: Список для добавления завершённой поставки
        """
        finalized = self._finalize_shipment(shipment, rows)
        shipments_list.append(finalized)
    
    def _check_year_separator(self, row: pd.Series) -> Optional[int]:
        """
        Проверяет, является ли строка разделителем года.
        
        Args:
            row: Строка DataFrame
            
        Returns:
            Год как int или None
        """
        shipment_num = safe_get_cell(row, self.COL_SHIPMENT_NUM)
        name = safe_get_cell(row, self.COL_NAME)
        
        # Проверяем, что в колонке A только год (2024, 2025)
        if is_empty_value(shipment_num):
            return None
        
        # Пытаемся преобразовать в число
        try:
            year = int(float(shipment_num))
            # Проверяем, что это разумный год (2000-2100)
            if 2000 <= year <= 2100:
                # Проверяем, что остальные колонки пустые или почти пустые
                if is_empty_value(name):
                    return year
        except (ValueError, TypeError):
            pass
        
        return None
    
    def _get_shipment_number(self, row: pd.Series) -> Optional[int]:
        """
        Получает номер поставки из колонки A.
        
        Args:
            row: Строка DataFrame
            
        Returns:
            Номер поставки как int или None
        """
        value = safe_get_cell(row, self.COL_SHIPMENT_NUM)
        
        if is_empty_value(value):
            return None
        
        try:
            return int(float(value))
        except (ValueError, TypeError):
            return None
    
    def _get_name(self, row: pd.Series) -> Optional[str]:
        """
        Получает наименование из колонки C.
        
        Args:
            row: Строка DataFrame
            
        Returns:
            Наименование как str или None
        """
        value = safe_get_cell(row, self.COL_NAME)
        
        if is_empty_value(value):
            return None
        
        return str(value).strip()
    
    def _is_empty_row(self, row: pd.Series) -> bool:
        """
        Проверяет, является ли строка полностью пустой.
        
        Args:
            row: Строка DataFrame
            
        Returns:
            True если строка пустая
        """
        # Проверяем значимые колонки
        shipment_num = safe_get_cell(row, self.COL_SHIPMENT_NUM)
        name = safe_get_cell(row, self.COL_NAME)
        
        return is_empty_value(shipment_num) and is_empty_value(name)
    
    def _create_shipment(self, row: pd.Series, shipment_num: int) -> Dict:
        """
        Создаёт новую поставку из строки.
        
        Args:
            row: Первая строка поставки
            shipment_num: Номер поставки
            
        Returns:
            Словарь с данными поставки
        """
        # Получаем статус поставки как текст из Excel (без маппинга)
        status_raw = safe_get_cell(row, self.COL_SHIPMENT_STATUS, "")
        status = normalize_status_text(status_raw) or "В работе 🧵"
        
        shipment = {
            "id": f"shipment-{shipment_num}",
            "number": shipment_num,
            "title": f"Поставка №{shipment_num}",
            "status": status,
            "rawItems": [],
        }
        
        # Устанавливаем год, если есть
        if self.current_year is not None:
            shipment["year"] = self.current_year
        
        return shipment
    
    def _parse_item(self, row: pd.Series) -> Optional[Dict]:
        """
        Парсит позицию поставки из строки.
        
        Args:
            row: Строка DataFrame
            
        Returns:
            Словарь с данными позиции или None
        """
        # Получаем наименование
        name = self._get_name(row)
        if not name:
            return None
        
        item: Dict[str, Any] = {
            "overrideName": name,
        }
        
        # productId
        product_id = find_product_id(name, self.products)
        if product_id:
            item["productId"] = product_id
        
        # price: берём из колонки H (Стоймость 1 ед $) - цена в долларах
        price_value = self._parse_numeric_field(row, self.COL_PRICE_USD)
        if price_value is not None and price_value > 0:
            item["price"] = int(price_value) if price_value.is_integer() else price_value
        
        # cost: берём из колонки N (Себестоимость с учётом карго) - в рублях
        cost_value = self._parse_numeric_field(row, self.COL_COST_WITH_CARGO)
        if cost_value is not None and cost_value > 0:
            item["cost"] = int(cost_value) if cost_value.is_integer() else cost_value
        
        # sizes из названия
        sizes = parse_sizes_from_name(name)
        if sizes:
            item["sizes"] = sizes
        
        # quantityOverride
        quantity = safe_get_cell(row, self.COL_QUANTITY)
        if not is_empty_value(quantity):
            try:
                qty = int(float(quantity))
                # Проверяем соответствие с размерами
                sizes_sum = sum(sizes.values()) if sizes else 0
                if sizes_sum == 0 or sizes_sum != qty:
                    item["quantityOverride"] = qty
            except (ValueError, TypeError):
                pass
        
        # status — текст из Excel как есть
        status_raw = safe_get_cell(row, self.COL_POSITION_STATUS, "")
        status = normalize_status_text(status_raw)
        if status:
            item["status"] = status
        
        # inTransit (если статус содержит "В пути")
        if status and "в пути" in status.lower():
            item["inTransit"] = True
        
        # sample (если в названии есть "(образец)" или "(образец ...)")
        # Проверяем наличие слова "образец" в скобках (может быть с размерами или без)
        if re.search(r'\([^)]*образец[^)]*\)', name, re.IGNORECASE):
            item["sample"] = True
            if "quantityOverride" not in item:
                item["quantityOverride"] = 1
        
        return item
    
    def _parse_numeric_field(self, row: pd.Series, column_index: int) -> Optional[float]:
        """
        Парсит числовое значение из указанной колонки.
        
        Args:
            row: Строка DataFrame
            column_index: Индекс колонки
            
        Returns:
            Число как float или None, если значение пустое или невалидное
        """
        if len(row) <= column_index:
            return None
        
        value = safe_get_cell(row, column_index)
        return parse_numeric_value(value)
    
    def _validate_excel_structure(self, df: pd.DataFrame) -> None:
        """
        Проверяет структуру Excel файла и выводит предупреждения при проблемах.
        
        Args:
            df: DataFrame с данными Excel
        """
        num_cols = df.shape[1]
        if num_cols <= self.COL_COST_WITH_CARGO:
            print(f"⚠️  ВНИМАНИЕ: В Excel файле только {num_cols} колонок, а нужна колонка N (индекс {self.COL_COST_WITH_CARGO})")
            print(f"   Возможно, структура файла изменилась или данные в других колонках")
            return
        
        # Проверяем наличие данных в ключевых колонках
        sample_rows = min(5, len(df) - 1)
        if sample_rows == 0:
            return
        
        found_prices = 0
        found_costs = 0
        for i in range(1, sample_rows + 1):
            price_val = safe_get_cell(df.iloc[i], self.COL_PRICE_USD)
            cost_val = safe_get_cell(df.iloc[i], self.COL_COST_WITH_CARGO)
            if not is_empty_value(price_val):
                found_prices += 1
            if not is_empty_value(cost_val):
                found_costs += 1
        
        if found_prices == 0:
            print(f"⚠️  ВНИМАНИЕ: В первых {sample_rows} строках данных колонка H (индекс {self.COL_PRICE_USD}) пустая")
            print(f"   Проверьте, что в Excel файле колонка 'Стоймость 1 ед $' заполнена")
        
        if found_costs == 0:
            print(f"⚠️  ВНИМАНИЕ: В первых {sample_rows} строках данных колонка N (индекс {self.COL_COST_WITH_CARGO}) пустая")
            print(f"   Проверьте, что в Excel файле колонка 'Себестоимость с учётом карго' заполнена")
    
    def _get_shipment_sort_key(self, shipment: Dict) -> Tuple[int, int]:
        """
        Возвращает ключ для сортировки поставок.
        
        Args:
            shipment: Словарь поставки
            
        Returns:
            Кортеж (год, номер_поставки) для сортировки по убыванию
        """
        year = shipment.get('year', 0)
        # Используем поле number, если доступно, иначе извлекаем из id
        shipment_num = shipment.get('number', 0)
        if shipment_num == 0:
            shipment_id = shipment.get('id', '')
            try:
                shipment_num = int(shipment_id.split('-')[-1])
            except (ValueError, IndexError):
                shipment_num = 0
        return (-year, -shipment_num)  # Отрицательные для сортировки по убыванию
    
    def _finalize_shipment(
        self, shipment: Dict, rows: List[pd.Series]
    ) -> Dict:
        """
        Финализирует поставку: обрабатывает даты и определяет groupByPayment.
        
        Args:
            shipment: Словарь поставки
            rows: Все строки этой поставки
            
        Returns:
            Финализированная поставка
        """
        # Обработка колонки P (даты/ETA)
        received_date, eta = self._process_date_column(rows)
        
        if eta:
            shipment["eta"] = eta
        elif received_date:
            shipment["receivedDate"] = received_date
        
        # Определение groupByPayment: true если ВСЕ позиции без цены
        raw_items = shipment.get("rawItems", [])
        if raw_items:
            all_items_no_price = all(
                "price" not in item or item.get("price") is None
                for item in raw_items
            )
            if all_items_no_price:
                shipment["groupByPayment"] = True
        
        return shipment
    
    def _process_date_column(
        self, rows: List[pd.Series]
    ) -> Tuple[Optional[str], Optional[str]]:
        """
        Обрабатывает колонку P (даты/ETA) по всем строкам поставки.
        
        Args:
            rows: Все строки поставки
            
        Returns:
            Кортеж (receivedDate, eta) - приоритет у eta
        """
        dates = []
        text_values = []
        
        for row in rows:
            value = safe_get_cell(row, self.COL_DATE)
            
            if is_empty_value(value):
                continue
            
            # Проверяем, является ли значение датой
            if is_date_value(value):
                parsed_date = parse_date(value)
                if parsed_date:
                    dates.append(parsed_date)
            else:
                # Текстовое значение (ETA)
                text = str(value).strip()
                if text:
                    text_values.append(text)
        
        # Приоритет у текста (ETA)
        if text_values:
            # Берем первое текстовое значение и очищаем от переносов
            eta_text = clean_eta_text(text_values[0])
            return None, eta_text
        
        # Если есть только даты, выбираем самую позднюю
        if dates:
            # Парсим даты для сравнения
            parsed_dates = []
            for date_str in dates:
                try:
                    dt = datetime.strptime(date_str, '%d.%m.%Y')
                    parsed_dates.append((dt, date_str))
                except ValueError:
                    pass
            
            if parsed_dates:
                # Сортируем по дате и берем самую позднюю
                parsed_dates.sort(key=lambda x: x[0], reverse=True)
                return parsed_dates[0][1], None
        
        return None, None

