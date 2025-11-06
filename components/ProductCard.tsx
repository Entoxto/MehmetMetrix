"use client";

import Link from "next/link";
import { Card } from "./Card";
import { STYLES, COLORS, CARD_HOVER_EFFECTS } from "@/constants/styles";
import { createCardHoverHandlers } from "@/lib/utils";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const hoverHandlers = createCardHoverHandlers(
    CARD_HOVER_EFFECTS.product.hover,
    CARD_HOVER_EFFECTS.product.default
  );

  return (
    <Card padding={0} expandable={false}>
      <Link
        href={`/catalog/${product.id}`}
        prefetch={false}
        style={{
          cursor: "pointer",
          transition: "all 0.3s ease",
          textDecoration: "none",
          display: "block",
        }}
        onMouseEnter={(e) => {
          hoverHandlers.onMouseEnter(e);
          const card = e.currentTarget.closest("div[style*='border-radius']") as HTMLElement;
          if (card) card.style.boxShadow = CARD_HOVER_EFFECTS.product.hover.boxShadow || "none";
        }}
        onMouseLeave={(e) => {
          hoverHandlers.onMouseLeave(e);
          const card = e.currentTarget.closest("div[style*='border-radius']") as HTMLElement;
          if (card) card.style.boxShadow = CARD_HOVER_EFFECTS.product.default.boxShadow || "none";
        }}
      >
        <div
          style={{
            width: "100%",
            height: 300,
            background: COLORS.background.cardExpanded,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            overflow: "hidden",
          }}
        >
          <img
            src={product.photo}
            alt={product.name}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = '<span style="color: #737373; font-size: 48px;">📷</span>';
              }
            }}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
        <div style={{ padding: 20, display: "flex", flexDirection: "column", minHeight: 180 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: COLORS.primary, minHeight: 60, maxHeight: 60, overflow: "hidden", lineHeight: "1.3" }}>
            {product.name}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "start" }}>
            <div>
              {/* NOTE: All prices are in USD dollars only */}
              <p
                style={{
                  color: COLORS.text.secondary,
                  fontSize: 11,
                  textTransform: "uppercase",
                  marginBottom: 4,
                  height: 15,
                  lineHeight: "15px",
                }}
              >
                Цена
              </p>
              {product.price ? (
                <p style={{ color: COLORS.success, fontSize: 20, fontWeight: 700, margin: 0, lineHeight: "24px" }}>
                  ${product.price.toLocaleString()}
                </p>
              ) : (
                <p style={{ color: COLORS.primary, fontSize: 20, fontWeight: 700, margin: 0, lineHeight: "24px" }}>
                  уточняется
                </p>
              )}
            </div>
            <div>
              <p
                style={{
                  color: COLORS.text.secondary,
                  fontSize: 11,
                  textTransform: "uppercase",
                  marginBottom: 4,
                  height: 15,
                  lineHeight: "15px",
                }}
              >
                Размеры
              </p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {product.sizes.map((size) => (
                  <span key={size} style={STYLES.sizeBadge}>
                    {size}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
};

