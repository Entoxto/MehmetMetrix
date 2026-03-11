import { COLORS, SPACING, STYLES } from "@/constants/styles";
import type { CSSProperties } from "react";

export const HOME_STYLES = {
  container: {
    minHeight: "100vh",
    background: `linear-gradient(135deg, ${COLORS.background.dark} 0%, ${COLORS.background.darker} 100%)`,
    color: COLORS.text.primary,
    display: "flex",
    flexDirection: "column",
  } as CSSProperties,

  headerContainer: (isMobile: boolean): CSSProperties => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: SPACING.sm,
    padding: isMobile
      ? `${SPACING.sm}px ${SPACING.md}px`
      : `${SPACING.md}px ${SPACING.xl}px`,
    width: "100%",
    boxSizing: "border-box",
  }),

  headerTopRow: (isMobile: boolean): CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: isMobile ? SPACING.sm : SPACING.md,
    width: "100%",
  }),

  headerLogoGroup: (isMobile: boolean): CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: isMobile ? 8 : 14,
  }),

  headerBackSlot: (isMobile: boolean): CSSProperties => ({
    marginLeft: "auto",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    minWidth: isMobile ? 0 : 120,
  }),

  headerIcon: (isMobile: boolean): CSSProperties => ({
    fontSize: isMobile ? 22 : 36,
  }),

  headerTitle: (isMobile: boolean): CSSProperties => ({
    fontSize: isMobile ? 24 : 40,
    fontWeight: 900,
    letterSpacing: -1.2,
    color: COLORS.primary,
    textShadow: "0 0 18px rgba(244,195,77,0.18)",
    margin: 0,
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

  upSector: {
    display: "flex",
    alignItems: "center",
    padding: "0",
    borderBottom: `1px solid rgba(102,102,102,0.2)`,
    background: COLORS.background.header,
    backdropFilter: "blur(10px)",
    width: "100%",
    justifyContent: "flex-start",
  } as CSSProperties,
};

export const MENU_STYLES = {
  main: {
    flex: 1,
    width: "100%",
    maxWidth: 1400,
    margin: "0 auto",
    padding: 12,
    display: "grid",
    gap: SPACING.lg,
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    boxSizing: "border-box",
  } as CSSProperties,

  card: {
    ...STYLES.card,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: SPACING.md,
    justifyContent: "space-between",
    cursor: "pointer",
    minHeight: 520,
    transition: "all 0.25s ease",
  } as CSSProperties,

  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
  } as CSSProperties,

  icon: {
    fontSize: 18,
    lineHeight: 1,
    color: COLORS.primary,
    marginTop: 2,
  } as CSSProperties,

  title: {
    fontSize: 22,
    fontWeight: 800,
    lineHeight: 1.2,
    letterSpacing: -0.4,
    color: COLORS.text.primary,
    margin: 0,
  } as CSSProperties,

  imageContainer: {
    width: "100%",
    aspectRatio: "5 / 6",
    borderRadius: 16,
    overflow: "hidden",
    background: COLORS.background.cardExpanded,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: `1px solid ${COLORS.border.default}`,
  } as CSSProperties,

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  } as CSSProperties,

  description: {
    color: COLORS.text.secondary,
    fontSize: 14,
    lineHeight: 1.6,
    margin: 0,
  } as CSSProperties,

  cardHover: {
    transform: "translateY(-3px)",
    boxShadow: "0 20px 40px rgba(0,0,0,0.28)",
    border: `1px solid ${COLORS.border.primaryHover}`,
  } as CSSProperties,

  cardDefault: {
    transform: "translateY(0)",
    boxShadow: STYLES.card.boxShadow,
    border: `1px solid ${COLORS.border.default}`,
  } as CSSProperties,
};
