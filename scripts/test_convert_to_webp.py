"""Регрессионные тесты синхронизации производных изображений."""

import sys
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory

sys.path.insert(0, str(Path(__file__).parent))

from convert_to_webp import convert_to_webp, prune_stale_variants


class WebpSyncTests(unittest.TestCase):
    def test_card_variant_preserves_full_portrait_inside_square(self) -> None:
        try:
            from PIL import Image, ImageDraw
        except ModuleNotFoundError:
            self.skipTest("Pillow недоступен в текущем Python runtime")

        with TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            source_path = root / "portrait.jpg"
            target_path = root / "card.webp"
            source = Image.new("RGB", (100, 200), (240, 237, 232))
            draw = ImageDraw.Draw(source)
            draw.rectangle((30, 20, 70, 190), fill=(12, 12, 12))
            source.save(source_path, "JPEG", quality=100)

            convert_to_webp(
                source_path,
                target_path,
                quality=100,
                max_size=(960, 960),
                square_canvas=True,
            )

            with Image.open(target_path) as card:
                card = card.convert("RGB")
                self.assertEqual(card.size, (200, 200))
                self.assertLess(sum(card.getpixel((100, 185))) / 3, 80)
                self.assertGreater(sum(card.getpixel((10, 100))) / 3, 200)

    def test_prunes_only_webp_without_source(self) -> None:
        with TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            jpg_dir = root / "jpg"
            webp_dir = root / "webp"
            card_webp_dir = webp_dir / "card"
            legacy_dir = webp_dir / "legacy"

            jpg_dir.mkdir()
            card_webp_dir.mkdir(parents=True)
            legacy_dir.mkdir()

            source_image = jpg_dir / "Актуальное фото.JPG"
            source_image.write_bytes(b"source")

            expected_full = webp_dir / "Актуальное фото.webp"
            expected_card = card_webp_dir / "Актуальное фото.webp"
            stale_full = webp_dir / "Удалённое фото.webp"
            stale_card = card_webp_dir / "Удалённое фото.webp"
            stale_nested = legacy_dir / "Удалённое фото.webp"
            unrelated_file = legacy_dir / "notes.txt"

            for image_path in (
                expected_full,
                expected_card,
                stale_full,
                stale_card,
                stale_nested,
            ):
                image_path.write_bytes(b"derived")
            unrelated_file.write_text("keep", encoding="utf-8")

            removed = prune_stale_variants(
                [source_image],
                webp_dir,
                card_webp_dir,
            )

            self.assertEqual(
                {path.relative_to(webp_dir).as_posix() for path in removed},
                {
                    "Удалённое фото.webp",
                    "card/Удалённое фото.webp",
                    "legacy/Удалённое фото.webp",
                },
            )
            self.assertTrue(expected_full.exists())
            self.assertTrue(expected_card.exists())
            self.assertTrue(unrelated_file.exists())

    def test_is_idempotent_when_tree_matches_sources(self) -> None:
        with TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            source_image = root / "jpg" / "Фото.jpeg"
            webp_dir = root / "webp"
            card_webp_dir = webp_dir / "card"

            source_image.parent.mkdir()
            card_webp_dir.mkdir(parents=True)
            source_image.write_bytes(b"source")
            (webp_dir / "Фото.webp").write_bytes(b"full")
            (card_webp_dir / "Фото.webp").write_bytes(b"card")

            removed = prune_stale_variants(
                [source_image],
                webp_dir,
                card_webp_dir,
            )

            self.assertEqual(removed, [])


if __name__ == "__main__":
    unittest.main()
