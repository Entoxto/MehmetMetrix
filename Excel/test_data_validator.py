"""Общие negative fixtures для Python- и TypeScript-валидаторов."""

import copy
import json
import unittest
from pathlib import Path

from data_validator import validate_generated_outputs


class SharedRuntimeValidationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        fixture_path = (
            Path(__file__).parent.parent
            / "test-fixtures"
            / "runtime-data-validation.json"
        )
        with open(fixture_path, "r", encoding="utf-8") as file:
            cls.fixtures = json.load(file)

    def validate_bundle(self, bundle):
        return validate_generated_outputs(
            bundle["shipments"],
            bundle["products"],
            bundle["meta"],
            bundle["money"],
        )

    def test_valid_shared_fixture(self):
        self.assertEqual(self.validate_bundle(self.fixtures["validBundle"]), [])

    def test_invalid_shared_fixtures(self):
        for case in self.fixtures["invalidCases"]:
            with self.subTest(name=case["name"]):
                bundle = copy.deepcopy(self.fixtures["validBundle"])
                target = bundle
                for segment in case["path"][:-1]:
                    target = target[segment]
                target[case["path"][-1]] = case["value"]
                self.assertTrue(self.validate_bundle(bundle), case["name"])


if __name__ == "__main__":
    unittest.main()
