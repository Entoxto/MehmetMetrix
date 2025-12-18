"""
Скрипт для загрузки таблицы из Google Sheets.

Загружает таблицу напрямую из Google Docs в формате xlsx,
избавляя от необходимости скачивать файл вручную.

Требования:
- Таблица должна быть доступна по ссылке (настройка "Все, у кого есть ссылка")
- pip install requests
"""

import requests
import sys
from pathlib import Path

# ID таблицы из URL: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
SPREADSHEET_ID = "1Z8RE-Gt7itH15PuCb2tW7GffffgwzASPtMolbWSM0O0"

# Имя файла для сохранения
OUTPUT_FILENAME = "Расчёты с мехметом new.xlsx"


def fetch_google_sheet():
    """Загружает таблицу из Google Sheets и сохраняет как xlsx"""
    
    script_dir = Path(__file__).parent
    output_path = script_dir / OUTPUT_FILENAME
    
    # URL для экспорта Google Sheets в формате xlsx
    export_url = f"https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/export?format=xlsx"
    
    print(f"📥 Загрузка таблицы из Google Docs...")
    print(f"   ID: {SPREADSHEET_ID}")
    
    try:
        response = requests.get(export_url, timeout=30)
        response.raise_for_status()
        
        # Проверяем, что получили xlsx, а не HTML-страницу с ошибкой
        content_type = response.headers.get('content-type', '')
        if 'spreadsheet' not in content_type and 'octet-stream' not in content_type:
            if 'text/html' in content_type:
                print(f"❌ Ошибка: таблица недоступна по ссылке.")
                print(f"   Убедитесь, что в настройках доступа выбрано")
                print(f"   'Все, у кого есть ссылка' → 'Читатель'")
                return False
        
        # Сохраняем файл
        with open(output_path, 'wb') as f:
            f.write(response.content)
        
        file_size_kb = len(response.content) / 1024
        print(f"✅ Таблица успешно загружена: {OUTPUT_FILENAME} ({file_size_kb:.1f} KB)")
        return True
        
    except requests.exceptions.Timeout:
        print(f"❌ Ошибка: превышено время ожидания (30 сек)")
        return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Ошибка при загрузке: {e}")
        return False


if __name__ == "__main__":
    # Настраиваем кодировку вывода для Windows
    if sys.platform == 'win32':
        import io
        try:
            sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
            sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
        except AttributeError:
            pass
    
    success = fetch_google_sheet()
    sys.exit(0 if success else 1)

