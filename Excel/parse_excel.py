"""
Главный скрипт парсинга Excel файла для преобразования в JSON формат поставок.
После парсинга обновляет каталог в памяти, валидирует generated data и только потом пишет JSON на диск.
"""

import sys
from pathlib import Path
from datetime import datetime, timezone
from catalog_pricing import apply_latest_prices
from data_validator import validate_generated_outputs
from excel_parser import ExcelParser
from json_storage import write_json_atomic
from utils import infer_category, aggregate_product_sizes

# Настраиваем кодировку вывода для Windows (чтобы эмодзи работали)
if sys.platform == 'win32':
    import io
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    except AttributeError:
        # Если уже обёрнуто, пропускаем
        pass


def build_meta() -> dict:
    """Формирует метаданные об обновлении данных."""
    return {
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "source": "excel",
    }


def parse_excel() -> bool:
    """Парсит Excel файл, собирает generated data и сохраняет её только после валидации."""
    script_dir = Path(__file__).parent
    excel_file = script_dir / "Расчёты с мехметом new.xlsx"
    products_file = script_dir.parent / "data" / "products.json"
    shipments_file = script_dir.parent / "data" / "shipments.json"
    meta_file = script_dir.parent / "data" / "meta.json"

    if not excel_file.exists():
        print(f"❌ Excel файл не найден: {excel_file}")
        print(f"   Убедитесь, что файл 'Расчёты с мехметом new.xlsx' находится в папке Excel/")
        return False

    print(f"📂 Собираю каталог заново из Excel...")
    products_data = {"products": []}
    products = products_data["products"]

    print(f"\n📊 Парсинг Excel файла: {excel_file}...")
    # Создаём парсер и парсим
    try:
        parser = ExcelParser(str(excel_file), products)
        shipments = parser.parse()
        print(f"✅ Успешно обработано {len(shipments)} поставок")
        
        # Подсчитываем общее количество позиций
        total_items = sum(len(shipment.get('rawItems', [])) for shipment in shipments)
        print(f"📦 Всего позиций: {total_items}")
        
    except Exception as e:
        print(f"❌ Ошибка при парсинге Excel файла: {e}")
        import traceback
        traceback.print_exc()
        return False

    # Собираем размеры каталога из всех позиций поставок (один проход)
    aggregate_product_sizes(shipments, products)

    # Обновляем категорию у всех товаров по названию (при каждом парсинге — полное обновление)
    for product in products:
        name = product.get("name", "")
        if name:
            product["category"] = infer_category(name)

    print(f"\n" + "="*50)
    print(f"🔄 Обновляю цены и себестоимость каталога в памяти...")
    pricing_stats = apply_latest_prices(products_data, shipments, log=print)
    meta = build_meta()

    errors = validate_generated_outputs(shipments, products_data, meta)
    if errors:
        print("\n❌ Generated data не прошли валидацию:")
        for error in errors:
            print(f"   - {error}")
        return False

    print(f"\n💾 Сохраняю validated data...")
    try:
        write_json_atomic(shipments_file, shipments)
        print(f"✅ Поставки сохранены: {shipments_file}")
        write_json_atomic(products_file, products_data)
        print(f"✅ Каталог сохранён: {products_file}")
        write_json_atomic(meta_file, meta)
        print(f"✅ Метаданные сохранены: {meta_file}")
        print(f"\n✅ Парсинг, обновление цен и валидация завершены успешно!")
        if pricing_stats["missingProductIds"]:
            print(
                "⚠️  Обнаружены productId без карточки каталога: "
                + ", ".join(pricing_stats["missingProductIds"])
            )
        return True
    except Exception as e:
        print(f"❌ Ошибка при сохранении generated data: {e}")
        return False


if __name__ == "__main__":
    success = parse_excel()
    # Показываем сообщение только при интерактивном запуске (не при автоматическом вызове)
    import sys
    # Проверяем, запущен ли скрипт автоматически (через параметр --auto)
    if "--auto" not in sys.argv:
        try:
            print("\n" + "="*50)
            input("Нажмите Enter для выхода...")
        except (EOFError, KeyboardInterrupt):
            # Скрипт запущен неинтерактивно
            pass
    sys.exit(0 if success else 1)
