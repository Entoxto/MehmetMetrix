"""
Валидация сгенерированных JSON-данных пайплайна.
"""

import math
from datetime import datetime
from typing import Any, Dict, Iterable, List, Set

from catalog_pricing import collect_latest_product_values
from product_id_registry import normalize_product_name, validate_product_id_registry


ALLOWED_PRODUCT_CATEGORIES: Set[str] = {"Мех", "Замша", "Кожа", "Экзотика"}
ALLOWED_SIZE_KEYS: Set[str] = {"xs", "s", "m", "l", "xl", "OneSize"}
ALLOWED_PRODUCT_SIZES: Set[str] = {"xs", "s", "m", "l", "xl", "OneSize"}


def _is_number(value: Any) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value)


def _is_non_empty_string(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


def _is_positive_int(value: Any) -> bool:
    return isinstance(value, int) and not isinstance(value, bool) and value > 0


def _validate_raw_item(
    item: Dict[str, Any],
    shipment_id: str,
    index: int,
    errors: List[str],
) -> None:
    prefix = f"{shipment_id} → rawItems[{index}]"

    if not _is_non_empty_string(item.get("productId")):
        errors.append(f"{prefix}: отсутствует productId")

    override_name = item.get("overrideName")
    if override_name is not None and not _is_non_empty_string(override_name):
        errors.append(f"{prefix}: overrideName должен быть непустой строкой")

    status = item.get("status")
    if status is not None and not _is_non_empty_string(status):
        errors.append(f"{prefix}: status должен быть непустой строкой")

    sizes_unknown = item.get("sizesUnknown")
    if sizes_unknown is not None and not isinstance(sizes_unknown, bool):
        errors.append(f"{prefix}: sizesUnknown должен быть boolean")

    under_question = item.get("underQuestion")
    if under_question is not None and not isinstance(under_question, bool):
        errors.append(f"{prefix}: underQuestion должен быть boolean")

    for field_name in ("sample", "paidPreviously", "noPayment"):
        value = item.get(field_name)
        if value is not None and not isinstance(value, bool):
            errors.append(f"{prefix}: {field_name} должен быть boolean")

    note = item.get("note")
    if note is not None and not _is_non_empty_string(note):
        errors.append(f"{prefix}: note должен быть непустой строкой")

    sizes = item.get("sizes")
    if sizes is not None:
        if not isinstance(sizes, dict):
            errors.append(f"{prefix}: sizes должен быть объектом")
        elif sizes_unknown:
            errors.append(f"{prefix}: sizes и sizesUnknown не могут быть одновременно")
        else:
            for size_key, count in sizes.items():
                if not _is_non_empty_string(size_key):
                    errors.append(f"{prefix}: ключ размера должен быть строкой")
                elif size_key not in ALLOWED_SIZE_KEYS:
                    errors.append(
                        f"{prefix}: неизвестный размер {size_key!r}; допустимо {sorted(ALLOWED_SIZE_KEYS)}"
                    )
                if not isinstance(count, int) or isinstance(count, bool) or count < 0:
                    errors.append(f"{prefix}: размер {size_key!r} должен иметь целое количество >= 0")

    quantity_override = item.get("quantityOverride")
    if quantity_override is not None and not _is_positive_int(quantity_override):
        errors.append(f"{prefix}: quantityOverride должен быть целым числом > 0")

    if sizes is not None and quantity_override is not None:
        errors.append(f"{prefix}: sizes и quantityOverride не могут быть одновременно")

    if quantity_override is not None and sizes_unknown is not True:
        errors.append(f"{prefix}: quantityOverride допустим только вместе с sizesUnknown")

    if sizes_unknown and not _is_positive_int(quantity_override):
        errors.append(f"{prefix}: sizesUnknown требует положительного quantityOverride")

    price = item.get("price")
    if price is not None and (not _is_number(price) or float(price) <= 0):
        errors.append(f"{prefix}: price должен быть числом > 0")

    cost = item.get("cost")
    if cost is not None and (not _is_number(cost) or float(cost) <= 0):
        errors.append(f"{prefix}: cost должен быть числом > 0")


def validate_shipments(shipments: Any) -> List[str]:
    """Проверяет структуру shipments.json."""
    errors: List[str] = []

    if not isinstance(shipments, list):
        return ["shipments.json должен содержать массив поставок"]

    shipment_ids: Set[str] = set()

    for index, shipment in enumerate(shipments):
        if not isinstance(shipment, dict):
            errors.append(f"shipments[{index}] должен быть объектом")
            continue

        shipment_id = shipment.get("id")
        if not _is_non_empty_string(shipment_id):
            errors.append(f"shipments[{index}]: отсутствует id")
            shipment_id = f"shipments[{index}]"
        elif shipment_id in shipment_ids:
            errors.append(f"Повторяющийся shipment id: {shipment_id}")
        else:
            shipment_ids.add(shipment_id)

        if not _is_non_empty_string(shipment.get("title")):
            errors.append(f"{shipment_id}: отсутствует title")

        if not _is_non_empty_string(shipment.get("status")):
            errors.append(f"{shipment_id}: отсутствует status")

        year = shipment.get("year")
        if year is not None and (not isinstance(year, int) or isinstance(year, bool)):
            errors.append(f"{shipment_id}: year должен быть целым числом")

        for field_name in ("eta", "receivedDate"):
            value = shipment.get(field_name)
            if value is not None and not _is_non_empty_string(value):
                errors.append(f"{shipment_id}: {field_name} должен быть непустой строкой")

        raw_items = shipment.get("rawItems")
        if not isinstance(raw_items, list):
            errors.append(f"{shipment_id}: rawItems должен быть массивом")
            continue

        if not raw_items:
            errors.append(f"{shipment_id}: rawItems пустой")
            continue

        for item_index, item in enumerate(raw_items):
            if not isinstance(item, dict):
                errors.append(f"{shipment_id} → rawItems[{item_index}] должен быть объектом")
                continue
            _validate_raw_item(item, shipment_id, item_index, errors)

    return errors


def validate_products(products_data: Any) -> List[str]:
    """Проверяет структуру products.json."""
    errors: List[str] = []

    if not isinstance(products_data, dict):
        return ["products.json должен содержать объект верхнего уровня"]

    products = products_data.get("products")
    if not isinstance(products, list):
        return ["products.json должен содержать массив products"]

    product_ids: Set[str] = set()

    for index, product in enumerate(products):
        if not isinstance(product, dict):
            errors.append(f"products[{index}] должен быть объектом")
            continue

        product_id = product.get("id")
        if not _is_non_empty_string(product_id):
            errors.append(f"products[{index}]: отсутствует id")
            continue

        if product_id in product_ids:
            errors.append(f"Повторяющийся product id: {product_id}")
        else:
            product_ids.add(product_id)

        if not _is_non_empty_string(product.get("name")):
            errors.append(f"{product_id}: отсутствует name")

        category = product.get("category")
        if not isinstance(category, str) or category not in ALLOWED_PRODUCT_CATEGORIES:
            errors.append(
                f"{product_id}: category должна быть одной из {sorted(ALLOWED_PRODUCT_CATEGORIES)}"
            )

        photo = product.get("photo")
        if photo is not None and not _is_non_empty_string(photo):
            errors.append(f"{product_id}: photo должен быть непустой строкой")

        excel_rows = product.get("excelRows")
        if not isinstance(excel_rows, list) or not excel_rows:
            errors.append(f"{product_id}: excelRows должен быть непустым массивом строк Excel")
        elif any(
            not isinstance(row_number, int)
            or isinstance(row_number, bool)
            or row_number <= 0
            for row_number in excel_rows
        ):
            errors.append(f"{product_id}: excelRows должен содержать целые числа > 0")
        elif len(excel_rows) != len(set(excel_rows)):
            errors.append(f"{product_id}: excelRows содержит дубликаты")

        sizes = product.get("sizes")
        if not isinstance(sizes, list):
            errors.append(f"{product_id}: sizes должен быть массивом")
        else:
            for size in sizes:
                if not isinstance(size, str) or size not in ALLOWED_PRODUCT_SIZES:
                    errors.append(
                        f"{product_id}: неизвестный размер каталога {size!r}; "
                        f"допустимо {sorted(ALLOWED_PRODUCT_SIZES)}"
                    )
            valid_sizes = [size for size in sizes if isinstance(size, str)]
            if len(valid_sizes) != len(set(valid_sizes)):
                errors.append(f"{product_id}: sizes содержит дубликаты")

        materials = product.get("materials")
        if materials is not None and not isinstance(materials, dict):
            errors.append(f"{product_id}: materials должен быть объектом")
        elif isinstance(materials, dict):
            for field_name in ("outer", "lining", "comments"):
                value = materials.get(field_name)
                if value is not None and not _is_non_empty_string(value):
                    errors.append(
                        f"{product_id}: materials.{field_name} должен быть непустой строкой"
                    )

        price = product.get("price")
        if price is not None and (not _is_number(price) or float(price) <= 0):
            errors.append(f"{product_id}: price должен быть числом > 0")

        cost = product.get("cost")
        if cost is not None and (not _is_number(cost) or float(cost) <= 0):
            errors.append(f"{product_id}: cost должен быть числом > 0")

    return errors


def validate_cross_references(shipments: Iterable[Dict[str, Any]], products_data: Dict[str, Any]) -> List[str]:
    """Проверяет связи между shipments.json и products.json."""
    errors: List[str] = []
    products = products_data.get("products", [])
    product_ids = {
        product.get("id")
        for product in products
        if isinstance(product, dict) and _is_non_empty_string(product.get("id"))
    }

    for shipment in shipments:
        shipment_id = str(shipment.get("id", "<unknown-shipment>"))
        for index, item in enumerate(shipment.get("rawItems", [])):
            product_id = item.get("productId")
            if product_id and product_id not in product_ids:
                errors.append(f"{shipment_id} → rawItems[{index}]: productId {product_id!r} отсутствует в products.json")

    latest_prices, latest_costs = collect_latest_product_values(shipments)
    products_by_id = {
        product["id"]: product
        for product in products
        if isinstance(product, dict) and _is_non_empty_string(product.get("id"))
    }

    for product_id, latest_price in latest_prices.items():
        product = products_by_id.get(product_id)
        if product and product.get("price") != latest_price:
            errors.append(
                f"{product_id}: price в products.json не совпадает с последней ценой из поставок ({latest_price})"
            )

    for product_id, latest_cost in latest_costs.items():
        product = products_by_id.get(product_id)
        if product and product.get("cost") != latest_cost:
            errors.append(
                f"{product_id}: cost в products.json не совпадает с последней себестоимостью из поставок ({latest_cost})"
            )

    return errors


def validate_product_registry_links(
    products_data: Dict[str, Any],
    registry_data: Any,
) -> List[str]:
    """Проверяет, что текущий каталог использует закреплённые в реестре ID."""
    errors = validate_product_id_registry(registry_data)
    if errors or not isinstance(registry_data, dict):
        return errors

    entries = registry_data.get("entries", [])
    ids_by_name = {
        entry["normalizedName"]: entry["productId"]
        for entry in entries
        if isinstance(entry, dict)
        and isinstance(entry.get("normalizedName"), str)
        and isinstance(entry.get("productId"), str)
    }
    for product in products_data.get("products", []):
        if not isinstance(product, dict) or not _is_non_empty_string(product.get("name")):
            continue
        expected_id = ids_by_name.get(normalize_product_name(product["name"]))
        if expected_id is None:
            errors.append(f"{product.get('id', '<unknown>')}: товар отсутствует в реестре productId")
        elif product.get("id") != expected_id:
            errors.append(
                f"{product.get('id', '<unknown>')}: реестр закрепляет за товаром ID {expected_id}"
            )
    return errors


def validate_meta(meta: Any) -> List[str]:
    """Проверяет структуру meta.json."""
    errors: List[str] = []

    if not isinstance(meta, dict):
        return ["meta.json должен содержать объект"]

    updated_at = meta.get("updatedAt")
    if not _is_non_empty_string(updated_at):
        errors.append("meta.json: updatedAt должен быть непустой строкой")
    else:
        try:
            if "T" not in updated_at:
                raise ValueError
            datetime.fromisoformat(updated_at)
        except ValueError:
            errors.append("meta.json: updatedAt должен быть ISO-датой")

    if meta.get("source") != "excel":
        errors.append("meta.json: source должен быть равен 'excel'")

    return errors


def _validate_money_item_common(
    item: Dict[str, Any],
    prefix: str,
    errors: List[str],
) -> None:
    item_id = item.get("id")
    if item_id is not None and not _is_non_empty_string(item_id):
        errors.append(f"{prefix}: id должен быть непустой строкой")

    amount = item.get("amount")
    if not _is_number(amount) or float(amount) <= 0:
        errors.append(f"{prefix}: amount должен быть положительным числом")


def validate_money(money: Any) -> List[str]:
    """Проверяет ручной финансовый файл money.json."""
    errors: List[str] = []

    if not isinstance(money, dict):
        return ["money.json должен содержать объект"]

    pending_manual = money.get("pendingManual", [])
    if not isinstance(pending_manual, list):
        errors.append("money.json: pendingManual должен быть массивом")
    else:
        for index, item in enumerate(pending_manual):
            prefix = f"money.json → pendingManual[{index}]"
            if not isinstance(item, dict):
                errors.append(f"{prefix} должен быть объектом")
                continue

            _validate_money_item_common(item, prefix, errors)

            title = item.get("title")
            if not _is_non_empty_string(title):
                errors.append(f"{prefix}: title должен быть непустой строкой")

    deposits = money.get("deposits", [])
    if not isinstance(deposits, list):
        errors.append("money.json: deposits должен быть массивом")
    else:
        for index, item in enumerate(deposits):
            prefix = f"money.json → deposits[{index}]"
            if not isinstance(item, dict):
                errors.append(f"{prefix} должен быть объектом")
                continue

            _validate_money_item_common(item, prefix, errors)

            lines = item.get("lines")
            title = item.get("title")
            if lines is not None:
                if not isinstance(lines, list) or not lines:
                    errors.append(f"{prefix}: lines должен быть непустым массивом строк")
                else:
                    for line_index, line in enumerate(lines):
                        if not _is_non_empty_string(line):
                            errors.append(f"{prefix}: lines[{line_index}] должен быть непустой строкой")
            elif not _is_non_empty_string(title):
                errors.append(f"{prefix}: укажите lines или title")

    return errors


def validate_generated_outputs(
    shipments: Any,
    products_data: Any,
    meta: Any | None = None,
    money: Any | None = None,
    product_id_registry: Any | None = None,
) -> List[str]:
    """Полная проверка набора сгенерированных данных."""
    shipment_errors = validate_shipments(shipments)
    product_errors = validate_products(products_data)
    errors = [*shipment_errors, *product_errors]

    if not shipment_errors and not product_errors:
        errors.extend(validate_cross_references(shipments, products_data))

    if meta is not None:
        errors.extend(validate_meta(meta))

    if money is not None:
        errors.extend(validate_money(money))

    if product_id_registry is not None and not product_errors:
        errors.extend(validate_product_registry_links(products_data, product_id_registry))

    return errors
