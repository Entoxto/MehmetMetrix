"""
CLI smoke-check для generated data.

Проверяет согласованность:
- data/shipments.json
- data/products.json
- data/meta.json
"""

import sys
from pathlib import Path

from data_validator import validate_generated_outputs
from json_storage import load_json_file

if sys.platform == "win32":
    import io

    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")
    except AttributeError:
        pass


def validate_generated_data() -> bool:
    script_dir = Path(__file__).parent
    data_dir = script_dir.parent / "data"

    shipments_file = data_dir / "shipments.json"
    products_file = data_dir / "products.json"
    meta_file = data_dir / "meta.json"

    try:
        shipments = load_json_file(shipments_file)
        products_data = load_json_file(products_file)
        meta = load_json_file(meta_file)
    except FileNotFoundError as error:
        print(f"❌ Не найден файл для проверки: {error.filename}")
        return False
    except Exception as error:
        print(f"❌ Не удалось загрузить generated data: {error}")
        return False

    errors = validate_generated_outputs(shipments, products_data, meta)
    if errors:
        print("ERROR: Проверка generated data не пройдена:")
        for error in errors:
            print(f"   - {error}")
        return False

    print("OK: Generated data валидны")
    print(f"   Поставок: {len(shipments)}")
    print(f"   Товаров: {len(products_data.get('products', []))}")
    print(f"   Обновлено: {meta.get('updatedAt')}")
    return True


if __name__ == "__main__":
    sys.exit(0 if validate_generated_data() else 1)
