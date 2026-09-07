"""Download the source workbook. Publication consumes bytes without saving a file."""
import sys
from pathlib import Path
from urllib.request import Request, urlopen

SPREADSHEET_ID = "1Z8RE-Gt7itH15PuCb2tW7GffffgwzASPtMolbWSM0O0"
OUTPUT_FILENAME = "Расчёты с мехметом new.xlsx"


def download_google_sheet() -> bytes:
    request = Request(
        f"https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/export?format=xlsx",
        headers={"User-Agent": "Mozilla/5.0"},
    )
    with urlopen(request, timeout=30) as response:
        content = response.read()
    if not content.startswith(b"PK"):
        raise ValueError("Google вернул не XLSX. Проверьте доступ к таблице по ссылке.")
    return content


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
    try:
        content = download_google_sheet()
        output = Path(__file__).with_name(OUTPUT_FILENAME)
        output.write_bytes(content)
        print(f"OK: скачан {output.name} ({len(content)} байт)")
    except Exception as error:
        print(f"ERROR: {error}", file=sys.stderr)
        sys.exit(1)
