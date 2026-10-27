import { buttonClasses } from "@/components/ui/Button";
import { getWhatsAppSettings } from "@/lib/data/settings";
import { DEMO_WA_MESSAGE, DEMO_WA_PREFIX } from "@/lib/demo";
import { cn, whatsappLink } from "@/lib/utils";
import { WhatsAppIcon } from "./WhatsAppIcon";

/**
 * WhatsApp 查詢按鈕：開 wa.me 並自動帶入訊息。
 * subject 例如「小學基礎班（星期六 11:30）」→「你好，我想查詢 小學基礎班（星期六 11:30）」
 */
export async function WhatsAppButton({
  subject,
  label = "WhatsApp 查詢",
  variant = "button",
  className,
}: {
  subject?: string;
  label?: string;
  variant?: "button" | "link";
  className?: string;
}) {
  const { number } = await getWhatsAppSettings();
  const message = subject ? `${DEMO_WA_PREFIX}，想查詢 ${subject}` : DEMO_WA_MESSAGE;

  return (
    <a
      href={whatsappLink(number, message)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        variant === "button"
          ? cn(buttonClasses({ variant: "secondary" }), "border-emerald-200 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50")
          : "inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:underline",
        className,
      )}
    >
      <WhatsAppIcon className={variant === "button" ? "h-5 w-5" : "h-4 w-4"} />
      {label}
    </a>
  );
}
