"use client";

/**
 * Компонент стартового меню.
 * Показывает три карточки: «что по бабкам», «проконтролировать работу», «каталог».
 * Рисует интерактивную сетку по данным с иконками, описанием и обработчиком клика.
 * По нажатию вызывает переданный onClick и переключает экран главной страницы.
 */
import Image from "next/image";
import { useState } from "react";
import { createCardHoverHandlers } from "@/lib/utils";
import { getOptimizedImagePath, getJpgFallbackPath, getBlurPlaceholder } from "@/lib/imageUtils";
import { MENU_STYLES } from "./styles";

export interface MenuItem {
  title: string;
  description: string;
  icon: string;
  image?: string;
  onClick: () => void;
}

interface MenuProps {
  items: MenuItem[];
}

export const Menu = ({ items }: MenuProps) => {
  const hoverHandlers = createCardHoverHandlers(
    MENU_STYLES.cardHover,
    MENU_STYLES.cardDefault
  );

  return (
    <main style={MENU_STYLES.main}>
      {items.map((item, index) => {
        const MenuItemImage = ({ imagePath }: { imagePath: string }) => {
          const [imageSrc, setImageSrc] = useState<string>(imagePath);
          const [imageError, setImageError] = useState(false);

          return (
            <div style={{ ...MENU_STYLES.imageContainer, position: "relative" }}>
              {imageError ? (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#666",
                    fontSize: 48,
                  }}
                >
                  📷
                </div>
              ) : (
                <Image
                  src={imageSrc}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{
                    objectFit: "cover",
                    objectPosition: "top center",
                    ...MENU_STYLES.image,
                  }}
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL={getBlurPlaceholder()}
                  unoptimized={true}
                  onError={() => {
                    if (imageSrc.includes('/webp/')) {
                      // Пытаемся загрузить JPG fallback
                      const jpgPath = getJpgFallbackPath(imageSrc);
                      setImageSrc(jpgPath);
                    } else {
                      // И JPG не загрузился - показываем эмодзи
                      setImageError(true);
                    }
                  }}
                />
              )}
            </div>
          );
        };

        const optimizedImage = item.image ? getOptimizedImagePath(item.image) : null;
        
        return (
          <div
            key={index}
            onClick={item.onClick}
            {...hoverHandlers}
            style={MENU_STYLES.card}
          >
            <div style={MENU_STYLES.cardHeader}>
              <span style={MENU_STYLES.icon}>{item.icon}</span>
              <h2 style={MENU_STYLES.title}>{item.title}</h2>
            </div>
            {optimizedImage && <MenuItemImage imagePath={optimizedImage} />}
            <p style={MENU_STYLES.description}>
              {item.description}
            </p>
          </div>
        );
      })}
    </main>
  );
};
