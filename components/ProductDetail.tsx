"use client";

import React from "react";
import { STYLES, COLORS } from "@/constants/styles";
import type { Product } from "@/types/product";

interface ProductDetailProps {
  product: Product;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
  return (
    <div style={{ flex: 1, padding: 32 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "stretch" }}>
        <div
          style={{
            width: "100%",
            minHeight: 600,
            height: 600,
            background: COLORS.background.cardExpanded,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <img
            src={product.photo}
            alt={product.name}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              target.parentElement!.innerHTML =
                '<span style="color: #737373; font-size: 80px;">📷</span>';
            }}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
        <div
          style={{
            width: "100%",
            minHeight: 600,
            height: 600,
            ...STYLES.card,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box",
            gap: 20,
          }}
        >
          <div>
            <div>
              <p
                style={{
                  color: COLORS.text.secondary,
                  fontSize: 15,
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                Размеры
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {product.sizes.map((size: string, i: number) => (
                  <span key={i} style={STYLES.sizeBadgeLarge}>
                    {size}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              {/* NOTE: All prices are in USD dollars only */}
              <p
                style={{
                  color: COLORS.text.secondary,
                  fontSize: 15,
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                Цена
              </p>
              {product.price ? (
                <p style={{ color: COLORS.success, fontSize: 40, fontWeight: 700 }}>
                  ${product.price.toLocaleString()}
                </p>
              ) : (
                <p style={{ color: COLORS.primary, fontSize: 40, fontWeight: 700 }}>
                  уточняется
                </p>
              )}
            </div>
          </div>

          {product.materials && (
            <div style={{ paddingTop: 20, borderTop: `1px solid ${COLORS.border.default}` }}>
              <p
                style={{
                  color: COLORS.text.secondary,
                  fontSize: 15,
                  textTransform: "uppercase",
                  marginBottom: 16,
                }}
              >
                Материалы
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {product.materials.outer && (
                  <div>
                    <p style={{ color: COLORS.text.secondary, fontSize: 14, marginBottom: 6 }}>
                      Верхний материал
                    </p>
                    <p style={{ color: COLORS.text.primary, fontSize: 18 }}>
                      {product.materials.outer}
                    </p>
                  </div>
                )}
                {product.materials.lining && (
                  <div>
                    <p style={{ color: COLORS.text.secondary, fontSize: 14, marginBottom: 6 }}>
                      Подкладка
                    </p>
                    <p style={{ color: COLORS.text.primary, fontSize: 18 }}>
                      {product.materials.lining}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

