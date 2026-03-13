"""
Валидация сгенерированных JSON-данных пайплайна.
"""

from datetime import datetime
from typing import Any, Dict, Iterable, List, Set

from catalog_pricing import collect_latest_product_values


ALLOWED_PRODUCT_CATEGORIES: Set[str] = {"Мех", "Замша", "Кожа", "Экзотика"}


def _is_number(value: Any) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def _is_non_empty_string(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


def _validate_raw_item(
    item: Dict[str, Any],
    shipment_id: str,
    index: int,
    errors: List[str],
) -> None:
    prefix = f"{shipment_id} → rawItems[{index}]"

    if not _is_non_empty_string(item.get("productId")):
        errors.append(f"{prefix}: отсутствует productId")

    status = item.get("status")
    if status is not None and not _is_non_empty_string(status):
        errors.append(f"{prefix}: status должен быть непустой строкой")

    sizes = item.get("sizes")
    if sizes is not None:
        if not isinstance(sizes, dict):
            errors.append(f"{prefix}: sizes должен быть объектом")
        else:
            for size_key, count in sizes.items():
                if not _is_non_empty_string(size_key):
                    errors.append(f"{prefix}: ключ размера должен быть строкой")
                if not isinstance(count, int) or count < 0:
                    errors.append(f"{prefix}: размер {size_key!r} должен иметь целое количество >= 0")

    quantity_override = item.get("quantityOverride")
    if quantity_override is not None and (not isinstance(quantity_override, int) or quantity_override < 0):
        errors.append(f"{prefix}: quantityOverride должен быть целым числом >= 0")

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
        if year is not None and not isinstance(year, int):
            errors.append(f"{shipment_id}: year должен быть целым числом")

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
        if category not in ALLOWED_PRODUCT_CATEGORIES:
            errors.append(
                f"{product_id}: category должна быть одной из {sorted(ALLOWED_PRODUCT_CATEGORIES)}"
            )

        photo = product.get("photo")
        if photo is not None and not isinstance(photo, str):
            errors.append(f"{product_id}: photo должен быть строкой")

        sizes = product.get("sizes")
        if not isinstance(sizes, list):
            errors.append(f"{product_id}: sizes должен быть массивом")
        elif len(sizes) != len(set(sizes)):
            errors.append(f"{product_id}: sizes содержит дубликаты")

        if not isinstance(product.get("inStock"), bool):
            errors.append(f"{product_id}: inStock должен быть boolean")

        tags = product.get("tags")
        if tags is not None and not isinstance(tags, list):
            errors.append(f"{product_id}: tags должен быть массивом")

        materials = product.get("materials")
        if materials is not None and not isinstance(materials, dict):
            errors.append(f"{product_id}: materials должен быть объектом")

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
            datetime.fromisoformat(updated_at)
        except ValueError:
            errors.append("meta.json: updatedAt должен быть ISO-датой")

    if meta.get("source") != "excel":
        errors.append("meta.json: source должен быть равен 'excel'")

    return errors


def validate_generated_outputs(
    shipments: Any,
    products_data: Any,
    meta: Any | None = None,
) -> List[str]:
    """Полная проверка набора сгенерированных данных."""
    errors = []
    errors.extend(validate_shipments(shipments))
    errors.extend(validate_products(products_data))

    if isinstance(shipments, list) and isinstance(products_data, dict):
        errors.extend(validate_cross_references(shipments, products_data))

    if meta is not None:
        errors.extend(validate_meta(meta))

    return errors
