"""
Главный модуль для парсинга Excel в JSON.
Запуск: python parse_excel.py
"""

import json
import subprocess
import sys
from pathlib import Path
from excel_parser import ExcelParser


def main():
    """Главная функция парсинга"""
    # Определяем пути
    script_dir = Path(__file__).parent
    excel_file = script_dir / "Расчёты с мехметом new.xlsx"
    products_file = script_dir.parent / "data" / "products.json"
    output_file = script_dir.parent / "data" / "shipments.json"
    
    # Проверка существования файлов
    if not excel_file.exists():
        print(f"❌ Файл Excel не найден: {excel_file}")
        return
    
    if not products_file.exists():
        print(f"❌ Файл products.json не найден: {products_file}")
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
    
    print(f"📊 Парсинг Excel файла: {excel_file}...")
    # Парсим Excel
    try:
        parser = ExcelParser(str(excel_file), products)
        shipments = parser.parse()
        print(f"✅ Успешно обработано {len(shipments)} поставок")
    except Exception as e:
        print(f"❌ Ошибка при парсинге Excel: {e}")
        import traceback
        traceback.print_exc()
        return
    
    # Подсчет статистики
    total_items = sum(len(s.get('rawItems', [])) for s in shipments)
    print(f"📦 Всего позиций: {total_items}")
    
    # Сохраняем результат
    print(f"💾 Сохраняю результат в {output_file}...")
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(shipments, f, ensure_ascii=False, indent=2)
        print(f"✅ Результат успешно сохранён!")
    except Exception as e:
        print(f"❌ Ошибка при сохранении JSON: {e}")
        return
    
    # Автоматически обновляем цены в каталоге
    print("\n" + "="*50)
    print("🔄 Автоматическое обновление цен в каталоге...")
    try:
        update_prices_script = script_dir / "update_prices.py"
        result = subprocess.run(
            [sys.executable, str(update_prices_script)],
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='replace'  # Заменяем невалидные символы вместо ошибки
        )
        # Выводим результат без паузы (так как update_prices.py уже делает паузу)
        print(result.stdout)
        if result.stderr:
            print(result.stderr, file=sys.stderr)
        if result.returncode != 0:
            print(f"⚠️  Обновление цен завершилось с кодом {result.returncode}")
    except Exception as e:
        print(f"⚠️  Не удалось автоматически обновить цены: {e}")
        print(f"💡 Запустите вручную: python {script_dir / 'update_prices.py'}")
    
    print("\n" + "="*50)
    input("Нажмите Enter для выхода...")


if __name__ == "__main__":
    main()

