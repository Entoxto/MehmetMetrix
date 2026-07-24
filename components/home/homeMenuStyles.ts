import { COLORS, SPACING, STYLES } from "@/constants/styles";
import type { CSSProperties } from "react";

export const HOME_MENU_STYLES = {
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
