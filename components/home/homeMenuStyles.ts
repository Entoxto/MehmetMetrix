import { COLORS, FONT_FAMILIES, SPACING, STYLES, SURFACES } from "@/constants/styles";
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
    position: "relative",
    overflow: "hidden",
    background: SURFACES.card,
  } as CSSProperties,

  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
  } as CSSProperties,

  icon: {
    color: COLORS.primary,
    marginTop: 2,
    flexShrink: 0,
  } as CSSProperties,

  title: {
    fontSize: 22,
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: -0.2,
    fontFamily: FONT_FAMILIES.display,
    color: COLORS.text.primary,
    margin: 0,
  } as CSSProperties,

  imageContainer: {
    width: "100%",
    aspectRatio: "5 / 6",
    borderRadius: 16,
    overflow: "hidden",
    background: SURFACES.inset,
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

};
