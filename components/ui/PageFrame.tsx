"use client";

import type { CSSProperties, ReactNode } from "react";
import { PAGE_MAX_WIDTH, SPACING } from "@/constants/styles";
import { useBreakpoint } from "@/hooks/useBreakpoint";

interface PageFrameProps {
  children: ReactNode;
  gap?: number;
  maxWidth?: number;
  style?: CSSProperties;
}

export const PageFrame = ({
  children,
  gap,
  maxWidth = PAGE_MAX_WIDTH,
  style,
}: PageFrameProps) => {
  const { isMobile } = useBreakpoint();
  const horizontalPadding = isMobile ? SPACING.smPlus : SPACING.xl;

  return (
    <main
      style={{
        flex: 1,
        width: "100%",
        maxWidth,
        margin: "0 auto",
        paddingTop: horizontalPadding,
        paddingRight: horizontalPadding,
        paddingBottom: horizontalPadding,
        paddingLeft: horizontalPadding,
        display: "flex",
        flexDirection: "column",
        gap: gap ?? (isMobile ? SPACING.smPlus : SPACING.lg),
        ...style,
      }}
    >
      {children}
    </main>
  );
};
