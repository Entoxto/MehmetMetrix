"use client";

import { COLORS } from "@/constants/styles";
import type { ReactNode } from "react";

interface FooterProps {
  children?: ReactNode;
}

export const DownSector = ({ children }: FooterProps) => (
  <footer
    style={{
      padding: 20,
      textAlign: "center",
      color: COLORS.text.muted,
      borderTop: `1px solid rgba(102,102,102,0.2)`,
      fontSize: 12,
      fontStyle: "italic",
      background: COLORS.background.footer,
    }}
  >
    {children ?? <>Сделано с любовью и лёгким запахом кожи © {new Date().getFullYear()}</>}
  </footer>
);

