import { COLORS, SPACING } from "@/constants/styles";
import type { CSSProperties } from "react";

export const APP_SHELL_STYLES = {
  container: {
    minHeight: "100vh",
    background: `linear-gradient(135deg, ${COLORS.background.dark} 0%, ${COLORS.background.darker} 100%)`,
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
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: isMobile ? 34 : 54,
    height: isMobile ? 34 : 54,
    borderRadius: isMobile ? 11 : 18,
    padding: isMobile ? 2 : 4,
    background:
      "linear-gradient(145deg, rgba(244,195,77,0.28) 0%, rgba(244,195,77,0.08) 38%, rgba(255,255,255,0.04) 100%)",
    border: `1px solid ${COLORS.border.primary}`,
    boxShadow: "0 14px 30px rgba(0, 0, 0, 0.24)",
  }),

  brandMarkInset: (isMobile: boolean): CSSProperties => ({
    width: "100%",
    height: "100%",
    borderRadius: isMobile ? 8 : 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "radial-gradient(circle at top, rgba(255,255,255,0.14) 0%, rgba(37,37,41,0.98) 58%, rgba(19,19,22,0.98) 100%)",
    border: `1px solid ${COLORS.border.strong}`,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
  }),

  brandMarkText: (isMobile: boolean): CSSProperties => ({
    fontSize: isMobile ? 11 : 18,
    lineHeight: 1,
    fontWeight: 800,
    letterSpacing: isMobile ? -0.5 : -1,
    color: COLORS.primary,
    textShadow: "0 0 18px rgba(244,195,77,0.18)",
  }),

  headerTitleGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
    minWidth: 0,
  } as CSSProperties,

  headerTitle: (isMobile: boolean): CSSProperties => ({
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: isMobile ? 20 : 34,
    fontWeight: 900,
    letterSpacing: isMobile ? -0.5 : -0.9,
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
    fontFamily: "inherit",
    appearance: "none",
  }),

  headerBackIcon: (isMobile: boolean): CSSProperties => ({
    width: isMobile ? 16 : 24,
    height: isMobile ? 16 : 24,
    borderRadius: 999,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: COLORS.background.accent,
    border: `1px solid ${COLORS.border.primary}`,
    color: COLORS.primary,
    fontSize: isMobile ? 9 : 12,
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
    background: `linear-gradient(135deg, ${COLORS.background.dark} 0%, ${COLORS.background.darker} 100%)`,
    color: COLORS.text.primary,
  } as CSSProperties,

  header: {
    display: "flex",
    alignItems: "center",
    padding: "0",
    borderBottom: `1px solid ${COLORS.border.default}`,
    background:
      "linear-gradient(180deg, rgba(18,18,21,0.96) 0%, rgba(13,13,16,0.88) 100%)",
    backdropFilter: "blur(14px)",
    boxShadow: "0 14px 32px rgba(0, 0, 0, 0.2)",
    width: "100%",
    justifyContent: "flex-start",
  } as CSSProperties,
};
