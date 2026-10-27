import { DemoBanner } from "@/components/layout/DemoBanner";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { WhatsAppFloat } from "@/components/whatsapp/WhatsAppFloat";
import { getStaff, staffHome } from "@/lib/admin";
import { getUser } from "@/lib/auth";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  const staff = user ? await getStaff() : null; // 管理員 / 教練：「我的帳戶」直接入後台

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2"
      >
        跳到主要內容
      </a>
      <DemoBanner />
      <SiteHeader loggedIn={Boolean(user)} accountHref={staff ? staffHome(staff) : "/account"} accountLabel={staff ? "管理後台" : "我的帳戶"} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <WhatsAppFloat />
    </div>
  );
}
