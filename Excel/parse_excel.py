"""Read XLSX + registry from stdin and emit a candidate; never write project data.

The Node entry point owns catalog prices, snapshot validation and atomic files.
"""
import argparse
import json
import sys
from contextlib import redirect_stdout
from datetime import datetime, timezone
from io import BytesIO
from pathlib import Path
from excel_parser import ExcelParser
from fetch_google_sheet import download_google_sheet
from parser_utils import aggregate_product_sizes, assign_product_photos
from product_id_registry import ProductIdRegistry


def build_source_data(excel_source, registry_data, jpg_dir: Path) -> dict:
    registry = ProductIdRegistry(registry_data)
    products = []
    with redirect_stdout(sys.stderr):
        shipments = ExcelParser(excel_source, products, registry).parse()
    aggregate_product_sizes(shipments, products)
    assign_product_photos(products, jpg_dir)
    return {
        "shipments": shipments,
        "products": {"products": products},
        "meta": {"updatedAt": datetime.now(timezone.utc).isoformat(), "source": "excel"},
        "productIdRegistry": registry.to_data(),
    }


if __name__ == "__main__":
    sys.stdin.reconfigure(encoding="utf-8")
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
    args_parser = argparse.ArgumentParser(description=__doc__)
    source = args_parser.add_mutually_exclusive_group()
    source.add_argument("--fetch", action="store_true")
    source.add_argument("--file", type=Path, default=Path(__file__).with_name("Расчёты с мехметом new.xlsx"))
    args = args_parser.parse_args()
    try:
        registry_data = json.load(sys.stdin)
        excel_source = BytesIO(download_google_sheet()) if args.fetch else args.file
        data = build_source_data(excel_source, registry_data, Path(__file__).parent.parent / "public/images/products/jpg")
        json.dump(data, sys.stdout, ensure_ascii=False, allow_nan=False)
    except Exception as error:
        print(f"ERROR: {error}", file=sys.stderr)
        sys.exit(1)
