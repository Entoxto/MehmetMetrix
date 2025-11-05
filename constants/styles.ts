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
  card: {
    background: COLORS.background.card,
    border: `1px solid ${COLORS.border.default}`,
    borderRadius: 16,
    transition: "all 0.3s ease",
  },
  cardExpanded: {
    background: COLORS.background.cardExpanded,
    border: `1px solid ${COLORS.border.hover}`,
  },
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
  buttonHover: {
    background: "rgba(251,191,36,0.15)",
    border: `1px solid ${COLORS.border.primaryHover}`,
    transform: "translateX(-4px)",
  },
  sizeBadge: {
    background: "rgba(251,191,36,0.15)",
    color: COLORS.primary,
    padding: "4px 10px",
    borderRadius: 6,
    fontSize: 12,
    border: "1px solid rgba(251,191,36,0.3)",
  },
  categoryBadge: {
    background: "rgba(245, 158, 11, 0.2)",
    color: "#fde68a",
    fontSize: 12,
    padding: "4px 12px",
    borderRadius: 999,
    border: "1px solid rgba(245, 158, 11, 0.4)",
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;


