"""Регрессионные тесты критической логики Excel-парсера."""

import unittest
from contextlib import redirect_stdout
from io import StringIO

import pandas as pd

from excel_parser import ExcelParser
from utils import parse_sizes_from_name


class ParserLogicTests(unittest.TestCase):
    def create_row(self, exchange_rate=None, cost=42000):
        row = pd.Series([None] * 16)
        row.iloc[2] = "Жакет из кожи — тестовый (XS-1)"
        row.iloc[7] = 100
        row.iloc[9] = exchange_rate
        row.iloc[13] = cost
        return row

    def parse_item(self, row):
        with redirect_stdout(StringIO()):
            return ExcelParser("unused.xlsx", [])._parse_item(row, excel_row=2)

    def test_duplicate_size_stops_parsing_with_excel_row(self):
        with self.assertRaisesRegex(
            ValueError,
            r"Строка 57: обнаружено дублирование размера XS",
        ):
            parse_sizes_from_name("Жакет из кожи (XS-2, XS-3)", excel_row=57)

    def test_duplicate_one_size_stops_parsing_with_excel_row(self):
        with self.assertRaisesRegex(
            ValueError,
            r"Строка 58: обнаружено дублирование размера ONE SIZE",
        ):
            parse_sizes_from_name(
                "Жакет из кожи (one size-2, OneSize-3)",
                excel_row=58,
            )

    def test_blank_exchange_rate_does_not_import_cost(self):
        item = self.parse_item(self.create_row())

        self.assertNotIn("cost", item)

    def test_non_positive_exchange_rate_does_not_import_cost(self):
        for exchange_rate in (0, -1):
            with self.subTest(exchange_rate=exchange_rate):
                item = self.parse_item(self.create_row(exchange_rate=exchange_rate))
                self.assertNotIn("cost", item)

    def test_positive_exchange_rate_imports_cost(self):
        item = self.parse_item(self.create_row(exchange_rate=95.5))

        self.assertEqual(item["cost"], 42000)


if __name__ == "__main__":
    unittest.main()
