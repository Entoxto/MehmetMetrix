"""Регрессионные тесты синхронизации производных изображений."""

import sys
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory

sys.path.insert(0, str(Path(__file__).parent))

from convert_to_webp import prune_stale_variants


class WebpSyncTests(unittest.TestCase):
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
