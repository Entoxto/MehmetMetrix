import { COLORS, SPACING, STYLES } from "@/constants/styles";
import type { CSSProperties } from "react";

export const HOME_STYLES = {
  container: {
    minHeight: "100vh",
    background: `linear-gradient(135deg, ${COLORS.background.dark} 0%, ${COLORS.background.darker} 100%)`,
    color: "white",
    display: "flex",
    flexDirection: "column",
  } as CSSProperties,

  headerContainer: (isMobile: boolean): CSSProperties => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: SPACING.sm,
    padding: isMobile
      ? `8px ${SPACING.md}px 8px ${SPACING.sm}px`
      : `12px ${SPACING.lg}px 12px ${SPACING.md}px`,
    width: "100%",
    boxSizing: "border-box",
  }),

  headerTopRow: (isMobile: boolean): CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: isMobile ? 8 : 14,
    justifyContent: "flex-start",
    width: "100%",
  }),

  headerLogoGroup: (isMobile: boolean): CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: isMobile ? 8 : 14,
  }),

  headerIcon: (isMobile: boolean): CSSProperties => ({
    fontSize: isMobile ? 22 : 36,
  }),

  headerTitle: (isMobile: boolean): CSSProperties => ({
    fontSize: isMobile ? 26 : 44,
    fontWeight: 900,
    letterSpacing: -1.5,
    color: COLORS.primary,
    textShadow: "0 0 20px rgba(251,191,36,0.5)",
    margin: 0,
  }),

  categoryTitleContainer: {
    textAlign: "center",
  } as CSSProperties,

  categoryTitle: {
    fontSize: 32,
    fontWeight: 900,
    color: COLORS.primary,
    margin: 0,
  } as CSSProperties,

  mobileCategoryHeader: {
    textAlign: "center",
    borderTop: `1px solid rgba(102,102,102,0.2)`,
    paddingTop: SPACING.xs,
  } as CSSProperties,

  mobileCategoryTitle: {
    fontSize: 20,
    fontWeight: 900,
    color: COLORS.primary,
    margin: 0,
  } as CSSProperties,

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
    padding: 12,
    display: "grid",
    gap: SPACING.lg,
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  } as CSSProperties,

  card: {
    ...STYLES.card,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
    cursor: "pointer",
    transition: "all 0.3s ease",
  } as CSSProperties,

  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 5,
  } as CSSProperties,

  icon: {
    fontSize: 20,
  } as CSSProperties,

  title: {
    fontSize: 16,
    fontWeight: 800,
    color: COLORS.primary,
  } as CSSProperties,

  imageContainer: {
    width: "100%",
    aspectRatio: "1",
    marginBottom: 6,
    borderRadius: 8,
    overflow: "hidden",
    background: COLORS.background.card,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  } as CSSProperties,

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  } as CSSProperties,

  description: {
    color: COLORS.text.primary,
    fontSize: 12,
    fontStyle: "italic",
    lineHeight: 1.5,
  } as CSSProperties,

  cardHover: {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 32px rgba(251,191,36,0.3)",
    border: `1px solid ${COLORS.border.primaryHover}`,
  } as CSSProperties,

  cardDefault: {
    transform: "translateY(0)",
    boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
    border: `1px solid ${COLORS.border.default}`,
  } as CSSProperties,
};
