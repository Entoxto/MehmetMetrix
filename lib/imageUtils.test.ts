import { describe, expect, it } from "vitest";
import { getOptimizedImagePath } from "./imageUtils";

describe("product image paths", () => {
  const jpgPath = "/images/products/jpg/Каталог.JPG";

  it("строит путь к полноразмерному WebP по умолчанию", () => {
    expect(getOptimizedImagePath(jpgPath)).toBe(
      "/images/products/webp/Каталог.webp"
    );
  });

  it("строит путь к облегчённому WebP для карточки", () => {
    expect(getOptimizedImagePath(jpgPath, "card")).toBe(
      "/images/products/webp/card/Каталог.webp"
    );
  });
});
