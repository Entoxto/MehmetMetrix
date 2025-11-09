"use client";

import type { ReactNode } from "react";
import { COLORS, SPACING } from "@/constants/styles";

interface HeaderProps {
  isMobile: boolean;
  selectedCategory: string | null;
  backButton: ReactNode;
}

export const Header = ({ isMobile, selectedCategory, backButton }: HeaderProps) => (
  <header
    style={{
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr auto 1fr",
      alignItems: "center",
      padding: isMobile ? "8px 16px" : "0px 32px",
      borderBottom: `1px solid rgba(102,102,102,0.2)`,
      background: COLORS.background.header,
      backdropFilter: "blur(10px)",
      gap: isMobile ? SPACING.sm : 0,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: isMobile ? 8 : 14,
        justifyContent: isMobile ? "space-between" : "flex-start",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 14 }}>
        <span style={{ fontSize: isMobile ? 24 : 36 }}>⚡</span>
        <h1
          style={{
            fontSize: isMobile ? 28 : 44,
            fontWeight: 900,
            letterSpacing: -1.5,
            color: COLORS.primary,
            textShadow: "0 0 20px rgba(251,191,36,0.5)",
          }}
        >
          Mehmet Metrics
        </h1>
      </div>
      {isMobile && backButton}
    </div>

    {!isMobile && (
      <>
        {selectedCategory ? (
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: COLORS.primary, margin: 0 }}>
              {selectedCategory}
            </h2>
          </div>
        ) : (
          <div />
        )}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>{backButton}</div>
      </>
    )}

    {isMobile && selectedCategory && (
      <div
        style={{
          textAlign: "center",
          borderTop: `1px solid rgba(102,102,102,0.2)`,
          paddingTop: SPACING.xs,
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 900, color: COLORS.primary, margin: 0 }}>
          {selectedCategory}
        </h2>
      </div>
    )}
  </header>
);

