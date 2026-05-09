"""
Скрипт для загрузки таблицы из Google Sheets.

Загружает таблицу напрямую из Google Docs в формате xlsx,
избавляя от необходимости скачивать файл вручную.

Требования:
- Таблица должна быть доступна по ссылке (настройка "Все, у кого есть ссылка")
"""

import sys
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

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
        request = Request(
            export_url,
            headers={
                "User-Agent": "Mozilla/5.0",
            },
        )
        with urlopen(request, timeout=30) as response:
            content = response.read()
            content_type = response.headers.get("content-type", "")
        
        # Проверяем, что получили xlsx, а не HTML-страницу с ошибкой
        is_xlsx = content.startswith(b"PK")
        if not is_xlsx:
            if "text/html" in content_type:
                print(f"❌ Ошибка: таблица недоступна по ссылке.")
                print(f"   Убедитесь, что в настройках доступа выбрано")
                print(f"   'Все, у кого есть ссылка' → 'Читатель'")
                return False
            print(f"❌ Ошибка: Google вернул не XLSX-файл (content-type: {content_type or 'unknown'})")
            return False
        
        # Сохраняем файл
        with open(output_path, "wb") as f:
            f.write(content)
        
        file_size_kb = len(content) / 1024
        print(f"✅ Таблица успешно загружена: {OUTPUT_FILENAME} ({file_size_kb:.1f} KB)")
        return True
        
    except TimeoutError:
        print(f"❌ Ошибка: превышено время ожидания (30 сек)")
        return False
    except HTTPError as e:
        print(f"❌ Ошибка при загрузке: HTTP {e.code} {e.reason}")
        return False
    except URLError as e:
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
