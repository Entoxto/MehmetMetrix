#!/usr/bin/env python3
"""Управление вертикальными объединениями ячеек блока поставки.

Колонки:
- A — номер поставки;
- F — статус поставки, только для финальных/транспортных статусов;
- J — курс, только если он заполнен;
- P — дата поступления или ETA;
- Q — всего оплачено.

Перед переносом или перестройкой строк используйте ``--mode unmerge``,
после изменения границ блока — ``--mode merge``.

Использует OAuth credentials из ~/.hermes/google/credentials/.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Iterable

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

SPREADSHEET_ID = "1Z8RE-Gt7itH15PuCb2tW7GffffgwzASPtMolbWSM0O0"
SHEET_NAME = "Поставки"
SHEET_ID = 1044131194
CREDENTIALS_DIR = Path.home() / ".hermes" / "google" / "credentials"

# Индексы колонок Google Sheets API (0-based).
COLUMN_INDEX = {
    "a": 0,  # номер поставки
    "f": 5,  # статус поставки
    "j": 9,  # курс
    "p": 15,  # дата поступления / ETA
    "q": 16,  # всего оплачено
}
COLUMN_LABELS = {
    "a": "A (номер поставки)",
    "f": "F (статус поставки)",
    "j": "J (курс)",
    "p": "P (дата поступления / ETA)",
    "q": "Q (всего оплачено)",
}
DEFAULT_COLUMNS = ("a", "f", "j", "p", "q")
MERGEABLE_STATUS_VALUES = {
    "в пути 🚚",
    "получено, не оплачено 📦",
    "получено, оплачено ✅",
}


def normalize(value: object) -> str:
    return " ".join(str(value or "").replace("\xa0", " ").split()).strip().lower()


def load_credentials(email: str) -> Credentials:
    creds_path = CREDENTIALS_DIR / f"{email}.json"
    if not creds_path.exists():
        raise FileNotFoundError(f"Credentials not found: {creds_path}")

    data = json.loads(creds_path.read_text())
    creds = Credentials(
        token=data.get("access_token"),
        refresh_token=data.get("refresh_token"),
        token_uri="https://oauth2.googleapis.com/token",
        client_id=data.get("client_id"),
        client_secret=data.get("client_secret"),
        scopes=["https://www.googleapis.com/auth/spreadsheets"],
    )
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
    return creds


def sheet_values(service) -> list[list[object]]:
    result = service.spreadsheets().values().get(
        spreadsheetId=SPREADSHEET_ID,
        range=f"{SHEET_NAME}!A:Q",
    ).execute()
    return result.get("values", [])


def find_shipment_range(
    values: list[list[object]], year: int, shipment_num: int
) -> tuple[int, int] | None:
    """Возвращает 0-based диапазон строк [start, end) поставки."""
    year_row_idx = None
    target_start_idx = None
    target_end_idx = None

    for i, row in enumerate(values):
        col_a = str(row[0]).strip() if row else ""
        if "".join(col_a.split()) == str(year):
            year_row_idx = i
            break
    if year_row_idx is None:
        return None

    for i in range(year_row_idx + 1, len(values)):
        row = values[i]
        col_a = str(row[0]).strip() if row else ""
        col_a_clean = "".join(col_a.split())

        if col_a_clean.isdigit() and len(col_a_clean) == 4 and int(col_a_clean) != year:
            if target_start_idx is not None:
                target_end_idx = i
            break

        if col_a.isdigit():
            current_num = int(col_a)
            if target_start_idx is None:
                if current_num == shipment_num:
                    target_start_idx = i
            else:
                target_end_idx = i
                break

    if target_start_idx is not None and target_end_idx is None:
        target_end_idx = len(values)
    if target_start_idx is not None and target_end_idx is not None:
        if target_start_idx < target_end_idx:
            return target_start_idx, target_end_idx
    return None


def parse_columns(raw: str | None) -> tuple[str, ...]:
    if not raw:
        return DEFAULT_COLUMNS
    columns = tuple(part.strip().lower() for part in raw.split(",") if part.strip())
    unknown = sorted(set(columns) - set(COLUMN_INDEX))
    if unknown:
        raise ValueError(
            f"Неизвестные колонки: {', '.join(unknown)}. Допустимы: A, F, J, P, Q"
        )
    if not columns:
        raise ValueError("Не указана ни одна колонка")
    return tuple(dict.fromkeys(columns))


def get_existing_merges(service) -> list[dict]:
    result = service.spreadsheets().get(
        spreadsheetId=SPREADSHEET_ID,
        fields="sheets(properties(sheetId,title),merges)",
    ).execute()
    for sheet in result.get("sheets", []):
        props = sheet.get("properties", {})
        if props.get("sheetId") == SHEET_ID or props.get("title") == SHEET_NAME:
            return sheet.get("merges", [])
    return []


def make_range(start_row: int, end_row: int, column: str) -> dict:
    col = COLUMN_INDEX[column]
    return {
        "sheetId": SHEET_ID,
        "startRowIndex": start_row,
        "endRowIndex": end_row,
        "startColumnIndex": col,
        "endColumnIndex": col + 1,
    }


def exact_merge_exists(merges: Iterable[dict], cell_range: dict) -> bool:
    keys = ("sheetId", "startRowIndex", "endRowIndex", "startColumnIndex", "endColumnIndex")
    return any(all(merge.get(key) == cell_range[key] for key in keys) for merge in merges)


def select_merge_columns(columns: tuple[str, ...], values: list[list[object]], start_row: int) -> tuple[str, ...]:
    """Оставляет только условно допустимые объединения для текущей партии."""
    selected = columns
    if "j" in selected:
        row = values[start_row] if start_row < len(values) else []
        course = row[COLUMN_INDEX["j"]] if len(row) > COLUMN_INDEX["j"] else ""
        if not normalize(course):
            print("Курс J пуст — J объединять не будем")
            selected = tuple(column for column in selected if column != "j")
    if "f" not in selected:
        return selected
    row = values[start_row] if start_row < len(values) else []
    status = normalize(row[COLUMN_INDEX["f"]] if len(row) > COLUMN_INDEX["f"] else "")
    if status in MERGEABLE_STATUS_VALUES:
        return selected
    print(f"Статус F верхней строки: {status or '[пусто]'} — F объединять не будем")
    return tuple(column for column in selected if column != "f")


def apply_layout(service, start_row: int, end_row: int, columns: tuple[str, ...], mode: str) -> None:
    if end_row - start_row <= 1:
        print("В поставке одна строка — объединение/разъединение не требуется")
        return

    merges = get_existing_merges(service)
    requests = []
    for column in columns:
        cell_range = make_range(start_row, end_row, column)
        if mode == "merge":
            # MERGE_COLUMNS — вертикальное объединение внутри каждой колонки.
            if not exact_merge_exists(merges, cell_range):
                requests.append({
                    "mergeCells": {
                        "range": cell_range,
                        "mergeType": "MERGE_COLUMNS",
                    }
                })
        else:
            # Unmerge принимает диапазон и безопасно убирает merge этой области.
            requests.append({"unmergeCells": {"range": cell_range}})

    if not requests:
        print("Нужные объединения уже находятся в требуемом состоянии")
        return

    service.spreadsheets().batchUpdate(
        spreadsheetId=SPREADSHEET_ID,
        body={"requests": requests},
    ).execute()

    # Проверяем фактическое состояние через metadata, а не только exit-code API.
    resulting_merges = get_existing_merges(service)
    if mode == "merge":
        missing = [
            column for column in columns
            if not exact_merge_exists(resulting_merges, make_range(start_row, end_row, column))
        ]
        if missing:
            raise RuntimeError(f"Google Sheets не подтвердил объединение колонок: {missing}")
    else:
        still_merged = [
            column for column in columns
            if exact_merge_exists(resulting_merges, make_range(start_row, end_row, column))
        ]
        if still_merged:
            raise RuntimeError(f"Google Sheets не подтвердил разъединение колонок: {still_merged}")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Объединяет или разъединяет служебные ячейки блока поставки"
    )
    parser.add_argument("--year", type=int, required=True)
    parser.add_argument("--shipment", type=int, required=True)
    parser.add_argument("--email", default="entoea12@gmail.com")
    parser.add_argument("--mode", choices=("merge", "unmerge"), default="merge")
    parser.add_argument(
        "--columns",
        help="Колонки через запятую: a,f,p,q. По умолчанию: a,f,p,q",
    )
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    try:
        columns = parse_columns(args.columns)
        creds = load_credentials(args.email)
        service = build("sheets", "v4", credentials=creds, cache_discovery=False)
        values = sheet_values(service)
    except Exception as exc:
        print(f"Ошибка подготовки: {exc}", file=sys.stderr)
        return 1

    range_result = find_shipment_range(values, args.year, args.shipment)
    if not range_result:
        print(f"Поставка #{args.shipment} года {args.year} не найдена", file=sys.stderr)
        return 1
    start_row, end_row = range_result

    if args.mode == "merge":
        columns = select_merge_columns(columns, values, start_row)
    print(
        f"Поставка #{args.shipment}, строки {start_row + 1}-{end_row}; "
        f"режим {args.mode}; колонки: "
        + (", ".join(COLUMN_LABELS[c] for c in columns) if columns else "нет")
    )

    if args.dry_run:
        print("Dry run: изменений не выполнено")
        return 0
    if not columns:
        print("Нет колонок для обработки")
        return 0

    try:
        apply_layout(service, start_row, end_row, columns, args.mode)
    except Exception as exc:
        print(f"Ошибка применения или проверки оформления: {exc}", file=sys.stderr)
        return 1

    print("Оформление успешно применено и проверено через metadata merges")
    return 0


if __name__ == "__main__":
    sys.exit(main())
