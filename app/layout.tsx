export const metadata = {
  title: "Mehmet Metrics",
  description: "Маленькая витрина для каталога и показателей",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <style>{`
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
      <body>{children}</body>
    </html>
  );
}


