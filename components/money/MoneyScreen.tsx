"use client";

/**
 * Экран финансов «Что по бабкам».
 * Суммирует партии и передаёт данные в карточки финансовой детализации.
 */
import { Fragment, useState } from "react";
import Link from "next/link";
import { COLORS, SPACING, TYPOGRAPHY, STYLES, CARD_TEMPLATES, MOTION } from "@/constants/styles";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { MoneyMetricCard } from "@/components/money/MoneyMetricCard";
import type { MoneyStatusItem, MoneyDepositItem } from "@/lib/money";

interface MoneyScreenProps {
  pending: {
    total: number;
    items: MoneyStatusItem[];
  };
  deposits: {
    total: number;
    items: MoneyDepositItem[];
  };
}

export const MoneyScreen = ({
  pending,
  deposits,
}: MoneyScreenProps) => {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const { isMobile, isWide: isDesktop } = useBreakpoint();
  const toggleCard = (cardId: string) => {
    setExpandedCards((current) => {
      const next = new Set(current);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };
  const introDescription = isMobile
    ? "Сколько ещё нужно оплатить и сколько уже внесено депозитами и предоплатами."
    : "Слева то, что ещё нужно оплатить, справа уже внесённые депозиты и предоплаты.";
  const introCopyStyle = STYLES.pageIntroCopy(isMobile);

  const responsiveTypography = {
    h2: { ...TYPOGRAPHY.h2, fontSize: isMobile ? 20 : 28 },
    body: { ...TYPOGRAPHY.body, fontSize: isMobile ? 12 : 14 },
    amount: { ...TYPOGRAPHY.amount, fontSize: isMobile ? 30 : 36 },
  } as const;

  return (
    <div
      style={{
        flex: 1,
        padding: isMobile ? SPACING.smPlus : SPACING.xl,
        paddingTop: isMobile ? SPACING.smPlus : SPACING.lg,
        paddingBottom: isMobile ? SPACING.smPlus : SPACING.lg,
        display: "flex",
        flexDirection: "column",
        gap: isMobile ? SPACING.smPlus : SPACING.xl * 2,
      }}
    >
      <div style={{ ...CARD_TEMPLATES.pageIntro(isMobile), animation: MOTION.softEnter }}>
        <h2
          style={{
            ...responsiveTypography.h2,
            color: COLORS.text.primary,
            margin: 0,
          }}
        >
          Надвигающаяся расплата
        </h2>
        <p style={introCopyStyle}>
          {introDescription}
        </p>
      </div>

      <div
        style={{
          display: isMobile ? "flex" : "grid",
          flexDirection: isMobile ? "column" : undefined,
          gridTemplateColumns: isMobile ? undefined : "1fr auto 1fr",
          gap: isMobile ? SPACING.lg : SPACING.xl * 2,
          alignItems: "stretch",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 20 : SPACING.lg, width: "100%" }}>
          <MoneyMetricCard
            animationIndex={0}
            label="Всего к оплате"
            total={pending.total}
            summary="По данным из партий и предоплат"
            amountColor={COLORS.error}
            isExpanded={expandedCards.has("total_payment")}
            onToggle={() => toggleCard("total_payment")}
            isMobile={isMobile}
            isDesktop={isDesktop}
            bodyTypography={responsiveTypography.body}
            amountTypography={responsiveTypography.amount}
            details={{
              items: pending.items,
              emptyText: "Все партии оплачены",
              amountColor: COLORS.error,
              getKey: (item: MoneyStatusItem) => item.id,
              getAmount: (item: MoneyStatusItem) => item.amount,
              renderLabel: (item: MoneyStatusItem) => (
                item.href ? (
                  <Link
                    href={item.href}
                    onClick={(event) => event.stopPropagation()}
                    style={{
                      ...responsiveTypography.body,
                      color: COLORS.text.primary,
                      margin: 0,
                      overflowWrap: "break-word",
                      wordBreak: "break-word",
                      whiteSpace: "normal",
                      textDecoration: "underline",
                      textDecorationStyle: "dotted",
                      textUnderlineOffset: 2,
                    }}
                  >
                    {item.title}
                  </Link>
                ) : (
                  <span
                    style={{
                      ...responsiveTypography.body,
                      color: COLORS.text.primary,
                      margin: 0,
                      overflowWrap: "break-word",
                      wordBreak: "break-word",
                      whiteSpace: "normal",
                    }}
                  >
                    {item.title}
                  </span>
                )
              ),
            }}
          />
        </div>

        {!isMobile && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              minHeight: 200,
              padding: `0 ${SPACING.md}px`,
            }}
          >
            <div
              style={{
                width: 1,
                height: "100%",
                background:
                  "linear-gradient(to bottom, transparent, rgba(251,191,36,0.2) 20%, rgba(251,191,36,0.2) 80%, transparent)",
              }}
            />
          </div>
        )}

        {isMobile && (
          <div
            style={{
              width: "100%",
              height: 1,
              background:
                "linear-gradient(to right, transparent, rgba(251,191,36,0.2) 20%, rgba(251,191,36,0.2) 80%, transparent)",
            }}
          />
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 20 : SPACING.lg, width: "100%" }}>
          <MoneyMetricCard
            animationIndex={1}
            label="Депозитов внесено"
            total={deposits.total}
            summary="Депозиты и предоплаты"
            amountColor={COLORS.success}
            isExpanded={expandedCards.has("deposits")}
            onToggle={() => toggleCard("deposits")}
            isMobile={isMobile}
            isDesktop={isDesktop}
            bodyTypography={responsiveTypography.body}
            amountTypography={responsiveTypography.amount}
            details={{
              items: deposits.items,
              emptyText: "Нет активных депозитов",
              amountColor: COLORS.success,
              getKey: (item: MoneyDepositItem) => item.id,
              getAmount: (item: MoneyDepositItem) => item.amount,
              renderLabel: (item: MoneyDepositItem) => (
                <span
                  style={{
                    ...responsiveTypography.body,
                    color: COLORS.text.primary,
                    margin: 0,
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                    whiteSpace: "normal",
                  }}
                >
                  {item.lines.map((line, lineIndex) => (
                    <Fragment key={lineIndex}>
                      {line}
                      {lineIndex < item.lines.length - 1 && <br />}
                    </Fragment>
                  ))}
                </span>
              ),
            }}
          />
        </div>
      </div>
    </div>
  );
};
