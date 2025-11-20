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

import type { ReactNode } from "react";
import { headers } from "next/headers";
import { detectBreakpointFromUserAgent } from "@/lib/breakpoints";
import { BreakpointProvider } from "@/components/providers/BreakpointProvider";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const userAgent = headers().get("user-agent");
  const initialBreakpoint = detectBreakpointFromUserAgent(userAgent);

  return (
    <html lang="ru">
      <head>
        <meta name="robots" content="noindex,nofollow" />
        <style>{`
          * {
            box-sizing: border-box;
          }
          
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow-x: hidden;
            -webkit-text-size-adjust: 100%;
            -moz-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
            text-size-adjust: 100%;
          }
          
          body {
            position: relative;
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </head>
      <body>
        <BreakpointProvider initialBreakpoint={initialBreakpoint}>
          {children}
        </BreakpointProvider>
      </body>
    </html>
  );
}


