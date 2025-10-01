// ActionButton.tsx
import React from "react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  size?: "default" | "sm";
  className?: string;
  icon?: ReactNode; // SVG element
  ariaLabel?: string;
  fullWidth?: boolean;
};

const variantClasses: Record<string, string> = {
  primary: "bg-red-600 hover:bg-red-700 text-white",
  secondary: "bg-transparent border border-gray-700 text-gray-200 hover:bg-gray-800",
  ghost: "bg-transparent text-gray-200 hover:bg-gray-800",
};

export default function ActionButton({
  children,
  onClick,
  variant = "primary",
  size = "default",
  className = "",
  icon,
  ariaLabel,
  fullWidth = false,
}: Props) {
  const sizeClasses = size === "sm" ? "py-1 px-3 text-xs" : "py-2 px-4";
  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel ?? (typeof children === "string" ? children : "ação")}
      className={`inline-flex items-center gap-2 justify-center font-semibold rounded-lg transition shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${sizeClasses} ${
        variantClasses[variant]
      } ${fullWidth ? "w-full" : "w-auto"} ${className}`}
      type="button"
    >
      {icon && <span className={`${iconSize} flex-shrink-0`}>{icon}</span>}
      <span>{children}</span>
    </button>
  );
}