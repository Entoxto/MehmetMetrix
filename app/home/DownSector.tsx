"use client";

/**
 * DownSector — нижняя панель каркаса.
 * Даёт общий подвал с дефолтным текстом и принимает children для кастомизации.
 */
import { COLORS, SPACING } from "@/constants/styles";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { formatUpdatedAt } from "@/lib/format";
import type { ReactNode } from "react";

interface FooterProps {
  children?: ReactNode;
  updatedAt?: string;
}

export const DownSector = ({ children, updatedAt }: FooterProps) => {
  const { isMobile } = useBreakpoint();
  const updatedAtLabel = formatUpdatedAt(updatedAt);

  return (
    <footer
      style={{
        padding: isMobile ? `${SPACING.md}px ${SPACING.smPlus}px` : SPACING.mdPlus,
        textAlign: "center",
        color: COLORS.text.muted,
        borderTop: `1px solid ${COLORS.border.default}`,
        fontSize: isMobile ? 11 : 12,
        fontStyle: "italic",
        background: COLORS.background.footer,
      }}
    >
      {children ?? (
        <div
          style={{
            display: "inline-flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: "center",
            justifyContent: "center",
            gap: isMobile ? SPACING.xsPlus : SPACING.smPlus,
            flexWrap: "wrap",
            lineHeight: 1.5,
          }}
        >
          <span>Сделано с любовью и лёгким запахом кожи © {new Date().getFullYear()}</span>
          {updatedAtLabel && (
            <>
              {!isMobile && (
                <span
                  aria-hidden="true"
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 999,
                    background: COLORS.border.strong,
                  }}
                />
              )}
              <span
                style={{
                  fontStyle: "normal",
                  color: COLORS.text.secondary,
                  fontSize: isMobile ? 10 : 12,
                }}
              >
                Обновлено: {updatedAtLabel}
              </span>
            </>
          )}
        </div>
      )}
    </footer>
  );
};
