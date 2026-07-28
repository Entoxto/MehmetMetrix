export interface ProductLabelParts {
  model: string;
  color: string | null;
}

const MODEL_COLOR_SEPARATOR = /\s+[—–-]\s+/g;

/**
 * Excel хранит модель и цвет одной строкой: «Модель — цвет».
 * Разделение используется только для представления в UI и не меняет источник.
 */
export function splitProductLabel(label: string): ProductLabelParts {
  const normalizedLabel = label.trim().replace(/\s+/g, " ");
  const matches = Array.from(normalizedLabel.matchAll(MODEL_COLOR_SEPARATOR));
  const lastSeparator = matches.at(-1);

  if (lastSeparator?.index === undefined || lastSeparator.index <= 0) {
    return {
      model: normalizedLabel,
      color: null,
    };
  }

  const model = normalizedLabel.slice(0, lastSeparator.index).trim();
  const color = normalizedLabel
    .slice(lastSeparator.index + lastSeparator[0].length)
    .trim();

  if (!model || !color) {
    return {
      model: normalizedLabel,
      color: null,
    };
  }

  return { model, color };
}
