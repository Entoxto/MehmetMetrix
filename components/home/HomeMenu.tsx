"use client";

/**
 * Компонент стартового меню.
 * Показывает три карточки: «что по бабкам», «проконтролировать работу», «каталог».
 * Рисует интерактивную сетку по данным с иконками, описанием и обработчиком клика.
 * По нажатию вызывает переданный onClick и переключает экран главной страницы.
 */
import { createCardHoverHandlers } from "@/lib/cardHoverHandlers";
import { useRouter } from "next/navigation";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { ClickableCard } from "@/components/ui/ClickableCard";
import { COLORS, MOTION, STYLES } from "@/constants/styles";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { HOME_MENU_STYLES } from "@/components/home/homeMenuStyles";

export interface HomeMenuItem {
  title: string;
  description: string;
  icon: string;
  image?: string;
  href: string;
}

interface HomeMenuProps {
  items: HomeMenuItem[];
}

export const HomeMenu = ({ items }: HomeMenuProps) => {
  const router = useRouter();
  const { isMobile } = useBreakpoint();
  const hoverHandlers = createCardHoverHandlers(
    HOME_MENU_STYLES.cardHover,
    HOME_MENU_STYLES.cardDefault
  );

  return (
    <main
      style={{
        ...HOME_MENU_STYLES.main,
        padding: isMobile ? 10 : HOME_MENU_STYLES.main.padding,
        gap: isMobile ? 12 : HOME_MENU_STYLES.main.gap,
        gridTemplateColumns: isMobile ? "1fr" : HOME_MENU_STYLES.main.gridTemplateColumns,
      }}
    >
      {items.map((item, index) => (
        <ClickableCard
          key={item.href}
          onPress={() => router.push(item.href)}
          {...hoverHandlers}
          style={{
            ...HOME_MENU_STYLES.card,
            padding: isMobile ? 16 : HOME_MENU_STYLES.card.padding,
            gap: isMobile ? 12 : HOME_MENU_STYLES.card.gap,
            minHeight: isMobile ? 0 : HOME_MENU_STYLES.card.minHeight,
            borderRadius: isMobile ? 20 : STYLES.card.borderRadius,
            justifyContent: isMobile ? "flex-start" : HOME_MENU_STYLES.card.justifyContent,
            background: isMobile
              ? "linear-gradient(180deg, rgba(24,24,27,0.96) 0%, rgba(18,18,21,0.98) 100%)"
              : HOME_MENU_STYLES.card.background,
            animation: MOTION.staggerEnter(index, isMobile ? 70 : 90),
            transition: MOTION.interactiveTransition,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 10 : 12 }}>
            <p style={{ ...STYLES.sectionEyebrow, margin: 0, fontSize: isMobile ? 9 : STYLES.sectionEyebrow.fontSize }}>
              Раздел {String(index + 1).padStart(2, "0")}
            </p>
            <div style={HOME_MENU_STYLES.cardHeader}>
              <span style={HOME_MENU_STYLES.icon}>{item.icon}</span>
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
                background: isMobile
                  ? "linear-gradient(180deg, rgba(20,20,24,0.92) 0%, rgba(14,14,17,0.98) 100%)"
                  : HOME_MENU_STYLES.imageContainer.background,
              }}
            >
              <OptimizedImage
                src={item.image}
                alt={item.title}
                variant="card"
                sizes="(max-width: 768px) 100vw, 33vw"
                priority={index === 0}
                style={{
                  objectFit: isMobile ? "contain" : "cover",
                  objectPosition: isMobile ? "center center" : "top center",
                  ...HOME_MENU_STYLES.image,
                }}
              />
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 8 : 16 }}>
            <p style={{ ...HOME_MENU_STYLES.description, fontSize: isMobile ? 13 : HOME_MENU_STYLES.description.fontSize }}>{item.description}</p>
          </div>
        </ClickableCard>
      ))}
    </main>
  );
};
