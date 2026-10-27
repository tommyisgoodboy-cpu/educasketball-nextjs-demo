import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Input } from "./Form";

/** 香港電話輸入框：前面固定顯示 +852 */
export function PhoneInput({ className, ...props }: Omit<ComponentProps<"input">, "type">) {
  return (
    <div className="flex">
      <span className="inline-flex h-11 items-center rounded-l-lg border border-r-0 border-surface-border bg-surface-muted px-3 text-sm text-ink-muted" aria-hidden>
        +852
      </span>
      <Input
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        maxLength={16}
        placeholder="9123 4567"
        className={cn("rounded-l-none", className)}
        {...props}
      />
    </div>
  );
}
