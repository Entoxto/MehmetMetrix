"""Синхронизирует производные WebP-версии с каталогом исходных JPG."""

import io
import sys
from pathlib import Path

FULL_QUALITY = 85
CARD_QUALITY = 80
CARD_MAX_SIZE = (960, 1200)


def configure_windows_console() -> None:
    """Включает UTF-8 для прямого запуска скрипта в Windows-консоли."""
    if sys.platform != "win32":
        return

    try:
        sys.stdout = io.TextIOWrapper(
            sys.stdout.buffer, encoding="utf-8", errors="replace"
        )
        sys.stderr = io.TextIOWrapper(
            sys.stderr.buffer, encoding="utf-8", errors="replace"
        )
    except AttributeError:
        pass


def needs_refresh(source_path: Path, target_path: Path) -> bool:
    """Проверяет отсутствие варианта или изменение исходника по mtime/ctime."""
    if not target_path.exists():
        return True

    source_stat = source_path.stat()
    source_changed_at = max(source_stat.st_mtime_ns, source_stat.st_ctime_ns)
    return target_path.stat().st_mtime_ns < source_changed_at


def convert_to_webp(
    input_path: Path,
    output_path: Path,
    quality: int,
    max_size: tuple[int, int] | None = None,
) -> tuple[int, int]:
    """Конвертирует JPG в WebP и возвращает размеры исходника и результата."""
    from PIL import Image

    output_path.parent.mkdir(parents=True, exist_ok=True)

    with Image.open(input_path) as source_image:
        if source_image.mode in ("RGBA", "LA", "P"):
            image = source_image.convert("RGBA")
        elif source_image.mode != "RGB":
            image = source_image.convert("RGB")
        else:
            image = source_image.copy()

        if max_size is not None:
            image.thumbnail(max_size, Image.Resampling.LANCZOS)

        image.save(output_path, "WebP", quality=quality, method=6)

    return input_path.stat().st_size, output_path.stat().st_size


def ensure_variant(
    source_path: Path,
    target_path: Path,
    *,
    quality: int,
    max_size: tuple[int, int] | None = None,
) -> tuple[bool, int]:
    """Обновляет вариант при необходимости; возвращает факт конвертации и размер."""
    if not needs_refresh(source_path, target_path):
        return False, target_path.stat().st_size

    _, target_size = convert_to_webp(
        source_path,
        target_path,
        quality=quality,
        max_size=max_size,
    )
    return True, target_size


def get_expected_variant_paths(
    image_files: list[Path],
    webp_dir: Path,
    card_webp_dir: Path,
) -> set[Path]:
    """Возвращает полный набор WebP, который должен существовать для исходных JPG."""
    expected_paths: set[Path] = set()

    for image_path in image_files:
        webp_filename = f"{image_path.stem}.webp"
        expected_paths.add((webp_dir / webp_filename).absolute())
        expected_paths.add((card_webp_dir / webp_filename).absolute())

    return expected_paths


def find_stale_variants(
    image_files: list[Path],
    webp_dir: Path,
    card_webp_dir: Path,
) -> list[Path]:
    """Находит производные WebP, для которых больше нет исходного JPG/JPEG."""
    if not webp_dir.exists():
        return []

    expected_paths = get_expected_variant_paths(
        image_files,
        webp_dir,
        card_webp_dir,
    )

    return sorted(
        (
            candidate
            for candidate in webp_dir.rglob("*")
            if candidate.is_file()
            and candidate.suffix.lower() == ".webp"
            and candidate.absolute() not in expected_paths
        ),
        key=lambda candidate: candidate.as_posix().casefold(),
    )


def prune_stale_variants(
    image_files: list[Path],
    webp_dir: Path,
    card_webp_dir: Path,
) -> list[Path]:
    """Удаляет только лишние .webp внутри проверенного каталога производных файлов."""
    stale_variants = find_stale_variants(
        image_files,
        webp_dir,
        card_webp_dir,
    )
    webp_root = webp_dir.resolve()

    # Сначала проверяем весь набор и только потом начинаем удаление.
    for stale_path in stale_variants:
        if stale_path.is_symlink():
            raise RuntimeError(
                f"Отказ от удаления символической ссылки: {stale_path}"
            )

        resolved_path = stale_path.resolve()
        if not resolved_path.is_relative_to(webp_root):
            raise RuntimeError(
                f"Отказ от удаления файла вне {webp_root}: {resolved_path}"
            )

    for stale_path in stale_variants:
        stale_path.unlink()

    return stale_variants


def main() -> int:
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    jpg_dir = project_root / "public" / "images" / "products" / "jpg"
    webp_dir = project_root / "public" / "images" / "products" / "webp"
    card_webp_dir = webp_dir / "card"

    if not jpg_dir.exists():
        print(f"❌ Папка не найдена: {jpg_dir}")
        print("💡 Сначала запустите scripts/migrate_images.py для перемещения файлов")
        return 1

    image_files = sorted(
        image_path
        for image_path in jpg_dir.iterdir()
        if image_path.is_file() and image_path.suffix.lower() in {".jpg", ".jpeg"}
    )

    source_by_stem: dict[str, Path] = {}
    for image_path in image_files:
        normalized_stem = image_path.stem.casefold()
        existing_source = source_by_stem.get(normalized_stem)
        if existing_source is not None:
            print(
                "❌ Два исходника создают один WebP: "
                f"{existing_source.name}, {image_path.name}"
            )
            return 1
        source_by_stem[normalized_stem] = image_path

    webp_dir.mkdir(parents=True, exist_ok=True)
    card_webp_dir.mkdir(parents=True, exist_ok=True)

    project_root_resolved = project_root.resolve()
    for generated_dir in (webp_dir, card_webp_dir):
        if not generated_dir.resolve().is_relative_to(project_root_resolved):
            print(
                "❌ Каталог производных изображений находится вне проекта: "
                f"{generated_dir.resolve()}"
            )
            return 1

    try:
        removed_variants = prune_stale_variants(
            image_files,
            webp_dir,
            card_webp_dir,
        )
    except Exception as error:
        print(f"❌ Не удалось безопасно очистить производные WebP: {error}")
        return 1

    print(f"📸 Найдено {len(image_files)} изображений для проверки\n")
    if removed_variants:
        print("🧹 Удалены WebP без исходного JPG/JPEG:")
        for removed_path in removed_variants:
            print(f"   - {removed_path.relative_to(webp_dir)}")
        print()

    total_original_size = 0
    total_full_size = 0
    total_card_size = 0
    converted_full_count = 0
    converted_card_count = 0
    errors = 0

    for image_path in image_files:
        webp_filename = f"{image_path.stem}.webp"
        full_path = webp_dir / webp_filename
        card_path = card_webp_dir / webp_filename
        total_original_size += image_path.stat().st_size

        try:
            converted_full, full_size = ensure_variant(
                image_path,
                full_path,
                quality=FULL_QUALITY,
            )
            converted_card, card_size = ensure_variant(
                image_path,
                card_path,
                quality=CARD_QUALITY,
                max_size=CARD_MAX_SIZE,
            )
        except Exception as error:
            errors += 1
            print(f"❌ {image_path.name}: {error}")
            continue

        total_full_size += full_size
        total_card_size += card_size
        converted_full_count += int(converted_full)
        converted_card_count += int(converted_card)

        statuses = []
        if converted_full:
            statuses.append("full")
        if converted_card:
            statuses.append("card")
        status = f"обновлены {', '.join(statuses)}" if statuses else "актуально"
        print(
            f"{'🔄' if statuses else '✓'} {image_path.name}: {status}; "
            f"{full_size / 1024:.1f} KB / {card_size / 1024:.1f} KB"
        )

    print(f"\n{'=' * 60}")
    print("📊 ИТОГОВАЯ СТАТИСТИКА:")
    print(f"   Полноразмерных WebP обновлено: {converted_full_count}")
    print(f"   Карточных WebP обновлено: {converted_card_count}")
    print(f"   Устаревших WebP удалено: {len(removed_variants)}")
    print(f"   Ошибок: {errors}")
    print(f"   Размер JPG: {total_original_size / 1024 / 1024:.2f} MB")
    print(f"   Размер полноразмерных WebP: {total_full_size / 1024 / 1024:.2f} MB")
    print(f"   Размер карточных WebP: {total_card_size / 1024 / 1024:.2f} MB")
    print(f"{'=' * 60}")

    return 1 if errors else 0


if __name__ == "__main__":
    configure_windows_console()
    exit_code = main()
    if "--auto" not in sys.argv:
        try:
            input("\nНажмите Enter для выхода...")
        except (EOFError, KeyboardInterrupt):
            pass
    raise SystemExit(exit_code)
