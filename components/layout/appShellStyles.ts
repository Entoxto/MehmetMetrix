import { COLORS, FONT_FAMILIES, SPACING } from "@/constants/styles";
import type { CSSProperties } from "react";

export const APP_SHELL_STYLES = {
  container: {
    minHeight: "100vh",
    background: COLORS.background.dark,
    color: COLORS.text.primary,
    display: "flex",
    flexDirection: "column",
  } as CSSProperties,

  headerContainer: (isMobile: boolean): CSSProperties => ({
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: isMobile
      ? `${SPACING.sm}px ${SPACING.smPlus}px`
      : `${SPACING.mdPlus}px ${SPACING.xl}px`,
    width: "100%",
    boxSizing: "border-box",
  }),

  headerTopRow: (isMobile: boolean): CSSProperties => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: isMobile ? SPACING.sm : SPACING.lg,
    width: "100%",
  }),

  headerLogoGroup: (isMobile: boolean): CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: isMobile ? SPACING.sm : SPACING.mdPlus,
    minWidth: 0,
  }),

  headerBrandLink: {
    display: "inline-flex",
    alignItems: "center",
    minWidth: 0,
    textDecoration: "none",
    color: "inherit",
  } as CSSProperties,

  headerBackSlot: (isMobile: boolean): CSSProperties => ({
    marginLeft: "auto",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    minWidth: isMobile ? 0 : 132,
    flexShrink: 0,
  }),

  brandMark: (isMobile: boolean): CSSProperties => ({
    display: "inline-flex",
    width: isMobile ? 34 : 54,
    height: isMobile ? 34 : 54,
    borderRadius: isMobile ? 11 : 18,
    overflow: "hidden",
    boxShadow: "0 12px 28px rgba(0, 0, 0, 0.28)",
    flexShrink: 0,
  }),

  brandImage: {
    width: "100%",
    height: "100%",
    display: "block",
  } as CSSProperties,

  headerTitleGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
    minWidth: 0,
  } as CSSProperties,

  headerTitle: (isMobile: boolean): CSSProperties => ({
    fontFamily: FONT_FAMILIES.display,
    fontSize: isMobile ? 20 : 34,
    fontWeight: 600,
    letterSpacing: isMobile ? -0.2 : -0.4,
    lineHeight: 1.02,
    background: "linear-gradient(180deg, #f7de97 0%, #f4c34d 55%, #cc9225 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textShadow: "0 0 18px rgba(244,195,77,0.14)",
    margin: 0,
  }),

  headerBackButton: (isMobile: boolean): CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: isMobile ? SPACING.xs : SPACING.sm,
    padding: isMobile ? "5px 8px 5px 6px" : "9px 14px 9px 10px",
    borderRadius: 999,
    border: `1px solid ${COLORS.border.default}`,
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(22,22,26,0.96) 100%)",
    color: COLORS.text.primary,
    fontSize: isMobile ? 10 : 13,
    fontWeight: 700,
    lineHeight: 1,
    boxShadow: "0 10px 24px rgba(0, 0, 0, 0.18)",
    whiteSpace: "nowrap",
    cursor: "pointer",
    fontFamily: FONT_FAMILIES.ui,
    appearance: "none",
  }),

  headerBackIcon: (_isMobile: boolean): CSSProperties => ({
    color: COLORS.primary,
    flexShrink: 0,
  }),

  errorContainer: {
    flex: 1,
    padding: SPACING.xl,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  } as CSSProperties,

  errorMessage: {
    color: COLORS.error,
    fontSize: 16,
  } as CSSProperties,

  loaderContainer: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: COLORS.background.dark,
    color: COLORS.text.primary,
  } as CSSProperties,

  header: {
    display: "flex",
    alignItems: "center",
    padding: "0",
    borderBottom: `1px solid ${COLORS.border.default}`,
    background:
      "linear-gradient(180deg, rgba(12,12,14,0.99) 0%, rgba(8,8,10,0.97) 100%)",
    backdropFilter: "blur(14px)",
    boxShadow: "0 14px 32px rgba(0, 0, 0, 0.2)",
    width: "100%",
    justifyContent: "flex-start",
  } as CSSProperties,
};
