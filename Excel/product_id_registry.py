"""Постоянный реестр стабильных productId, независимый от порядка строк Excel."""

import re
import unicodedata
from typing import Any, Dict, List



AUTO_ID_PATTERN = re.compile(r"^auto-(\d+)$", re.IGNORECASE)


def normalize_product_name(name: str) -> str:
    """Нормализует имя для устойчивого сопоставления между импортами."""
    normalized = unicodedata.normalize("NFKC", str(name))
    return " ".join(normalized.split()).casefold()


def validate_product_id_registry(data: Any) -> List[str]:
    """Проверяет структуру реестра и запрет повторного использования ID."""
    errors: List[str] = []
    if not isinstance(data, dict):
        return ["productIdRegistry должен содержать объект"]

    if data.get("schemaVersion") != 1:
        errors.append("productIdRegistry: schemaVersion должен быть равен 1")

    next_auto_number = data.get("nextAutoNumber")
    if (
        not isinstance(next_auto_number, int)
        or isinstance(next_auto_number, bool)
        or next_auto_number <= 0
    ):
        errors.append("productIdRegistry: nextAutoNumber должен быть целым числом > 0")

    entries = data.get("entries")
    if not isinstance(entries, list):
        errors.append("productIdRegistry: entries должен быть массивом")
        return errors

    names = set()
    product_ids = set()
    max_auto_number = 0
    for index, entry in enumerate(entries):
        prefix = f"productIdRegistry → entries[{index}]"
        if not isinstance(entry, dict):
            errors.append(f"{prefix} должен быть объектом")
            continue

        display_name = entry.get("name")
        normalized_name = entry.get("normalizedName")
        product_id = entry.get("productId")
        if not isinstance(display_name, str) or not display_name.strip():
            errors.append(f"{prefix}: name должен быть непустой строкой")
        if not isinstance(normalized_name, str) or not normalized_name.strip():
            errors.append(f"{prefix}: normalizedName должен быть непустой строкой")
        elif isinstance(display_name, str) and normalized_name != normalize_product_name(display_name):
            errors.append(f"{prefix}: normalizedName не соответствует name")
        elif normalized_name in names:
            errors.append(f"{prefix}: повторяющееся normalizedName {normalized_name!r}")
        else:
            names.add(normalized_name)

        match = AUTO_ID_PATTERN.fullmatch(product_id) if isinstance(product_id, str) else None
        if not match:
            errors.append(f"{prefix}: productId должен иметь вид auto-NNN")
        elif product_id.casefold() in product_ids:
            errors.append(f"{prefix}: productId {product_id!r} уже используется")
        else:
            product_ids.add(product_id.casefold())
            max_auto_number = max(max_auto_number, int(match.group(1)))

    if (
        isinstance(next_auto_number, int)
        and not isinstance(next_auto_number, bool)
        and next_auto_number <= max_auto_number
    ):
        errors.append(
            "productIdRegistry: nextAutoNumber должен быть больше всех выданных auto-ID"
        )

    return errors


class ProductIdRegistry:
    """Выдаёт ID один раз и сохраняет записи моделей, исчезнувших из источника."""

    def __init__(self, data: Dict[str, Any]):
        errors = validate_product_id_registry(data)
        if errors:
            raise ValueError("; ".join(errors))

        self._next_auto_number = data["nextAutoNumber"]
        self._entries_by_name = {
            entry["normalizedName"]: dict(entry) for entry in data["entries"]
        }

    @classmethod
    def empty(cls) -> "ProductIdRegistry":
        return cls({"schemaVersion": 1, "nextAutoNumber": 1, "entries": []})

    def get_or_create(self, product_name: str) -> str:
        normalized_name = normalize_product_name(product_name)
        existing = self._entries_by_name.get(normalized_name)
        if existing:
            return existing["productId"]

        product_id = f"auto-{self._next_auto_number:03d}"
        self._next_auto_number += 1
        self._entries_by_name[normalized_name] = {
            "name": " ".join(product_name.split()),
            "normalizedName": normalized_name,
            "productId": product_id,
        }
        return product_id

    def to_data(self) -> Dict[str, Any]:
        def sort_key(entry: Dict[str, str]) -> int:
            match = AUTO_ID_PATTERN.fullmatch(entry["productId"])
            return int(match.group(1)) if match else 0

        return {
            "schemaVersion": 1,
            "nextAutoNumber": self._next_auto_number,
            "entries": sorted(self._entries_by_name.values(), key=sort_key),
        }
