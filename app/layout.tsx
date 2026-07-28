import type { ReactNode } from "react";
import { Lora, Manrope } from "next/font/google";
import { BreakpointProvider } from "@/components/providers/BreakpointProvider";
import "./globals.css";

const displayFont = Lora({
  subsets: ["cyrillic", "latin"],
  variable: "--font-display",
  display: "swap",
});

const uiFont = Manrope({
  subsets: ["cyrillic", "latin"],
  variable: "--font-ui",
  display: "swap",
});

/**
 * RootLayout — общий каркас Next.js приложения.
 * Задаёт метаданные, глобальный CSS и оборачивает все страницы в <html>/<body>.
 */
export const metadata = {
  title: "Mehmet Metrics",
  description: "Маленькая витрина для каталога и показателей",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="ru" className={`${displayFont.variable} ${uiFont.variable}`}>
      <head>
        <meta name="robots" content="noindex,nofollow" />
      </head>
      <body>
        <BreakpointProvider initialBreakpoint="desktop">
          {children}
        </BreakpointProvider>
      </body>
    </html>
  );
}
