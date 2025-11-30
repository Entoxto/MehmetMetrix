"""
Скрипт для обновления цен в каталоге товаров на основе актуальных цен из поставок.
Проходит по поставкам от новых к старым и записывает самую актуальную цену для каждого товара.
"""

import json
import sys
from pathlib import Path
from typing import Dict, List

# Настраиваем кодировку вывода для Windows (чтобы эмодзи работали)
if sys.platform == 'win32':
    import io
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    except AttributeError:
        # Если уже обёрнуто, пропускаем
        pass


def update_prices_from_shipments():
    """Обновляет цены в products.json на основе актуальных цен из shipments.json"""
    
    # Определяем пути
    script_dir = Path(__file__).parent
    shipments_file = script_dir.parent / "data" / "shipments.json"
    products_file = script_dir.parent / "data" / "products.json"
    
    # Проверка существования файлов
    if not shipments_file.exists():
        print(f"❌ Файл shipments.json не найден: {shipments_file}")
        return
    
    if not products_file.exists():
        print(f"❌ Файл products.json не найден: {products_file}")
        return
    
    print(f"📖 Загружаю поставки из {shipments_file}...")
    # Загружаем поставки
    try:
        with open(shipments_file, 'r', encoding='utf-8') as f:
            shipments = json.load(f)
        print(f"✅ Загружено {len(shipments)} поставок")
    except Exception as e:
        print(f"❌ Ошибка при загрузке shipments.json: {e}")
        return
    
    print(f"📖 Загружаю каталог товаров из {products_file}...")
    # Загружаем каталог товаров
    try:
        with open(products_file, 'r', encoding='utf-8') as f:
            products_data = json.load(f)
        products = products_data.get('products', [])
        print(f"✅ Загружено {len(products)} товаров")
    except Exception as e:
        print(f"❌ Ошибка при загрузке products.json: {e}")
        return
    
    # Создаём словарь для быстрого поиска товаров по ID
    products_by_id: Dict[str, Dict] = {product['id']: product for product in products}
    
    # Словарь для отслеживания обновлённых цен
    updated_prices: Dict[str, float] = {}
    updated_count = 0
    
    print(f"📊 Обработка поставок от новых к старым...")
    # Проходим по поставкам (они уже отсортированы от новых к старым)
    for shipment in shipments:
        shipment_id = shipment.get('id', '')
        raw_items = shipment.get('rawItems', [])
        
        for item in raw_items:
            product_id = item.get('productId')
            price = item.get('price')
            
            # Пропускаем, если нет productId или цены
            if not product_id or price is None:
                continue
            
            # Если для этого товара ещё не записали цену (первая встреченная = самая актуальная)
            if product_id not in updated_prices:
                # Проверяем, что товар существует в каталоге
                if product_id in products_by_id:
                    updated_prices[product_id] = price
                    updated_count += 1
                    print(f"  ✓ {product_id}: {price} $ (из {shipment_id})")
                else:
                    print(f"  ⚠️  Товар {product_id} не найден в каталоге")
    
    print(f"\n📝 Обновление цен в каталоге...")
    # Обновляем цены в каталоге
    for product in products:
        product_id = product.get('id')
        if product_id in updated_prices:
            # Обновляем цену
            product['price'] = updated_prices[product_id]
    
    # Сохраняем обновлённый каталог
    print(f"💾 Сохраняю обновлённый каталог в {products_file}...")
    try:
        with open(products_file, 'w', encoding='utf-8') as f:
            json.dump(products_data, f, ensure_ascii=False, indent=2)
        print(f"✅ Обновлено цен: {updated_count}")
        print(f"✅ Каталог успешно сохранён!")
    except Exception as e:
        print(f"❌ Ошибка при сохранении products.json: {e}")
        return


if __name__ == "__main__":
    update_prices_from_shipments()
    print("\n" + "="*50)
    input("Нажмите Enter для выхода...")

