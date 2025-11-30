"""
Диагностический скрипт для проверки индексов колонок
"""
import sys
from pathlib import Path
import pandas as pd

# Добавляем родительскую директорию в путь для импортов
sys.path.insert(0, str(Path(__file__).parent.parent))

def test_columns():
    try:
        script_dir = Path(__file__).parent
        excel_file = script_dir.parent / "Расчёты с мехметом new.xlsx"
        
        df = pd.read_excel(excel_file, sheet_name='Поставки', header=None)
        
        # Проверяем строку 50 (shipment-7) - должна иметь данные
        row_50 = df.iloc[50]
        print(f"Строка 50 (shipment-7):")
        print(f"  Длина строки: {len(row_50)}")
        print(f"  Колонка 10 (K): {row_50.iloc[10] if len(row_50) > 10 else 'N/A'} (тип: {type(row_50.iloc[10]) if len(row_50) > 10 else 'N/A'})")
        print(f"  Колонка 13 (N): {row_50.iloc[13] if len(row_50) > 13 else 'N/A'} (тип: {type(row_50.iloc[13]) if len(row_50) > 13 else 'N/A'})")
        
        # Проверяем строку 75 (shipment-12) - должна иметь 0
        row_75 = df.iloc[75]
        print(f"\nСтрока 75 (shipment-12):")
        print(f"  Длина строки: {len(row_75)}")
        print(f"  Колонка 10 (K): {row_75.iloc[10] if len(row_75) > 10 else 'N/A'} (тип: {type(row_75.iloc[10]) if len(row_75) > 10 else 'N/A'})")
        print(f"  Колонка 13 (N): {row_75.iloc[13] if len(row_75) > 13 else 'N/A'} (тип: {type(row_75.iloc[13]) if len(row_75) > 13 else 'N/A'})")
        
        # Проверяем строку 58 (shipment-10) - должна иметь данные
        row_58 = df.iloc[58]
        print(f"\nСтрока 58 (shipment-10):")
        print(f"  Длина строки: {len(row_58)}")
        print(f"  Колонка 10 (K): {row_58.iloc[10] if len(row_58) > 10 else 'N/A'} (тип: {type(row_58.iloc[10]) if len(row_58) > 10 else 'N/A'})")
        print(f"  Колонка 13 (N): {row_58.iloc[13] if len(row_58) > 13 else 'N/A'} (тип: {type(row_58.iloc[13]) if len(row_58) > 13 else 'N/A'})")
        
        # Проверяем строку 67 (shipment-11) - должна иметь 0
        row_67 = df.iloc[67]
        print(f"\nСтрока 67 (shipment-11):")
        print(f"  Длина строки: {len(row_67)}")
        print(f"  Колонка 10 (K): {row_67.iloc[10] if len(row_67) > 10 else 'N/A'} (тип: {type(row_67.iloc[10]) if len(row_67) > 10 else 'N/A'})")
        print(f"  Колонка 13 (N): {row_67.iloc[13] if len(row_67) > 13 else 'N/A'} (тип: {type(row_67.iloc[13]) if len(row_67) > 13 else 'N/A'})")
        
        # Проверяем заголовок (строка 0) для понимания структуры
        print(f"\nЗаголовок (строка 0):")
        header = df.iloc[0]
        for i in range(min(20, len(header))):
            val = header.iloc[i]
            if pd.notna(val) and str(val).strip():
                print(f"  Колонка {i}: {val}")
        
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
    test_columns()

