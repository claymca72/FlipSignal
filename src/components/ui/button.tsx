import * as React from "react";

import { cn } from "@/lib/utils";

const variants = {
  default:
    "bg-[var(--accent)] text-white shadow-[0_12px_30px_rgba(28,161,144,0.24)] hover:bg-[color-mix(in_srgb,var(--accent)_88%,black)]",
  secondary:
    "bg-[var(--panel-muted)] text-[var(--foreground)] hover:bg-[var(--panel)]",
  outline:
    "border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--panel-muted)]",
  ghost: "bg-transparent text-[var(--foreground)] hover:bg-[var(--panel-muted)]",
  destructive: "bg-[#b42318] text-white hover:bg-[#912018]",
} as const;

const sizes = {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3 text-sm",
  lg: "h-11 px-5 text-sm",
} as const;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  asChild?: boolean;
}

export function Button({
  children,
  className,
  variant = "default",
  size = "default",
  type = "button",
  asChild = false,
  ...props
}: ButtonProps) {
  const buttonClassName = cn(
    "inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );

  if (asChild && React.isValidElement<{ className?: string }>(children)) {
    return React.cloneElement(children, {
      className: cn(buttonClassName, children.props.className),
    });
  }

  return (
    <button
      type={type}
      className={buttonClassName}
      {...props}
    >
      {children}
    </button>
  );
}
