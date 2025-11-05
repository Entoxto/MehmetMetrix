"use client";

import React from "react";
import { STYLES, COLORS } from "@/constants/styles";

interface CategoryCardProps {
  title: string;
  description: string;
  badge: string;
  onClick: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  description,
  badge,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(251,191,36,0.2)";
        e.currentTarget.style.border = `1px solid ${COLORS.border.primaryHover}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.border = `1px solid ${COLORS.border.default}`;
      }}
      style={{
        ...STYLES.card,
        padding: 20,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "all 0.3s ease",
      }}
    >
      <div>
        <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>{title}</h3>
        <p style={{ color: COLORS.text.primary, fontSize: 12, marginBottom: 12, lineHeight: 1.4 }}>
          {description}
        </p>
      </div>
      <span style={{ display: "inline-flex", width: "max-content", ...STYLES.categoryBadge }}>
        {badge}
      </span>
    </div>
  );
};


