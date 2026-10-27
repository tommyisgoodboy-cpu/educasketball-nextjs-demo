import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { WhatsAppIcon } from "@/components/whatsapp/WhatsAppIcon";
import { MAIN_NAV } from "@/lib/constants";
import { getSiteContact, getWhatsAppSettings } from "@/lib/data/settings";
import { telHref } from "@/lib/phone";
import { DEMO_WA_MESSAGE } from "@/lib/demo";
import { whatsappLink } from "@/lib/utils";
import { Logo } from "./Logo";

export async function SiteFooter() {
  const [contact, whatsapp] = await Promise.all([getSiteContact(), getWhatsAppSettings()]);

  return (
    <footer className="mt-auto bg-brand-900 text-brand-100">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3 lg:col-span-2">
          <Logo inverted />
          <p className="max-w-sm text-sm leading-relaxed text-brand-200">
            以教育為本嘅籃球訓練：清晰嘅等級制度、每期技術評核，令家長睇得到小朋友嘅進步。
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-white">網站導覽</h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-0 text-sm sm:grid-cols-1">
            {MAIN_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="inline-flex min-h-[44px] items-center hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-white">聯絡我們</h2>
          <ul className="space-y-0 text-sm">
            <li>
              <a href={telHref(contact.phone)} className="inline-flex min-h-[44px] items-center gap-2 hover:text-white">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z" />
                </svg>
                <span>
                  電話 <span className="whitespace-nowrap">{contact.phone}</span>
                </span>
              </a>
            </li>
            <li>
              <a
                href={whatsappLink(whatsapp.number, DEMO_WA_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-2 hover:text-white"
              >
                <WhatsAppIcon className="h-4 w-4" />
                <span>
                  WhatsApp <span className="whitespace-nowrap">{whatsapp.display}</span>
                </span>
              </a>
            </li>
            <li>
              <a href={`mailto:${contact.email}`} className="inline-flex min-h-[44px] items-center hover:text-white">
                {contact.email}
              </a>
            </li>
            <li className="pt-2 text-brand-300">天水圍 · 元朗 · 屯門</li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-brand-800">
        <Container className="flex flex-col gap-1 py-5 text-xs text-brand-300 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Educasketball。此網站為示範用途，所有資料均屬虛構。</p>
          <p>付款：網上付款（測試模式）或 FPS 轉數快</p>
        </Container>
      </div>
    </footer>
  );
}
