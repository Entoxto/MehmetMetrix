"""
Главный скрипт парсинга Excel файла для преобразования в JSON формат поставок.
Автоматически запускает update_prices.py после парсинга для обновления цен и себестоимости.
"""

import json
import sys
import subprocess
from pathlib import Path
from excel_parser import ExcelParser
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


def parse_excel():
    """Парсит Excel файл и сохраняет результат в shipments.json"""
    
    # Определяем пути
    script_dir = Path(__file__).parent
    excel_file = script_dir / "Расчёты с мехметом new.xlsx"
    products_file = script_dir.parent / "data" / "products.json"
    shipments_file = script_dir.parent / "data" / "shipments.json"
    
    # Проверка существования Excel файла
    if not excel_file.exists():
        print(f"❌ Excel файл не найден: {excel_file}")
        print(f"   Убедитесь, что файл 'Расчёты с мехметом new.xlsx' находится в папке Excel/")
        return
    
    # Каталог каждый раз собирается заново из Excel (полная пересборка)
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
        return
    
    # Сохраняем поставки
    print(f"\n💾 Сохраняю результат в {shipments_file}...")
    try:
        with open(shipments_file, 'w', encoding='utf-8') as f:
            json.dump(shipments, f, ensure_ascii=False, indent=2)
        print(f"✅ Поставки сохранены!")
    except Exception as e:
        print(f"❌ Ошибка при сохранении shipments.json: {e}")
        return

    # Собираем размеры каталога из всех позиций поставок (один проход)
    aggregate_product_sizes(shipments, products)

    # Обновляем категорию у всех товаров по названию (при каждом парсинге — полное обновление)
    for product in products:
        name = product.get("name", "")
        if name:
            product["category"] = infer_category(name)

    # Сохраняем каталог (полностью собранный из текущего Excel)
    print(f"💾 Сохраняю каталог в {products_file}...")
    try:
        with open(products_file, 'w', encoding='utf-8') as f:
            json.dump(products_data, f, ensure_ascii=False, indent=2)
        print(f"✅ Каталог сохранён!")
    except Exception as e:
        print(f"❌ Ошибка при сохранении products.json: {e}")
        return

    # Автоматически запускаем обновление цен и себестоимости
    print(f"\n" + "="*50)
    print(f"🔄 Автоматическое обновление цен и себестоимости в каталоге...")
    try:
        update_script = script_dir / "update_prices.py"
        if update_script.exists():
            result = subprocess.run(
                [sys.executable, str(update_script), "--auto"],
                cwd=str(script_dir),
                capture_output=False,
                text=True
            )
            if result.returncode == 0:
                print(f"\n✅ Парсинг и обновление цен и себестоимости завершены успешно!")
            else:
                print(f"\n⚠️  Парсинг завершён, но обновление цен и себестоимости завершилось с ошибкой")
        else:
            print(f"⚠️  Скрипт update_prices.py не найден, пропускаю обновление цен и себестоимости")
    except Exception as e:
        print(f"⚠️  Ошибка при запуске update_prices.py: {e}")
        print(f"   Вы можете запустить его вручную: python Excel/update_prices.py")


if __name__ == "__main__":
    parse_excel()
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

