"use client";

/**
 * Компонент стартового меню.
 * Показывает три карточки: «что по бабкам», «проконтролировать работу», «каталог».
 * Рисует интерактивную сетку по данным с иконками, описанием и обработчиком клика.
 * По нажатию вызывает переданный onClick и переключает экран главной страницы.
 */
import { Coins, Package, Scissors } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { ClickableCard } from "@/components/ui/ClickableCard";
import { COLORS, MOTION, SPACING, STYLES, SURFACES } from "@/constants/styles";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { HOME_MENU_STYLES } from "@/components/home/homeMenuStyles";

export interface HomeMenuItem {
  title: string;
  description: string;
  icon: "money" | "work" | "catalog";
  image?: string;
  href: string;
}

interface HomeMenuProps {
  items: HomeMenuItem[];
}

const HOME_MENU_ICONS = {
  money: Coins,
  work: Scissors,
  catalog: Package,
} as const;

export const HomeMenu = ({ items }: HomeMenuProps) => {
  const router = useRouter();
  const { isMobile } = useBreakpoint();

  return (
    <main
      style={{
        ...HOME_MENU_STYLES.main,
        padding: isMobile ? 10 : HOME_MENU_STYLES.main.padding,
        gap: isMobile ? 12 : HOME_MENU_STYLES.main.gap,
        gridTemplateColumns: isMobile ? "1fr" : HOME_MENU_STYLES.main.gridTemplateColumns,
      }}
    >
      {items.map((item, index) => {
        const Icon = HOME_MENU_ICONS[item.icon];

        return (
          <ClickableCard
            key={item.href}
            onPress={() => router.push(item.href)}
            hoverVariant="lift"
              style={{
                ...HOME_MENU_STYLES.card,
                padding: isMobile ? 16 : HOME_MENU_STYLES.card.padding,
                gap: isMobile ? 12 : HOME_MENU_STYLES.card.gap,
                minHeight: isMobile ? 0 : HOME_MENU_STYLES.card.minHeight,
                borderRadius: isMobile ? 20 : 20,
              justifyContent: isMobile ? "flex-start" : HOME_MENU_STYLES.card.justifyContent,
              background: SURFACES.card,
              animation: MOTION.staggerEnter(index, isMobile ? 70 : 90),
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 0,
                left: isMobile ? SPACING.md : SPACING.lg,
                right: isMobile ? SPACING.md : SPACING.lg,
                height: 1,
                background:
                  "linear-gradient(90deg, rgba(244,195,77,0.62) 0%, rgba(244,195,77,0.14) 72%, rgba(244,195,77,0) 100%)",
              }}
            />
          <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 10 : 12 }}>
            <p style={{ ...STYLES.sectionEyebrow, margin: 0, fontSize: isMobile ? 9 : STYLES.sectionEyebrow.fontSize }}>
              Раздел {String(index + 1).padStart(2, "0")}
            </p>
            <div style={HOME_MENU_STYLES.cardHeader}>
              <Icon
                size={isMobile ? 18 : 20}
                weight="duotone"
                aria-hidden="true"
                style={HOME_MENU_STYLES.icon}
              />
              <h2
                style={{
                  ...HOME_MENU_STYLES.title,
                  fontSize: isMobile ? 18 : HOME_MENU_STYLES.title.fontSize,
                  lineHeight: isMobile ? 1.14 : HOME_MENU_STYLES.title.lineHeight,
                  letterSpacing: isMobile ? -0.25 : HOME_MENU_STYLES.title.letterSpacing,
                  color: isMobile ? COLORS.text.softTitle : HOME_MENU_STYLES.title.color,
                }}
              >
                {item.title}
              </h2>
            </div>
          </div>
          {item.image && (
            <div
              style={{
                ...HOME_MENU_STYLES.imageContainer,
                position: "relative",
                aspectRatio: isMobile ? "5 / 6" : HOME_MENU_STYLES.imageContainer.aspectRatio,
                background: SURFACES.inset,
              }}
            >
              <OptimizedImage
                src={item.image}
                alt={item.title}
                variant="card"
                sizes="(max-width: 768px) 100vw, 33vw"
                priority={index === 0}
                style={{
                  ...HOME_MENU_STYLES.image,
                  objectFit: isMobile ? "contain" : "cover",
                  objectPosition: isMobile ? "center center" : "top center",
                }}
              />
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 8 : 16 }}>
            <p style={{ ...HOME_MENU_STYLES.description, fontSize: isMobile ? 13 : HOME_MENU_STYLES.description.fontSize }}>{item.description}</p>
          </div>
          </ClickableCard>
        );
      })}
    </main>
  );
};
