"""
Скрипт для отладки структуры Excel файла
Проверяет, какие данные находятся в колонках H, N и других
"""

import pandas as pd
from pathlib import Path

def debug_excel():
    """Проверяет структуру Excel файла"""
    script_dir = Path(__file__).parent
    excel_file = script_dir / "Расчёты с мехметом new.xlsx"
    
    if not excel_file.exists():
        print(f"❌ Файл Excel не найден: {excel_file}")
        return
    
    print(f"📊 Читаю Excel файл: {excel_file}")
    df = pd.read_excel(excel_file, sheet_name='Поставки', header=None)
    
    print(f"✅ Размер таблицы: {df.shape[0]} строк, {df.shape[1]} колонок")
    print(f"\n📋 Первые 5 строк (для проверки структуры):")
    print(df.head(5))
    
    print(f"\n🔍 Проверка колонок:")
    print(f"  Колонка H (индекс 7): 'Стоймость 1 ед $'")
    print(f"  Колонка N (индекс 13): 'Себестоимость с учётом карго'")
    
    # Проверяем первые 10 строк данных (пропуская заголовок)
    print(f"\n📊 Примеры данных из первых 10 строк:")
    for idx in range(1, min(11, len(df))):
        row = df.iloc[idx]
        name = row.iloc[2] if len(row) > 2 else None
        price_h = row.iloc[7] if len(row) > 7 else None
        cost_n = row.iloc[13] if len(row) > 13 else None
        
        if pd.notna(name) and str(name).strip():
            print(f"\n  Строка {idx}:")
            print(f"    Наименование: {name}")
            print(f"    Колонка H (7): {price_h} (тип: {type(price_h)})")
            print(f"    Колонка N (13): {cost_n} (тип: {type(cost_n)})")
    
    # Проверяем, есть ли данные в колонке N
    print(f"\n📈 Статистика по колонке N (индекс 13):")
    if len(df.columns) > 13:
        col_n = df.iloc[:, 13]
        non_empty = col_n[pd.notna(col_n)]
        print(f"  Всего непустых значений: {len(non_empty)}")
        print(f"  Примеры значений: {non_empty.head(10).tolist()}")
    else:
        print(f"  ❌ Колонка N (индекс 13) не существует в файле!")
        print(f"  Максимальный индекс колонки: {len(df.columns) - 1}")

if __name__ == "__main__":
    debug_excel()

