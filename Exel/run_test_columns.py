"""
Обёртка для запуска test_columns.py из корня Exel
"""
import sys
from pathlib import Path

# Добавляем папку tests в путь
sys.path.insert(0, str(Path(__file__).parent / "tests"))

from test_columns import test_columns

if __name__ == "__main__":
    test_columns()

