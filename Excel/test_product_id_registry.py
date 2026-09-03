"""Регрессии постоянного реестра productId."""

import unittest
from contextlib import redirect_stdout
from io import StringIO

from parser_utils import find_or_create_product_id
from product_id_registry import ProductIdRegistry, validate_product_id_registry


class ProductIdRegistryTests(unittest.TestCase):
    def add_product(self, registry, products, name, row=2):
        with redirect_stdout(StringIO()):
            return find_or_create_product_id(
                f"{name} (XS-1)",
                products,
                registry,
                excel_row=row,
            )

    def test_reorder_insert_remove_and_reappearance_keep_ids(self):
        registry = ProductIdRegistry.empty()
        first_catalog = []
        first_id = self.add_product(registry, first_catalog, "Жакет из кожи — первый")
        second_id = self.add_product(registry, first_catalog, "Жакет из кожи — второй", 3)

        reordered_catalog = []
        self.assertEqual(
            self.add_product(registry, reordered_catalog, "Жакет из кожи — второй"),
            second_id,
        )
        self.assertEqual(
            self.add_product(registry, reordered_catalog, "Жакет из кожи — первый", 3),
            first_id,
        )

        catalog_without_first = []
        self.add_product(registry, catalog_without_first, "Жакет из кожи — второй")
        inserted_id = self.add_product(
            registry,
            catalog_without_first,
            "Жакет из кожи — новый",
            3,
        )
        self.assertEqual(inserted_id, "auto-003")

        later_catalog = []
        next_id = self.add_product(registry, later_catalog, "Жакет из кожи — ещё один")
        restored_id = self.add_product(
            registry,
            later_catalog,
            "  ЖАКЕТ   из кожи — ПЕРВЫЙ  ",
            3,
        )
        self.assertEqual(next_id, "auto-004")
        self.assertEqual(restored_id, first_id)

    def test_registry_rejects_reused_ids(self):
        data = {
            "schemaVersion": 1,
            "nextAutoNumber": 3,
            "entries": [
                {"name": "Жакет из кожи — первый", "normalizedName": "жакет из кожи — первый", "productId": "auto-001"},
                {"name": "Жакет из кожи — второй", "normalizedName": "жакет из кожи — второй", "productId": "auto-001"},
            ],
        }
        self.assertTrue(any("уже используется" in error for error in validate_product_id_registry(data)))


if __name__ == "__main__":
    unittest.main()
