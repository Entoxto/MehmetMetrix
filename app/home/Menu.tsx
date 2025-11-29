"use client";

/**
 * Компонент стартового меню.
 * Показывает три карточки: «что по бабкам», «проконтролировать работу», «каталог».
 * Рисует интерактивную сетку по данным с иконками, описанием и обработчиком клика.
 * По нажатию вызывает переданный onClick и переключает экран главной страницы.
 */
import styles from "./Menu.module.css";

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
  return (
    <main className={styles.main}>
      {items.map((item) => (
        <button
          key={item.title}
          onClick={item.onClick}
          className={styles.card}
          type="button"
        >
          <div className={styles.cardHeader}>
            <span className={styles.icon}>{item.icon}</span>
            <h2 className={styles.title}>{item.title}</h2>
          </div>
          {item.image && (
            <div className={styles.imageContainer}>
              <img src={item.image} alt={item.title} className={styles.image} />
            </div>
          )}
          <p className={styles.description}>{item.description}</p>
        </button>
      ))}
    </main>
  );
};
