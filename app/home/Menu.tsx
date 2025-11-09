"use client";

import { STYLES, COLORS, SPACING } from "@/constants/styles";

export interface MenuItem {
  title: string;
  description: string;
  icon: string;
  image?: string;
  onClick: () => void;
}

interface MenuProps {
  items: MenuItem[];
}

export const Menu = ({ items }: MenuProps) => (
  <main
    style={{
      flex: 1,
      padding: 12,
      display: "grid",
      gap: SPACING.lg,
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    }}
  >
    {items.map((item, index) => (
      <div
        key={index}
        onClick={item.onClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = "0 8px 32px rgba(251,191,36,0.3)";
          e.currentTarget.style.border = `1px solid ${COLORS.border.primaryHover}`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.4)";
          e.currentTarget.style.border = `1px solid ${COLORS.border.default}`;
        }}
        style={{
          ...STYLES.card,
          padding: 20,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
          cursor: "pointer",
          transition: "all 0.3s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
          <span style={{ fontSize: 20 }}>{item.icon}</span>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: COLORS.primary }}>{item.title}</h2>
        </div>
        {item.image && (
          <div
            style={{
              width: "100%",
              aspectRatio: "1",
              marginBottom: 6,
              borderRadius: 8,
              overflow: "hidden",
              background: COLORS.background.card,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={item.image}
              alt={item.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        )}
        <p style={{ color: COLORS.text.primary, fontSize: 12, fontStyle: "italic", lineHeight: 1.5 }}>
          {item.description}
        </p>
      </div>
    ))}
  </main>
);

