"use client";

import { useRouter } from "next/navigation";
import { Shell } from "@/components/Shell";
import { Menu, type MenuItem } from "@/app/home/Menu";

export default function HomePage() {
  const router = useRouter();

  const menuItems: MenuItem[] = [
    {
      title: "Посмотреть, что по бабкам",
      description: "Финансы, депозиты и расчёты с Мехметом — где деньги, Лебовски?",
      onClick: () => router.push("/money"),
      icon: "💰",
      image: "/images/products/jpg/что по бабкам.JPG",
    },
    {
      title: "Проконтролировать работу",
      description: "Посмотри, кто что шьёт, что готово, что на ремонте и у кого кофе закончился.",
      onClick: () => router.push("/work"),
      icon: "🧥",
      image: "/images/products/jpg/Проконтролировать работу.jpg",
    },
    {
      title: "Каталог изделий",
      description: "Листай, смотри, восхищайся",
      onClick: () => router.push("/catalog"),
      icon: "📦",
      image: "/images/products/jpg/Каталог.JPG",
    },
  ];

  return (
    <Shell>
      <Menu items={menuItems} />
    </Shell>
  );
}
