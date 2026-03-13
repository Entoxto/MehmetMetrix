"""
Скрипт для обновления цен и себестоимости в каталоге товаров на основе актуальных данных из поставок.
Не зависит от исходного порядка shipments.json: перед обновлением сам приводит поставки к порядку от новых к старым.
"""

import sys
from pathlib import Path

from catalog_pricing import apply_latest_prices
from data_validator import validate_generated_outputs
from json_storage import load_json_file, write_json_atomic

# Настраиваем кодировку вывода для Windows (чтобы эмодзи работали)
if sys.platform == 'win32':
    import io
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    except AttributeError:
        # Если уже обёрнуто, пропускаем
        pass


def update_prices_from_shipments() -> bool:
    """Обновляет цены и себестоимость в products.json на основе актуальных данных из shipments.json."""
    script_dir = Path(__file__).parent
    shipments_file = script_dir.parent / "data" / "shipments.json"
    products_file = script_dir.parent / "data" / "products.json"

    if not shipments_file.exists():
        print(f"❌ Файл shipments.json не найден: {shipments_file}")
        return False

    if not products_file.exists():
        print(f"❌ Файл products.json не найден: {products_file}")
        return False

    print(f"📖 Загружаю поставки из {shipments_file}...")
    try:
        shipments = load_json_file(shipments_file)
        print(f"✅ Загружено {len(shipments)} поставок")
    except Exception as e:
        print(f"❌ Ошибка при загрузке shipments.json: {e}")
        return False

    print(f"📖 Загружаю каталог товаров из {products_file}...")
    try:
        products_data = load_json_file(products_file)
        products = products_data.get('products', [])
        print(f"✅ Загружено {len(products)} товаров")
    except Exception as e:
        print(f"❌ Ошибка при загрузке products.json: {e}")
        return False

    print(f"📊 Проставляю актуальные цены и себестоимость...")
    stats = apply_latest_prices(products_data, shipments, log=print)

    errors = validate_generated_outputs(shipments, products_data)
    if errors:
        print("❌ После обновления цен данные стали невалидны:")
        for error in errors:
            print(f"   - {error}")
        return False

    print(f"💾 Сохраняю обновлённый каталог в {products_file}...")
    try:
        write_json_atomic(products_file, products_data)
        print(f"✅ Обновлено цен: {stats['updatedPricesCount']}")
        print(f"✅ Обновлено себестоимостей: {stats['updatedCostsCount']}")
        print(f"✅ Каталог успешно сохранён!")
        return True
    except Exception as e:
        print(f"❌ Ошибка при сохранении products.json: {e}")
        return False


if __name__ == "__main__":
    success = update_prices_from_shipments()
    # Показываем сообщение только при интерактивном запуске (не при автоматическом вызове)
    import sys
    # Проверяем, запущен ли скрипт автоматически (через параметр --auto)
    # При автоматическом запуске сообщение не показывается
    if "--auto" not in sys.argv:
        try:
            print("\n" + "="*50)
            input("Нажмите Enter для перехода к следующему этапу...")
        except (EOFError, KeyboardInterrupt):
            # Скрипт запущен неинтерактивно
            pass
    sys.exit(0 if success else 1)
