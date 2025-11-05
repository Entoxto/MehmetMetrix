"use client";

import React from "react";
import { STYLES } from "@/constants/styles";

interface CardProps {
  children: React.ReactNode;
  padding?: number;
  expandable?: boolean;
  cardId?: string;
  expanded?: boolean;
  onToggle?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  padding = 16,
  expandable = false,
  cardId = "",
  expanded = false,
  onToggle,
}) => {
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


