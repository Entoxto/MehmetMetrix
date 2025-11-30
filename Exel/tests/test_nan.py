"""
Тест обработки nan значений
"""
import sys
from pathlib import Path
import pandas as pd
import numpy as np

# Добавляем родительскую директорию в путь для импортов
sys.path.insert(0, str(Path(__file__).parent.parent))

from utils import is_empty_value, safe_get_cell

def test_nan():
    try:
        # Тест 1: Проверка is_empty_value с nan
        nan_value = float('nan')
        print(f"Тест 1: is_empty_value(nan)")
        print(f"  nan_value = {nan_value}")
        print(f"  pd.isna(nan_value) = {pd.isna(nan_value)}")
        print(f"  is_empty_value(nan_value) = {is_empty_value(nan_value)}")
        print(f"  isinstance(nan_value, float) = {isinstance(nan_value, float)}")
        
        # Тест 2: Проверка с pandas Series
        print(f"\nТест 2: Проверка с pandas Series")
        df = pd.DataFrame({'col': [1.0, np.nan, 3.0]})
        row = df.iloc[1]  # строка с nan
        val = row.iloc[0]
        print(f"  val = {val}")
        print(f"  type(val) = {type(val)}")
        print(f"  pd.isna(val) = {pd.isna(val)}")
        print(f"  is_empty_value(val) = {is_empty_value(val)}")
        
        # Тест 3: Проверка safe_get_cell
        print(f"\nТест 3: safe_get_cell с nan")
        result = safe_get_cell(row, 0)
        print(f"  result = {result}")
        print(f"  type(result) = {type(result)}")
        print(f"  is_empty_value(result) = {is_empty_value(result)}")
        
        # Тест 4: Проверка преобразования nan в float
        print(f"\nТест 4: Преобразование nan в float")
        try:
            float_val = float(nan_value)
            print(f"  float(nan) = {float_val}")
            print(f"  float_val > 0 = {float_val > 0}")
            print(f"  pd.isna(float_val) = {pd.isna(float_val)}")
        except Exception as e:
            print(f"  Ошибка: {e}")
        
        print("\n" + "="*50)
    except Exception as e:
        print(f"\n{'='*50}")
        print(f"ОШИБКА: {e}")
        import traceback
        traceback.print_exc()
        print("="*50)
    finally:
        input("\nНажмите Enter для выхода...")

if __name__ == "__main__":
    test_nan()

