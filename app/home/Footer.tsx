"use client";

import { COLORS } from "@/constants/styles";

export const Footer = () => (
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
    Сделано с любовью и лёгким запахом кожи © {new Date().getFullYear()}
  </footer>
);

