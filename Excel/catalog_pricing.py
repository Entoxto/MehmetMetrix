"""
Логика обновления актуальных цен и себестоимости каталога из поставок.
"""

from typing import Any, Callable, Dict, Iterable, List, Tuple


LogFn = Callable[[str], None]


def extract_shipment_number(shipment: Dict[str, Any]) -> int:
    """Извлекает номер поставки из поля number или из хвоста shipment-{year}-{N}."""
    number = shipment.get("number")
    if isinstance(number, (int, float)):
        return int(number)

    shipment_id = str(shipment.get("id", ""))
    try:
        return int(shipment_id.split("-")[-1])
    except (ValueError, IndexError):
        return 0


def get_shipment_sort_key(shipment: Dict[str, Any]) -> Tuple[int, int]:
    """
    Ключ сортировки поставок от новых к старым.
    Не зависит от исходного порядка в файле.
    """
    year = shipment.get("year")
    normalized_year = int(year) if isinstance(year, (int, float)) else 0
    return (normalized_year, extract_shipment_number(shipment))


def iter_shipments_newest_first(shipments: Iterable[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Возвращает поставки в порядке от новых к старым."""
    return sorted(shipments, key=get_shipment_sort_key, reverse=True)


def collect_latest_product_values(
    shipments: Iterable[Dict[str, Any]],
) -> Tuple[Dict[str, float], Dict[str, float]]:
    """
    Собирает последние известные price/cost по productId из поставок.
    """
    latest_prices: Dict[str, float] = {}
    latest_costs: Dict[str, float] = {}

    for shipment in iter_shipments_newest_first(shipments):
        for item in shipment.get("rawItems", []):
            product_id = item.get("productId")
            if not product_id:
                continue

            price = item.get("price")
            cost = item.get("cost")

            if isinstance(price, (int, float)) and product_id not in latest_prices:
                latest_prices[product_id] = float(price)

            if isinstance(cost, (int, float)) and product_id not in latest_costs:
                latest_costs[product_id] = float(cost)

    return latest_prices, latest_costs


def apply_latest_prices(
    products_data: Dict[str, Any],
    shipments: Iterable[Dict[str, Any]],
    log: LogFn | None = None,
) -> Dict[str, Any]:
    """
    Проставляет актуальные price/cost в products_data на основе поставок.

    Возвращает сводку изменений для логов и smoke-check'ов.
    """
    products = products_data.get("products", [])
    products_by_id: Dict[str, Dict[str, Any]] = {
        product["id"]: product
        for product in products
        if isinstance(product, dict) and product.get("id")
    }

    latest_prices, latest_costs = collect_latest_product_values(shipments)
    referenced_product_ids = set(latest_prices) | set(latest_costs)
    missing_product_ids = sorted(
        product_id for product_id in referenced_product_ids if product_id not in products_by_id
    )

    updated_prices_count = 0
    updated_costs_count = 0

    for product_id, product in products_by_id.items():
        latest_price = latest_prices.get(product_id)
        latest_cost = latest_costs.get(product_id)

        if latest_price is not None and product.get("price") != latest_price:
            product["price"] = int(latest_price) if latest_price.is_integer() else latest_price
            updated_prices_count += 1

        if latest_cost is not None and product.get("cost") != latest_cost:
            product["cost"] = int(latest_cost) if latest_cost.is_integer() else latest_cost
            updated_costs_count += 1

    if log:
        log(f"✅ Актуальных цен найдено: {len(latest_prices)}")
        log(f"✅ Актуальных себестоимостей найдено: {len(latest_costs)}")
        log(f"✅ Обновлено цен в каталоге: {updated_prices_count}")
        log(f"✅ Обновлено себестоимостей в каталоге: {updated_costs_count}")
        if missing_product_ids:
            log(
                "⚠️  В поставках есть productId, которых нет в каталоге: "
                + ", ".join(missing_product_ids)
            )

    return {
        "latestPriceCount": len(latest_prices),
        "latestCostCount": len(latest_costs),
        "updatedPricesCount": updated_prices_count,
        "updatedCostsCount": updated_costs_count,
        "missingProductIds": missing_product_ids,
    }
