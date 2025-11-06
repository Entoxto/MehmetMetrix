"use client";

import type { ReactNode } from "react";
import { STYLES } from "@/constants/styles";

interface CardProps {
  children: ReactNode;
  padding?: number;
  expandable?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
}

export const Card = ({
  children,
  padding = 16,
  expandable = false,
  expanded = false,
  onToggle,
}: CardProps) => {
  const handleClick = () => {
    if (expandable && onToggle) {
      onToggle();
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        ...STYLES.card,
        ...(expanded ? STYLES.cardExpanded : {}),
        padding,
        cursor: expandable ? "pointer" : "default",
      }}
    >
      {children}
    </div>
  );
};


