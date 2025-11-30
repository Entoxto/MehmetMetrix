"""
Тест результата парсинга - проверяем, что попадает в price и cost
"""
import sys
from pathlib import Path
import json

# Добавляем родительскую директорию в путь для импортов
sys.path.insert(0, str(Path(__file__).parent.parent))

from excel_parser import ExcelParser

def test_parse_result():
    try:
        script_dir = Path(__file__).parent
        excel_file = script_dir.parent / "Расчёты с мехметом new.xlsx"
        products_file = script_dir.parent.parent / "data" / "products.json"
        
        # Загружаем товары
        with open(products_file, 'r', encoding='utf-8') as f:
            products_data = json.load(f)
        
        # Извлекаем массив продуктов (products.json имеет структуру {"products": [...]})
        if isinstance(products_data, dict):
            products = products_data.get('products', [])
        elif isinstance(products_data, list):
            products = products_data
        else:
            raise ValueError(f"Неожиданная структура products.json: {type(products_data)}")
        
        # Парсим Excel
        parser = ExcelParser(str(excel_file), products)
        shipments = parser.parse()
        
        # Проверяем конкретные поставки
        test_shipments = [7, 10, 11, 12]
        
        for shipment_num in test_shipments:
            shipment = next((s for s in shipments if s.get('number') == shipment_num), None)
            if shipment:
                print(f"\n{'='*60}")
                print(f"Поставка {shipment_num}:")
                print(f"  Всего позиций: {len(shipment.get('rawItems', []))}")
                
                # Проверяем первые 3 позиции
                for i, item in enumerate(shipment.get('rawItems', [])[:3]):
                    print(f"\n  Позиция {i+1}:")
                    name = item.get('overrideName', item.get('name', 'N/A'))
                    if name and name != 'N/A':
                        print(f"    Наименование: {str(name)[:50]}...")
                    else:
                        print(f"    Наименование: N/A")
                    print(f"    price: {item.get('price', 'НЕТ')}")
                    print(f"    cost: {item.get('cost', 'НЕТ')}")
            else:
                print(f"\nПоставка {shipment_num} не найдена")
        
        print("\n" + "="*60)
    except Exception as e:
        print(f"\n{'='*60}")
        print(f"ОШИБКА: {e}")
        import traceback
        traceback.print_exc()
        print("="*60)
    finally:
        input("\nНажмите Enter для выхода...")

if __name__ == "__main__":
    test_parse_result()

