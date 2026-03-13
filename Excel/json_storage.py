"""
Небольшие helper'ы для безопасной работы с JSON-файлами пайплайна.
"""

import json
from pathlib import Path
from typing import Any


def load_json_file(path: Path) -> Any:
    """Загружает JSON-файл в UTF-8."""
    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)


def write_json_atomic(path: Path, payload: Any) -> None:
    """
    Атомарно записывает JSON в файл.

    Сначала пишет во временный `.tmp`, затем заменяет целевой файл.
    Так мы не оставляем частично записанный JSON при сбое.
    """
    path.parent.mkdir(parents=True, exist_ok=True)
    temp_path = path.with_name(f"{path.name}.tmp")

    try:
        with open(temp_path, "w", encoding="utf-8") as file:
            json.dump(payload, file, ensure_ascii=False, indent=2)
        temp_path.replace(path)
    except Exception:
        if temp_path.exists():
            temp_path.unlink()
        raise
