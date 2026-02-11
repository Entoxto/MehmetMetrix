/**
 * Общие цвета, базовые стили и эффекты для карточек и кнопок
 * Компоненты тянут эти константы, чтобы выглядеть одинаково
 */
// Палитра проекта: базовые цвета, фоны и рамки
export const COLORS = {
  primary: "#fbbf24",
  success: "#34d399",
  error: "#f87171",
  text: {
    primary: "#d4d4d4",
    secondary: "#a3a3a3",
    muted: "#737373",
  },
  background: {
    dark: "#0a0a0a",
    darker: "#171717",
    card: "rgba(38,38,38,0.6)",
    cardExpanded: "rgba(56,56,56,0.8)",
    header: "rgba(23,23,23,0.8)",
    footer: "rgba(10,10,10,0.5)",
  },
  border: {
    default: "#404040",
    hover: "#525252",
    primary: "rgba(251,191,36,0.2)",
    primaryHover: "rgba(251,191,36,0.4)",
  },
} as const;

export const STYLES = {
  // Базовый стиль прямоугольных карточек (товары, категории каталога, меню)
  card: {
    background: COLORS.background.card,
    border: `1px solid ${COLORS.border.default}`,
    borderRadius: 16,
    transition: "all 0.3s ease",
  },
  // Расширенная карточка (используется в раскрытом состоянии)
  cardExpanded: {
    background: COLORS.background.cardExpanded,
    border: `1px solid ${COLORS.border.hover}`,
  },
  // Основная кнопка
  button: {
    border: `1px solid ${COLORS.border.primary}`,
    color: COLORS.primary,
    padding: "12px 20px",
    borderRadius: 10,
    background: "rgba(251,191,36,0.08)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontWeight: 600,
    fontSize: 14,
    boxShadow: "0 2px 8px rgba(251,191,36,0.1)",
  },
  // Ховер-состояние для основной кнопки
  buttonHover: {
    background: "rgba(251,191,36,0.15)",
    border: `1px solid ${COLORS.border.primaryHover}`,
    transform: "translateX(-4px)",
  },
  // Чип размеров у позиций
  sizeBadge: {
    background: "rgba(251,191,36,0.15)",
    color: COLORS.primary,
    padding: "4px 10px",
    borderRadius: 6,
    fontSize: 12,
    border: "1px solid rgba(251,191,36,0.3)",
  },
  // Бейдж категории в меню или каталоге
  categoryBadge: {
    background: "rgba(245, 158, 11, 0.2)",
    color: "#fde68a",
    fontSize: 12,
    padding: "4px 12px",
    borderRadius: 999,
    border: "1px solid rgba(245, 158, 11, 0.4)",
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
    borderRadius: isMobile ? 16 : 20,
    padding: isMobile ? SPACING.md : SPACING.lg,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05)",
    transition: "all 0.2s ease",
  }),
  tableHeader: (isMobile: boolean) => ({
    padding: isMobile ? "10px 12px" : "14px 18px",
    background: COLORS.background.card,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
    color: COLORS.text.secondary,
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
} as const;

// Готовые эффекты наведения для карточек разных типов
export const CARD_HOVER_EFFECTS = {
  // Плитка категории в меню каталога
  category: {
    hover: {
      transform: "translateY(-4px) scale(1.02)",
      boxShadow: "0 8px 32px rgba(251,191,36,0.2)",
      border: `1px solid ${COLORS.border.primaryHover}`,
    },
    default: {
      transform: "translateY(0) scale(1)",
      boxShadow: "none",
      border: `1px solid ${COLORS.border.default}`,
    },
  },
  // Карточка товара
  product: {
    hover: {
      transform: "translateY(-4px)",
      boxShadow: "0 8px 32px rgba(251,191,36,0.2)",
    },
    default: {
      transform: "translateY(0)",
      boxShadow: "none",
    },
  },
  // Карточка в разделе «Что по бабкам»
  money: {
    hover: {
      boxShadow:
        "0 12px 48px rgba(0, 0, 0, 0.3), 0 6px 24px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(251,191,36,0.15)",
      transform: "translateY(-2px)",
    },
    default: {
      boxShadow:
        "0 8px 32px rgba(0, 0, 0, 0.2), 0 4px 16px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(251,191,36,0.1)",
      transform: "translateY(0)",
    },
  },
  work: {
    hover: {
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(0, 0, 0, 0.1)",
      transform: "translateY(-2px)",
      background: COLORS.background.cardExpanded,
      border: `1px solid ${COLORS.border.primaryHover}`,
    },
    default: {
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05)",
      transform: "translateY(0)",
      background: COLORS.background.card,
      border: `1px solid ${COLORS.border.default}`,
    },
  },
} as const;


