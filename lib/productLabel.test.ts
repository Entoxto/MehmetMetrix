import { describe, expect, it } from "vitest";
import { splitProductLabel } from "./productLabel";

describe("splitProductLabel", () => {
  it("отделяет цвет после последнего тире с пробелами", () => {
    expect(
      splitProductLabel("Куртка из кожи питона по новым лекалам — коричневый матовый")
    ).toEqual({
      model: "Куртка из кожи питона по новым лекалам",
      color: "коричневый матовый",
    });
  });

  it("не принимает дефис внутри названия за разделитель цвета", () => {
    expect(
      splitProductLabel("Жакет из меха пони в стиле 80-х — чёрный")
    ).toEqual({
      model: "Жакет из меха пони в стиле 80-х",
      color: "чёрный",
    });
  });

  it("оставляет название целиком, если цвет не выделен", () => {
    expect(splitProductLabel("Штаны из молочной кожи")).toEqual({
      model: "Штаны из молочной кожи",
      color: null,
    });
  });
});
