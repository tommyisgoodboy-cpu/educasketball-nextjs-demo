import { getWhatsAppSettings } from "@/lib/data/settings";
import { DEMO_WA_MESSAGE } from "@/lib/demo";
import { whatsappLink } from "@/lib/utils";
import { HideOnFormPages } from "./HideOnFormPages";
import { WhatsAppIcon } from "./WhatsAppIcon";

/** 全站右下角浮動 WhatsApp 按鈕 */
export async function WhatsAppFloat() {
  const { number } = await getWhatsAppSettings();

  return (
    <HideOnFormPages>
    <a
      href={whatsappLink(number, DEMO_WA_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="想了解更多？立即 WhatsApp 查詢"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 focus-visible:ring-offset-2 sm:bottom-6 sm:right-6 sm:h-auto sm:w-auto sm:gap-2 sm:px-5 sm:py-3.5"
    >
      <WhatsAppIcon className="h-7 w-7 sm:h-6 sm:w-6" />
      <span className="hidden text-sm font-semibold sm:inline">想了解更多？立即 WhatsApp 查詢</span>
    </a>
    </HideOnFormPages>
  );
}
