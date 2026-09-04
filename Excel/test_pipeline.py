"""Full XLSX reads, including formula caches, without generated-file side effects."""
import copy
from datetime import datetime
from contextlib import redirect_stderr
from io import BytesIO, StringIO
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from xml.etree import ElementTree as ET
from zipfile import ZipFile
from openpyxl import Workbook
from parse_excel import build_source_data
from product_id_registry import ProductIdRegistry


def workbook_bytes(missing_formula=False):
    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Поставки"
    sheet["A1"] = "№"
    sheet["A2"] = 2025
    sheet["A6"] = 2026
    positions = {
        3: (1, "Жакет из кожи (XS-2, S-1)", 3, 100, 90, 9500, datetime(2025, 9, 1)),
        4: (None, "Жакет из кожи (образец-3)", 3, 100, None, 9600, datetime(2025, 9, 2)),
        5: (2, "Жакет из кожи (10 шт., под вопросом)", 10, 110, None, 99999, "через неделю"),
        7: (1, "Куртка из меха (образец)", 1, None, None, None, datetime(2026, 1, 3)),
        8: (None, "Куртка из меха (XS-2)", 2, None, None, None, datetime(2026, 1, 5)),
    }
    caches = {}
    for row, (number, name, quantity, price, rate, cost, date) in positions.items():
        for col, value in (("A", number), ("C", name), ("H", price), ("J", rate), ("P", date)):
            sheet[f"{col}{row}"] = value
        sheet[f"F{row}"] = "В производстве 🛠️"
        for col in ("G", "I", "K", "L", "N", "O"):
            sheet[f"{col}{row}"] = "=1"
        if number is not None:
            sheet[f"Q{row}"] = "=1"
        caches[f"G{row}"] = quantity
        if cost is not None:
            caches[f"N{row}"] = cost
    sheet.merge_cells("J3:J4")
    if missing_formula:
        sheet["G5"] = 10
    stream = BytesIO()
    workbook.save(stream)
    workbook.close()
    # openpyxl deliberately does not calculate formulas. Supply cached results
    # just as the Google XLSX export does; this is not a formula-engine test.
    output = BytesIO()
    ns = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
    with ZipFile(stream) as source, ZipFile(output, "w") as target:
        for name in source.namelist():
            data = source.read(name)
            if name == "xl/worksheets/sheet1.xml":
                xml = ET.fromstring(data)
                for cell in xml.findall(".//m:c", ns):
                    if cell.attrib["r"] in caches:
                        cell.find("m:v", ns).text = str(caches[cell.attrib["r"]])
                data = ET.tostring(xml)
            target.writestr(name, data)
    output.seek(0)
    return output


class PipelineTests(unittest.TestCase):
    def test_complete_xlsx_keeps_boundaries_quantities_dates_and_registry(self):
        registry = ProductIdRegistry.empty().to_data()
        original = copy.deepcopy(registry)
        with TemporaryDirectory() as directory, redirect_stderr(StringIO()):
            result = build_source_data(workbook_bytes(), registry, Path(directory))
        self.assertEqual(registry, original)
        self.assertEqual(len(result["products"]["products"]), 2)
        self.assertEqual(result["productIdRegistry"]["nextAutoNumber"], 3)
        newest, eta, oldest = result["shipments"]
        self.assertEqual([s["id"] for s in result["shipments"]], ["shipment-2026-1", "shipment-2025-2", "shipment-2025-1"])
        self.assertEqual(newest["receivedDate"], "05.01.2026")
        self.assertEqual(eta["eta"], "через неделю")
        self.assertEqual(eta["rawItems"][0]["quantityOverride"], 10)
        self.assertTrue(eta["rawItems"][0]["underQuestion"])
        self.assertNotIn("cost", eta["rawItems"][0])
        self.assertEqual([i["cost"] for i in oldest["rawItems"]], [9500, 9600])
        self.assertEqual(oldest["rawItems"][1]["quantityOverride"], 3)
        self.assertTrue(oldest["rawItems"][1]["sample"])
        self.assertEqual(oldest["rawItems"][0]["productId"], eta["rawItems"][0]["productId"])
        self.assertTrue(all("photo" not in p for p in result["products"]["products"]))

    def test_manual_formula_replacement_returns_no_snapshot_and_preserves_input_registry(self):
        registry = ProductIdRegistry.empty().to_data()
        original = copy.deepcopy(registry)
        with TemporaryDirectory() as directory, redirect_stderr(StringIO()):
            with self.assertRaisesRegex(ValueError, "колонка G"):
                build_source_data(workbook_bytes(missing_formula=True), registry, Path(directory))
            self.assertEqual(list(Path(directory).iterdir()), [])
        self.assertEqual(registry, original)


if __name__ == "__main__":
    unittest.main()
