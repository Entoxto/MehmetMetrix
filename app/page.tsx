import { AppShell } from "@/components/layout/AppShell";
import { HomeMenu, type HomeMenuItem } from "@/components/home/HomeMenu";

const menuItems: HomeMenuItem[] = [
  {
    title: "Посмотреть, что по бабкам",
    description: "Финансы, депозиты и расчёты с Мехметом — где деньги, Лебовски?",
    href: "/money",
    icon: "💰",
    image: "/images/products/jpg/что по бабкам.JPG",
  },
  {
    title: "Проконтролировать работу",
    description: "Посмотри, кто что шьёт, что готово, что на ремонте и у кого кофе закончился.",
    href: "/work",
    icon: "🧥",
    image: "/images/products/jpg/Проконтролировать работу.jpg",
  },
  {
    title: "Каталог изделий",
    description: "Листай, смотри, восхищайся",
    href: "/catalog",
    icon: "📦",
    image: "/images/products/jpg/Каталог.JPG",
  },
];

export default function HomePage() {
  return (
    <AppShell>
      <HomeMenu items={menuItems} />
    </AppShell>
  );
}
