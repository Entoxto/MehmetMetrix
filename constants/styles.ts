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
    dark: "#09090b",
    darker: "#111113",
    card: "rgba(24,24,27,0.78)",
    cardExpanded: "rgba(30,30,34,0.94)",
    footer: "rgba(9,9,11,0.64)",
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

export const STYLES = {
  // Базовый стиль прямоугольных карточек (товары, категории каталога, меню)
  card: {
    background: COLORS.background.card,
    border: `1px solid ${COLORS.border.default}`,
    borderRadius: 20,
    boxShadow: "0 14px 40px rgba(0, 0, 0, 0.24)",
    transition: "all 0.25s ease",
  },
  // Расширенная карточка (используется в раскрытом состоянии)
  cardExpanded: {
    background: COLORS.background.cardExpanded,
    border: `1px solid ${COLORS.border.hover}`,
  },
  // Чип размеров у позиций
  sizeBadge: {
    background: COLORS.background.soft,
    color: COLORS.text.secondary,
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
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
  },
  sectionEyebrow: {
    color: COLORS.text.muted,
    fontSize: 11,
    lineHeight: 1.4,
    letterSpacing: 1.4,
    textTransform: "uppercase" as const,
    fontWeight: 700,
  },
  sectionTitle: {
    color: COLORS.text.primary,
    fontSize: 30,
    fontWeight: 800,
    lineHeight: 1.15,
    letterSpacing: -0.8,
  },
  sectionDescription: {
    color: COLORS.text.secondary,
    fontSize: 14,
    lineHeight: 1.6,
  },
  pageIntroCopy: (isMobile: boolean) => ({
    color: isMobile ? COLORS.text.muted : COLORS.text.secondary,
    fontSize: isMobile ? 11 : 13,
    lineHeight: isMobile ? 1.45 : 1.5,
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
  },
  metricHint: {
    color: COLORS.text.muted,
    fontSize: 13,
    lineHeight: 1.5,
  },
  metaBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 10px",
    borderRadius: 999,
    border: `1px solid ${COLORS.border.default}`,
    background: COLORS.background.soft,
    color: COLORS.text.muted,
    fontSize: 11,
    lineHeight: 1.4,
    fontWeight: 600,
  },
  divider: {
    width: "100%",
    height: 1,
    background: COLORS.border.default,
  },
  focusRing: {
    outline: `2px solid ${COLORS.primary}`,
    outlineOffset: "2px",
  },
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
  h1: { fontSize: 44, fontWeight: 900, lineHeight: 1.1 },
  h2: { fontSize: 32, fontWeight: 900, lineHeight: 1.2 },
  h3: { fontSize: 24, fontWeight: 800, lineHeight: 1.3 },
  body: { fontSize: 14, lineHeight: 1.5 },
  bodyLg: { fontSize: 16, lineHeight: 1.6 },
  caption: { fontSize: 12, lineHeight: 1.4, letterSpacing: 1.2 },
  amount: { fontSize: 36, fontWeight: 900, lineHeight: 1.1 },
  tableHeader: { fontSize: 12, lineHeight: 1.4, letterSpacing: 1 },
  tableCell: { fontSize: 12, lineHeight: 1.5 },
} as const;

export const STATUS_CHIP_STYLE = (highlight: boolean, isCompact: boolean) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: SPACING.xs,
  padding: isCompact ? "3px 10px" : "4px 12px",
  borderRadius: 999,
  fontSize: isCompact ? "clamp(11px, 2vw, 12px)" : "clamp(12px, 0.9vw, 13px)",
  fontWeight: 600,
  lineHeight: 1,
  border: "1px solid",
  background: highlight ? "rgba(52,211,153,0.15)" : "rgba(251,191,36,0.15)",
  color: highlight ? COLORS.success : COLORS.primary,
  borderColor: highlight ? "rgba(52,211,153,0.3)" : "rgba(251,191,36,0.3)",
});

export const CARD_TEMPLATES = {
  container: (isMobile: boolean) => ({
    background: COLORS.background.card,
    border: `1px solid ${COLORS.border.default}`,
    borderRadius: isMobile ? 18 : 22,
    padding: isMobile ? SPACING.md : SPACING.lg,
    boxShadow: "0 14px 32px rgba(0, 0, 0, 0.18)",
    transition: "all 0.25s ease",
    backdropFilter: isMobile ? "none" : "blur(10px)",
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
    background: "linear-gradient(180deg, rgba(24,24,27,0.82) 0%, rgba(21,21,24,0.94) 100%)",
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
  tableHeader: (isMobile: boolean) => ({
    padding: isMobile ? "10px 12px" : "14px 18px",
    background: COLORS.background.soft,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
    color: COLORS.text.muted,
    borderBottom: `1px solid ${COLORS.border.default}`,
    margin: 0,
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

// Готовые эффекты наведения для карточек разных типов
export const CARD_HOVER_EFFECTS = {
  // Плитка категории в меню каталога
  category: {
    hover: {
      transform: "translateY(-3px)",
      boxShadow: "0 18px 36px rgba(0, 0, 0, 0.26)",
      border: `1px solid ${COLORS.border.primaryHover}`,
    },
    default: {
      transform: "translateY(0) scale(1)",
      boxShadow: STYLES.card.boxShadow,
      border: `1px solid ${COLORS.border.default}`,
    },
  },
  // Карточка товара
  product: {
    hover: {
      transform: "translateY(-4px)",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.28)",
      border: `1px solid ${COLORS.border.primaryHover}`,
    },
    default: {
      transform: "translateY(0)",
      boxShadow: STYLES.card.boxShadow,
      border: `1px solid ${COLORS.border.default}`,
    },
  },
  // Карточка в разделе «Что по бабкам»
  money: {
    hover: {
      boxShadow: "0 22px 44px rgba(0, 0, 0, 0.28)",
      transform: "translateY(-2px)",
      border: `1px solid ${COLORS.border.primaryHover}`,
    },
    default: {
      boxShadow: STYLES.card.boxShadow,
      transform: "translateY(0)",
      border: `1px solid ${COLORS.border.default}`,
    },
  },
  work: {
    hover: {
      boxShadow: "0 18px 36px rgba(0, 0, 0, 0.24)",
      transform: "translateY(-2px)",
      background: COLORS.background.cardExpanded,
      border: `1px solid ${COLORS.border.primaryHover}`,
    },
    default: {
      boxShadow: "0 14px 32px rgba(0, 0, 0, 0.18)",
      transform: "translateY(0)",
      background: COLORS.background.card,
      border: `1px solid ${COLORS.border.default}`,
    },
  },
} as const;







