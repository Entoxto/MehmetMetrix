"use client";

/**
 * Компонент чипов размеров (2 в строке, перенос, wrap/gap)
 * Рефактор: логика вынесена в derive/format, компоненты унифицированы.
 */

import { STYLES } from "@/constants/styles";
import { useBreakpoint } from "@/constants/responsive";
import type { Size } from "@/types/domain";

interface SizeChipsProps {
  sizes: Record<Size, number>;
}

export const SizeChips = ({ sizes }: SizeChipsProps) => {
  const { isMobile } = useBreakpoint();

  const entries = Object.entries(sizes).filter(([, count]) => count > 0) as [Size, number][];

  if (entries.length === 0) {
    return null;
  }

  return (
    <div style={{ display: "flex", gap: isMobile ? 6 : 8, flexWrap: "wrap" }}>
      {entries.map(([size, count], index) => (
        <span
          key={index}
          style={{
            ...STYLES.sizeBadge,
            fontSize: isMobile ? 10 : 12,
            padding: isMobile ? "3px 8px" : "4px 10px",
          }}
        >
          {size} × {count}
        </span>
      ))}
    </div>
  );
};

