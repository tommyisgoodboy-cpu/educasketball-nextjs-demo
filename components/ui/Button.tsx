import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "cta" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
  "disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  // 深藍：一般主要動作
  primary: "bg-brand-700 text-white hover:bg-brand-800 focus-visible:ring-brand-500",
  // 橙色：只用喺最重要嘅 CTA（報名、下單）
  cta: "bg-cta text-white hover:bg-cta-hover focus-visible:ring-cta",
  secondary:
    "border border-brand-200 bg-white text-brand-700 hover:border-brand-300 hover:bg-brand-50 focus-visible:ring-brand-500",
  ghost: "text-brand-700 hover:bg-brand-50 focus-visible:ring-brand-500",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

type StyleProps = { variant?: Variant; size?: Size; fullWidth?: boolean };

export function buttonClasses({ variant = "primary", size = "md", fullWidth }: StyleProps = {}) {
  return cn(base, variants[variant], sizes[size], fullWidth && "w-full");
}

export function Button({
  variant,
  size,
  fullWidth,
  className,
  type = "button",
  ...props
}: StyleProps & ComponentProps<"button">) {
  return <button type={type} className={cn(buttonClasses({ variant, size, fullWidth }), className)} {...props} />;
}

export function ButtonLink({
  variant,
  size,
  fullWidth,
  className,
  ...props
}: StyleProps & ComponentProps<typeof Link>) {
  return <Link className={cn(buttonClasses({ variant, size, fullWidth }), className)} {...props} />;
}
