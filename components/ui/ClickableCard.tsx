"use client";

import type { KeyboardEvent, MouseEvent, HTMLAttributes, ReactNode } from "react";

interface ClickableCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "onClick"> {
  children: ReactNode;
  onPress: () => void;
}

function isNestedInteractiveTarget(
  target: EventTarget | null,
  currentTarget: HTMLElement
): boolean {
  if (!(target instanceof HTMLElement)) return false;

  const interactive = target.closest(
    'a, button, input, select, textarea, summary, [role="button"], [tabindex]'
  );

  return Boolean(interactive && interactive !== currentTarget);
}

export const ClickableCard = ({
  children,
  onPress,
  onKeyDown,
  style,
  role,
  tabIndex,
  ...rest
}: ClickableCardProps) => {
  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (isNestedInteractiveTarget(event.target, event.currentTarget)) return;
    onPress();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (isNestedInteractiveTarget(event.target, event.currentTarget)) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onPress();
    }
  };

  return (
    <div
      role={role ?? "button"}
      tabIndex={tabIndex ?? 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={style}
      {...rest}
    >
      {children}
    </div>
  );
};
