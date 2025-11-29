"use client";

/**
 * Компонент стартового меню.
 * Показывает три карточки: «что по бабкам», «проконтролировать работу», «каталог».
 * Рисует интерактивную сетку по данным с иконками, описанием и обработчиком клика.
 * По нажатию вызывает переданный onClick и переключает экран главной страницы.
 */
import Image from "next/image";
import { createCardHoverHandlers } from "@/lib/utils";
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
      {items.map((item, index) => (
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
          {item.image && (
            <div style={{ ...MENU_STYLES.imageContainer, position: "relative" }}>
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                style={{
                  objectFit: "cover",
                  ...MENU_STYLES.image,
                }}
                loading="lazy"
              />
            </div>
          )}
          <p style={MENU_STYLES.description}>
            {item.description}
          </p>
        </div>
      ))}
    </main>
  );
};
