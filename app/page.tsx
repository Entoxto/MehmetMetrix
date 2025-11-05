"use client";

import React from "react";
import productsData from "@/data/products.json";
import type { Product, ProductsData } from "@/types/product";

export default function HomePage() {
  const [view, setView] = React.useState<"menu" | "catalog" | "money" | "work" | "task">("menu");
  const [expandedCards, setExpandedCards] = React.useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  
  const productsDataTyped = productsData as ProductsData;
  const products: Product[] = productsDataTyped.products;

  const menuItems = [
    {
      title: "Посмотреть, что по бабкам",
      description: "Финансы, депозиты и расчёты с Мехметом — где деньги, Лебовски?",
      onClick: () => setView("money"),
      icon: "💰",
    },
    {
      title: "Проконтролировать работу",
      description: "Посмотри, кто что шьёт, что готово, что на ремонте и у кого кофе закончился.",
      onClick: () => setView("work"),
      icon: "🧥",
    },
    {
      title: "Каталог изделий",
      description: "Листай, смотри, восхищайся и охуевай от крутости каждой шкуры.",
      onClick: () => setView("catalog"),
      icon: "📦",
    },
    {
      title: "Подкинуть задачу",
      description: "Хочешь добавить изделие, комментарий или отчёт? Жми сюда и не тормози.",
      onClick: () => setView("task"),
      icon: "📝",
    },
  ];

  const categoryDescriptions: Record<string, string> = {
    "Мех": "Меринос, чернобурка, нутрия — всё, что хочется гладить.",
    "Замша": "Мягкая, как голос Мехмета, когда он говорит про сроки.",
    "Кожа": "Коровка старалась, не подведи её в каталоге.",
    "Экзотика": "Для тех, кто любит, чтобы шкура шипела дорого.",
  };

  const catalogGroups = React.useMemo(() => {
    const categories = Array.from(new Set(products.map((p: Product) => p.category)));
    return categories.map((cat: string) => ({
      title: cat,
      desc: categoryDescriptions[cat] || "",
      badge: `${products.filter((p: Product) => p.category === cat).length} ${products.filter((p: Product) => p.category === cat).length === 1 ? "позиция" : "позиций"}`,
    }));
  }, [products]);

  const handleBack = () => {
    if (selectedProduct) {
      // Если на странице товара, возвращаемся к списку категории
      setSelectedProduct(null);
      return;
    }
    if (selectedCategory) {
      // Если на странице категории, возвращаемся к списку категорий
      setSelectedCategory(null);
      return;
    }
    // Если не в каталоге, возвращаемся в меню
    if (view !== "menu") {
      setView("menu");
    }
  };

  const BackButton = (view !== "menu" || selectedCategory || selectedProduct) ? (
    <button
      onClick={handleBack}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(251,191,36,0.15)";
        e.currentTarget.style.border = "1px solid rgba(251,191,36,0.4)";
        e.currentTarget.style.transform = "translateX(-4px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(251,191,36,0.08)";
        e.currentTarget.style.border = "1px solid rgba(251,191,36,0.2)";
        e.currentTarget.style.transform = "translateX(0)";
      }}
      style={{
        border: "1px solid rgba(251,191,36,0.2)",
        color: "#fbbf24",
        padding: "12px 20px",
        borderRadius: 10,
        background: "rgba(251,191,36,0.08)",
        cursor: "pointer",
        transition: "all 0.3s ease",
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontWeight: 600,
        fontSize: 14,
        boxShadow: "0 2px 8px rgba(251,191,36,0.1)",
      }}
    >
      <span style={{ fontSize: 18 }}>←</span> Назад
    </button>
  ) : null;

  const Card = ({ 
    children, 
    padding = 16, 
    expandable = false, 
    cardId = "",
    expanded = false 
  }: { 
    children: React.ReactNode; 
    padding?: number;
    expandable?: boolean;
    cardId?: string;
    expanded?: boolean;
  }) => (
    <div
      onClick={expandable ? () => {
        setExpandedCards(prev => {
          const newSet = new Set(prev);
          if (expanded) {
            newSet.delete(cardId);
          } else {
            newSet.add(cardId);
          }
          return newSet;
        });
      } : undefined}
      style={{
        background: expanded ? "rgba(56,56,56,0.8)" : "rgba(38,38,38,0.6)",
        border: expanded ? "1px solid #525252" : "1px solid #404040",
        borderRadius: 16,
        padding,
        cursor: expandable ? "pointer" : "default",
        transition: "all 0.3s ease",
      }}
    >
      {children}
    </div>
  );

  const renderBody = () => {
    if (view === "money") {
      return (
        <div style={{ flex: 1, padding: 32, display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ marginBottom: 8, textAlign: "center" }}>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: "#fbbf24", marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              Надвигающаяся расплата <span style={{ fontSize: 28 }}>💸</span>
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 0, alignItems: "center" }}>
            {/* ЛЕВАЯ ЧАСТЬ - ОПЛАТЫ */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingRight: 32 }}>
              <Card 
                expandable 
                cardId="total_payment" 
                expanded={expandedCards.has("total_payment")}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ color: "#a3a3a3", fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>Всего к оплате</p>
                    {expandedCards.has("total_payment") && <span style={{ fontSize: 12, transition: "transform 0.3s ease" }}>▼</span>}
                    {!expandedCards.has("total_payment") && <span style={{ fontSize: 12 }}>▶</span>}
                  </div>
                  <p style={{ fontSize: 32, fontWeight: 900, color: "#f87171", letterSpacing: -1 }}>$12 480</p>
                  <p style={{ fontSize: 12, color: "#737373", fontStyle: "italic" }}>По данным из Excel: "поставки"</p>
                  {expandedCards.has("total_payment") && (
                    <div style={{ 
                      marginTop: 16, 
                      paddingTop: 16, 
                      borderTop: "1px solid #404040",
                      animation: "fadeIn 0.3s ease"
                    }}>
                      <p style={{ fontSize: 13, color: "#a3a3a3", marginBottom: 8 }}>Детализация:</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                          <span style={{ color: "#d4d4d4" }}>Октябрьская поставка</span>
                          <span style={{ color: "#f87171", fontWeight: 600 }}>$5 200</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                          <span style={{ color: "#d4d4d4" }}>Ремонт изделий</span>
                          <span style={{ color: "#f87171", fontWeight: 600 }}>$3 800</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                          <span style={{ color: "#d4d4d4" }}>Дополнительные материалы</span>
                          <span style={{ color: "#f87171", fontWeight: 600 }}>$2 980</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                          <span style={{ color: "#d4d4d4" }}>Фрахт</span>
                          <span style={{ color: "#f87171", fontWeight: 600 }}>$500</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* РАЗДЕЛИТЕЛЬ */}
            <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              justifyContent: "center",
              height: "100%",
              minHeight: 200,
              padding: "0 16px"
            }}>
              <div style={{
                width: 2,
                height: "100%",
                background: "linear-gradient(to bottom, transparent, rgba(251,191,36,0.3) 10%, rgba(251,191,36,0.3) 90%, transparent)",
              }} />
            </div>

            {/* ПРАВАЯ ЧАСТЬ - ДЕПОЗИТЫ */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingLeft: 32 }}>
              <Card 
                expandable 
                cardId="deposits" 
                expanded={expandedCards.has("deposits")}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ color: "#a3a3a3", fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>Депозитов внесено</p>
                    {expandedCards.has("deposits") && <span style={{ fontSize: 12, transition: "transform 0.3s ease" }}>▼</span>}
                    {!expandedCards.has("deposits") && <span style={{ fontSize: 12 }}>▶</span>}
                  </div>
                  <p style={{ fontSize: 32, fontWeight: 900, color: "#34d399", letterSpacing: -1 }}>$7 000</p>
                  <p style={{ fontSize: 12, color: "#737373", fontStyle: "italic" }}>Лист: "депозиты"</p>
                  {expandedCards.has("deposits") && (
                    <div style={{ 
                      marginTop: 16, 
                      paddingTop: 16, 
                      borderTop: "1px solid #404040",
                      animation: "fadeIn 0.3s ease"
                    }}>
                      <p style={{ fontSize: 13, color: "#a3a3a3", marginBottom: 8 }}>Последние депозиты:</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                          <span style={{ color: "#d4d4d4" }}>25.10.2025 — перевод</span>
                          <span style={{ color: "#34d399", fontWeight: 600 }}>$2 000</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                          <span style={{ color: "#d4d4d4" }}>21.10.2025 — наличные</span>
                          <span style={{ color: "#34d399", fontWeight: 600 }}>$1 500</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                          <span style={{ color: "#d4d4d4" }}>18.10.2025 — банк</span>
                          <span style={{ color: "#34d399", fontWeight: 600 }}>$3 500</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      );
    }

    if (view === "catalog") {
      const categoryProducts = selectedCategory 
        ? products.filter((p: Product) => p.category === selectedCategory)
        : [];

      if (selectedCategory && !selectedProduct) {
        return (
          <div style={{ flex: 1, padding: 32 }}>
            <div style={{ marginBottom: 24 }}>
              <p style={{ color: "#a3a3a3", fontSize: 13, fontStyle: "italic" }}>
                {categoryDescriptions[selectedCategory]}
              </p>
            </div>
            <div style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
              {categoryProducts.map((product) => (
                <Card 
                  key={product.id} 
                  padding={0}
                  expandable={false}
                >
                  <div
                    onClick={() => setSelectedProduct(product)}
                    style={{
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      const card = e.currentTarget.closest("div[style*='border-radius']") as HTMLElement;
                      if (card) card.style.boxShadow = "0 8px 32px rgba(251,191,36,0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      const card = e.currentTarget.closest("div[style*='border-radius']") as HTMLElement;
                      if (card) card.style.boxShadow = "none";
                    }}
                  >
                    <div style={{ 
                      width: "100%", 
                      height: 300, 
                      background: "rgba(56,56,56,0.8)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderTopLeftRadius: 16,
                      borderTopRightRadius: 16,
                      overflow: "hidden",
                    }}>
                      <img 
                        src={product.photo} 
                        alt={product.name}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          target.parentElement!.innerHTML = '<span style="color: #737373; font-size: 48px;">📷</span>';
                        }}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                    <div style={{ padding: 20 }}>
                      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: "#fbbf24" }}>
                        {product.name}
                      </h3>
                      {product.description && (
                        <p style={{ color: "#d4d4d4", fontSize: 13, marginBottom: 12, lineHeight: 1.4 }}>
                          {product.description}
                        </p>
                      )}
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div>
                          <p style={{ color: "#a3a3a3", fontSize: 11, textTransform: "uppercase", marginBottom: 4 }}>Размеры</p>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {product.sizes.map((size: string, i: number) => (
                              <span 
                                key={i}
                                style={{
                                  background: "rgba(251,191,36,0.15)",
                                  color: "#fbbf24",
                                  padding: "4px 10px",
                                  borderRadius: 6,
                                  fontSize: 12,
                                  border: "1px solid rgba(251,191,36,0.3)",
                                }}
                              >
                                {size}
                              </span>
                            ))}
                          </div>
                        </div>
                        {product.price && (
                          <div>
                            <p style={{ color: "#a3a3a3", fontSize: 11, textTransform: "uppercase", marginBottom: 4 }}>Цена</p>
                            <p style={{ color: "#34d399", fontSize: 20, fontWeight: 700 }}>${Math.round(product.price / 92).toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      }

      if (selectedProduct) {
        return (
          <div style={{ flex: 1, padding: 32 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "stretch" }}>
              <div style={{ 
                width: "100%", 
                minHeight: 600,
                height: 600,
                background: "rgba(56,56,56,0.8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 16,
                overflow: "hidden",
              }}>
                <img 
                  src={selectedProduct.photo} 
                  alt={selectedProduct.name}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    target.parentElement!.innerHTML = '<span style="color: #737373; font-size: 80px;">📷</span>';
                  }}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
              <div style={{ 
                width: "100%", 
                minHeight: 600,
                height: 600,
                background: "rgba(38,38,38,0.6)",
                border: "1px solid #404040",
                borderRadius: 16,
                padding: 24,
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
                gap: 20
              }}>
                <div>
                  <div>
                    <p style={{ color: "#a3a3a3", fontSize: 15, textTransform: "uppercase", marginBottom: 12 }}>Размеры</p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {selectedProduct.sizes.map((size: string, i: number) => (
                        <span 
                          key={i}
                          style={{
                            background: "rgba(251,191,36,0.15)",
                            color: "#fbbf24",
                            padding: "10px 18px",
                            borderRadius: 8,
                            fontSize: 18,
                            fontWeight: 600,
                            border: "1px solid rgba(251,191,36,0.3)",
                          }}
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedProduct.price && (
                    <div style={{ marginTop: 24 }}>
                      <p style={{ color: "#a3a3a3", fontSize: 15, textTransform: "uppercase", marginBottom: 12 }}>Цена</p>
                      <p style={{ color: "#34d399", fontSize: 40, fontWeight: 700 }}>${Math.round(selectedProduct.price / 92).toLocaleString()}</p>
                    </div>
                  )}
                </div>

                {selectedProduct.materials && (
                  <div style={{ paddingTop: 20, borderTop: "1px solid #404040" }}>
                    <p style={{ color: "#a3a3a3", fontSize: 15, textTransform: "uppercase", marginBottom: 16 }}>Материалы</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {selectedProduct.materials.outer && (
                        <div>
                          <p style={{ color: "#a3a3a3", fontSize: 14, marginBottom: 6 }}>Верхний материал</p>
                          <p style={{ color: "#d4d4d4", fontSize: 18 }}>{selectedProduct.materials.outer}</p>
                        </div>
                      )}
                      {selectedProduct.materials.lining && (
                        <div>
                          <p style={{ color: "#a3a3a3", fontSize: 14, marginBottom: 6 }}>Подкладка</p>
                          <p style={{ color: "#d4d4d4", fontSize: 18 }}>{selectedProduct.materials.lining}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }

      return (
        <div style={{ flex: 1, padding: 32 }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: "#fbbf24", marginBottom: 6 }}>Каталог</h2>
            <p style={{ color: "#a3a3a3", fontSize: 13, fontStyle: "italic" }}>Выбери, чем сегодня восхищаться.</p>
          </div>
          <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            {catalogGroups.map((g, i) => (
              <div 
                key={i} 
                onClick={() => setSelectedCategory(g.title as string)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(251,191,36,0.2)";
                  e.currentTarget.style.border = "1px solid rgba(251,191,36,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.border = "1px solid #404040";
                }}
                style={{ 
                  background: "rgba(38,38,38,0.6)", 
                  border: "1px solid #404040", 
                  borderRadius: 16, 
                  padding: 20, 
                  cursor: "pointer", 
                  display: "flex", 
                  flexDirection: "column", 
                  justifyContent: "space-between",
                  transition: "all 0.3s ease",
                }}
              >
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>{g.title}</h3>
                  <p style={{ color: "#d4d4d4", fontSize: 12, marginBottom: 12, lineHeight: 1.4 }}>{g.desc}</p>
                </div>
                <span style={{ display: "inline-flex", width: "max-content", background: "rgba(245, 158, 11, 0.2)", color: "#fde68a", fontSize: 12, padding: "4px 12px", borderRadius: 999, border: "1px solid rgba(245, 158, 11, 0.4)" }}>{g.badge}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (view === "work") {
      return (
        <div style={{ flex: 1, padding: 32, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: "#fbbf24", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
              Что сейчас в работе <span style={{ fontSize: 28 }}>🧵</span>
            </h2>
            <p style={{ color: "#a3a3a3", fontSize: 13, fontStyle: "italic" }}>Здесь будут партии + изделия со статусами.</p>
          </div>
          <Card>
            <div style={{ padding: 12, color: "#d4d4d4", fontSize: 14, fontStyle: "italic" }}>
              Пока нет живых данных. Дальше сюда встанут: "Октябрьская поставка", "Зима 25", "Ремонт".
            </div>
          </Card>
        </div>
      );
    }

    if (view === "task") {
      return (
        <div style={{ flex: 1, padding: 32, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: "#fbbf24", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
              Подкинуть задачу <span style={{ fontSize: 28 }}>📝</span>
            </h2>
            <p style={{ color: "#a3a3a3", fontSize: 13, fontStyle: "italic" }}>Типа формы: что добавить / что не так / что сфоткать в Турции.</p>
          </div>
          <Card>
            <div style={{ padding: 12, color: "#d4d4d4", fontSize: 14 }}>
              Здесь можно будет выбрать: [добавить изделие] [добавить фото] [комментарий к поставке] — и оно улетит в бота.
            </div>
          </Card>
        </div>
      );
    }

    return (
      <main style={{ flex: 1, padding: 32, display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        {menuItems.map((item, index) => (
          <div
            key={index}
            onClick={item.onClick}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(251,191,36,0.3)";
              e.currentTarget.style.border = "1px solid rgba(251,191,36,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.4)";
              e.currentTarget.style.border = "1px solid #404040";
            }}
            style={{
              background: "rgba(38,38,38,0.6)",
              border: "1px solid #404040",
              borderRadius: 16,
              padding: 24,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 24 }}>{item.icon}</span>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fbbf24" }}>{item.title}</h2>
            </div>
            <p style={{ color: "#d4d4d4", fontSize: 14, fontStyle: "italic", lineHeight: 1.5 }}>{item.description}</p>
          </div>
        ))}
      </main>
    );
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #0a0a0a 0%, #171717 100%)", 
      color: "white", 
      display: "flex", 
      flexDirection: "column" 
    }}>
      <header style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr auto 1fr", 
        alignItems: "center", 
        padding: "20px 32px", 
        borderBottom: "1px solid rgba(102,102,102,0.2)",
        background: "rgba(23,23,23,0.8)",
        backdropFilter: "blur(10px)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 36 }}>⚡</span>
          <h1 style={{ fontSize: 44, fontWeight: 900, letterSpacing: -1.5, color: "#fbbf24", textShadow: "0 0 20px rgba(251,191,36,0.5)" }}>
            Mehmet Metrics
          </h1>
        </div>
        {selectedProduct ? (
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: "#fbbf24", margin: 0 }}>
              {selectedProduct.name}
            </h2>
          </div>
        ) : selectedCategory ? (
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: "#fbbf24", margin: 0 }}>
              {selectedCategory}
            </h2>
          </div>
        ) : (
          <div></div>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          {BackButton}
        </div>
      </header>
      {renderBody()}
      <footer style={{ 
        padding: 20, 
        textAlign: "center", 
        color: "#737373", 
        borderTop: "1px solid rgba(102,102,102,0.2)", 
        fontSize: 12, 
        fontStyle: "italic",
        background: "rgba(10,10,10,0.5)"
      }}>
        Сделано с любовью, дерзостью и лёгким запахом кожи © {new Date().getFullYear()}
      </footer>
    </div>
  );
}


