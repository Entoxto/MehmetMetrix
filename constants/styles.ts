/**
 * Общие цвета, базовые стили и эффекты для карточек и кнопок
 * Компоненты тянут эти константы, чтобы выглядеть одинаково
 */
// Палитра проекта: базовые цвета, фоны и рамки
export const COLORS = {
  primary: "#f4c34d",
  success: "#34d399",
  error: "#f87171",
  text: {
    primary: "#f5f5f5",
    softTitle: "rgba(245, 239, 227, 0.9)",
    secondary: "#c7c7c7",
    muted: "#8a8a8a",
    tertiary: "#686868",
  },
  background: {
    dark: "#080809",
    darker: "#0c0c0e",
    card: "rgba(14,14,16,0.98)",
    cardExpanded: "rgba(10,10,12,0.99)",
    footer: "rgba(8,8,9,0.88)",
    soft: "rgba(255,255,255,0.03)",
    accent: "rgba(244,195,77,0.08)",
  },
  border: {
    default: "rgba(255,255,255,0.10)",
    hover: "rgba(255,255,255,0.16)",
    strong: "rgba(255,255,255,0.22)",
    primary: "rgba(244,195,77,0.24)",
    primaryHover: "rgba(244,195,77,0.42)",
  },
} as const;

export const SURFACES = {
  card: "linear-gradient(180deg, rgba(15,15,17,0.99) 0%, rgba(9,9,11,0.995) 100%)",
  cardRaised:
    "linear-gradient(180deg, rgba(18,18,20,0.99) 0%, rgba(10,10,12,0.995) 100%)",
  cardExpanded:
    "linear-gradient(180deg, rgba(244,195,77,0.07) 0%, rgba(13,13,15,0.99) 16%, rgba(8,8,10,0.995) 100%)",
  intro:
    "linear-gradient(135deg, rgba(244,195,77,0.055) 0%, rgba(15,15,17,0.99) 20%, rgba(9,9,11,0.995) 100%)",
  inset: "rgba(10,10,12,0.94)",
  sheet:
    "linear-gradient(180deg, rgba(244,195,77,0.035) 0%, rgba(11,11,13,0.995) 16%, rgba(8,8,10,0.995) 100%)",
} as const;

export const PAGE_MAX_WIDTH = 1440;

export const FONT_FAMILIES = {
  display: "var(--font-display), 'Palatino Linotype', Georgia, serif",
  ui: "var(--font-ui), 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
} as const;

const INTERACTIVE_TRANSITION =
  "transform 0.24s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.24s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.24s ease, background 0.24s ease, opacity 0.24s ease";

export const CATEGORY_VISUALS: Record<
  string,
  {
    accent: string;
    accentSoft: string;
    surface: string;
    line: string;
  }
> = {
  Мех: {
    accent: "#d7a85b",
    accentSoft: "rgba(215,168,91,0.10)",
    surface: SURFACES.card,
    line: "linear-gradient(90deg, rgba(215,168,91,0.52) 0%, rgba(215,168,91,0.12) 70%, rgba(215,168,91,0) 100%)",
  },
  Замша: {
    accent: "#cbb487",
    accentSoft: "rgba(203,180,135,0.09)",
    surface: SURFACES.card,
    line: "linear-gradient(90deg, rgba(203,180,135,0.48) 0%, rgba(203,180,135,0.12) 70%, rgba(203,180,135,0) 100%)",
  },
  Кожа: {
    accent: "#b7794c",
    accentSoft: "rgba(183,121,76,0.10)",
    surface: SURFACES.card,
    line: "linear-gradient(90deg, rgba(183,121,76,0.50) 0%, rgba(183,121,76,0.12) 70%, rgba(183,121,76,0) 100%)",
  },
  Экзотика: {
    accent: "#c7b15a",
    accentSoft: "rgba(199,177,90,0.10)",
    surface: SURFACES.card,
    line: "linear-gradient(90deg, rgba(199,177,90,0.50) 0%, rgba(199,177,90,0.12) 70%, rgba(199,177,90,0) 100%)",
  },
};

export const getCategoryVisual = (category: string) =>
  CATEGORY_VISUALS[category] ?? CATEGORY_VISUALS.Мех;

export const SHIPMENT_TYPE_VISUALS = {
  batch: {
    accent: "#d09a58",
    surface: "rgba(112, 67, 27, 0.14)",
    border: "rgba(208, 154, 88, 0.48)",
  },
  sample: {
    accent: "#a78bfa",
    surface: "rgba(99, 75, 166, 0.14)",
    border: "rgba(167, 139, 250, 0.48)",
  },
} as const;

export const STYLES = {
  // Базовый стиль прямоугольных карточек (товары, категории каталога, меню)
  card: {
    background: SURFACES.card,
    border: `1px solid ${COLORS.border.default}`,
    borderRadius: 18,
    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.22)",
    transition: INTERACTIVE_TRANSITION,
  },
  // Чип размеров у позиций
  sizeBadge: {
    background: COLORS.background.soft,
    color: COLORS.text.secondary,
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    fontFamily: FONT_FAMILIES.ui,
    fontVariantNumeric: "tabular-nums" as const,
    border: `1px solid ${COLORS.border.default}`,
  },
  // Бейдж категории в меню или каталоге
  categoryBadge: {
    background: COLORS.background.accent,
    color: COLORS.primary,
    fontSize: 12,
    padding: "5px 12px",
    borderRadius: 999,
    border: `1px solid ${COLORS.border.primary}`,
    fontWeight: 600,
    fontFamily: FONT_FAMILIES.ui,
  },
  sectionEyebrow: {
    color: COLORS.text.muted,
    fontSize: 11,
    lineHeight: 1.4,
    letterSpacing: 1.4,
    textTransform: "uppercase" as const,
    fontWeight: 700,
    fontFamily: FONT_FAMILIES.ui,
  },
  sectionTitle: {
    color: COLORS.text.primary,
    fontSize: 30,
    fontWeight: 600,
    lineHeight: 1.15,
    letterSpacing: -0.3,
    fontFamily: FONT_FAMILIES.display,
    fontVariantNumeric: "lining-nums proportional-nums" as const,
  },
  sectionDescription: {
    color: COLORS.text.secondary,
    fontSize: 14,
    lineHeight: 1.6,
    fontFamily: FONT_FAMILIES.display,
  },
  pageIntroCopy: (isMobile: boolean) => ({
    color: isMobile ? COLORS.text.muted : COLORS.text.secondary,
    fontSize: isMobile ? 11 : 13,
    lineHeight: isMobile ? 1.45 : 1.5,
    fontFamily: FONT_FAMILIES.display,
    maxWidth: isMobile ? 520 : 620,
    margin: 0,
  }),
  metricLabel: {
    color: COLORS.text.muted,
    fontSize: 11,
    lineHeight: 1.4,
    letterSpacing: 1.4,
    textTransform: "uppercase" as const,
    fontWeight: 700,
    fontFamily: FONT_FAMILIES.ui,
    fontVariantNumeric: "tabular-nums" as const,
  },
  metricHint: {
    color: COLORS.text.muted,
    fontSize: 13,
    lineHeight: 1.5,
    fontFamily: FONT_FAMILIES.ui,
  },
} as const;

export const MOTION = {
  interactiveTransition: INTERACTIVE_TRANSITION,
  staggerEnter: (index = 0, delayStep = 70) =>
    `fadeUp 520ms cubic-bezier(0.22, 1, 0.36, 1) both ${Math.max(index, 0) * delayStep}ms`,
  softEnter: "fadeUp 420ms cubic-bezier(0.22, 1, 0.36, 1) both",
} as const;

// Таблица отступов, чтобы не размножать числа в компонентах
export const SPACING = {
  xs: 4,
  xsPlus: 6,
  sm: 8,
  smPlus: 12,
  md: 16,
  mdPlus: 20,
  lg: 24,
  xl: 32,
} as const;

export const TYPOGRAPHY = {
  h1: {
    fontSize: 44,
    fontWeight: 600,
    lineHeight: 1.1,
    fontFamily: FONT_FAMILIES.display,
    fontVariantNumeric: "lining-nums proportional-nums" as const,
  },
  h2: {
    fontSize: 32,
    fontWeight: 600,
    lineHeight: 1.2,
    fontFamily: FONT_FAMILIES.display,
    fontVariantNumeric: "lining-nums proportional-nums" as const,
  },
  h3: {
    fontSize: 24,
    fontWeight: 600,
    lineHeight: 1.3,
    fontFamily: FONT_FAMILIES.display,
    fontVariantNumeric: "lining-nums proportional-nums" as const,
  },
  body: {
    fontSize: 14,
    lineHeight: 1.5,
    fontFamily: FONT_FAMILIES.display,
  },
  caption: {
    fontSize: 12,
    lineHeight: 1.4,
    letterSpacing: 1.2,
    fontFamily: FONT_FAMILIES.ui,
  },
  amount: {
    fontSize: 36,
    fontWeight: 600,
    lineHeight: 1.1,
    fontFamily: FONT_FAMILIES.ui,
    fontVariantNumeric: "tabular-nums" as const,
    fontFeatureSettings: '"tnum"',
  },
  tableHeader: {
    fontSize: 12,
    lineHeight: 1.4,
    letterSpacing: 1,
    fontFamily: FONT_FAMILIES.ui,
  },
  tableCell: {
    fontSize: 12,
    lineHeight: 1.5,
    fontFamily: FONT_FAMILIES.ui,
    fontVariantNumeric: "tabular-nums" as const,
  },
} as const;

export const STATUS_CHIP_STYLE = (highlight: boolean, isCompact: boolean) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: SPACING.xs,
  padding: isCompact ? "3px 10px" : "4px 12px",
  borderRadius: 999,
  fontSize: isCompact ? "clamp(11px, 2vw, 12px)" : "clamp(12px, 0.9vw, 13px)",
  fontWeight: 600,
  fontFamily: FONT_FAMILIES.ui,
  lineHeight: 1,
  border: "1px solid",
  background: highlight ? "rgba(52,211,153,0.15)" : "rgba(251,191,36,0.15)",
  color: highlight ? COLORS.success : COLORS.primary,
  borderColor: highlight ? "rgba(52,211,153,0.3)" : "rgba(251,191,36,0.3)",
});

export const CARD_TEMPLATES = {
  container: (isMobile: boolean) => ({
    background: SURFACES.card,
    border: `1px solid ${COLORS.border.default}`,
    borderRadius: isMobile ? 16 : 20,
    padding: isMobile ? SPACING.md : SPACING.lg,
    boxShadow: "0 12px 28px rgba(0, 0, 0, 0.2)",
    transition: INTERACTIVE_TRANSITION,
  }),
  introCard: (isMobile: boolean) => ({
    ...STYLES.card,
    padding: isMobile ? SPACING.md : SPACING.lg,
    display: "flex",
    flexDirection: "column" as const,
    gap: isMobile ? SPACING.sm : SPACING.md,
  }),
  pageIntro: (isMobile: boolean) => ({
    ...STYLES.card,
    width: "100%",
    padding: isMobile ? SPACING.smPlus : SPACING.md,
    display: "flex",
    flexDirection: "column" as const,
    gap: isMobile ? SPACING.xsPlus : SPACING.sm,
    boxShadow: "0 10px 24px rgba(0, 0, 0, 0.18)",
    background: SURFACES.intro,
  }),
  metricCard: (isMobile: boolean) => ({
    ...STYLES.card,
    padding: isMobile ? SPACING.md : SPACING.lg,
    display: "flex",
    flexDirection: "column" as const,
    gap: isMobile ? SPACING.xsPlus : SPACING.sm,
    minHeight: isMobile ? 132 : 152,
  }),
  sectionGrid: (isMobile: boolean, minWidth = 220) => ({
    display: "grid",
    gap: isMobile ? SPACING.md : SPACING.lg,
    gridTemplateColumns: isMobile ? "1fr" : `repeat(auto-fit, minmax(${minWidth}px, 1fr))`,
  }),
  tableValue: (isMobile: boolean, align: "left" | "center" = "left") => ({
    padding: isMobile ? "8px 8px" : "12px 12px",
    background: COLORS.background.card,
    textAlign: align,
    color: COLORS.text.secondary,
    borderBottom: `1px solid ${COLORS.border.default}`,
    margin: 0,
  }),
  dataGroupHeader: (isMobile: boolean) => ({
    background: COLORS.background.soft,
    borderBottom: `1px solid ${COLORS.border.default}`,
    padding: isMobile ? "10px 12px" : "12px 18px",
    color: COLORS.text.secondary,
    fontWeight: 700,
    margin: 0,
  }),
} as const;
