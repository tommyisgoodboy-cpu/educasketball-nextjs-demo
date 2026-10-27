import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountNav } from "@/components/account/AccountNav";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Container } from "@/components/ui/Container";
import { getStaff, staffHome } from "@/lib/admin";
import { getProfile } from "@/lib/auth";

export const metadata: Metadata = {
  title: { default: "會員區", template: "%s｜會員區｜Educasketball" },
  robots: { index: false },
};

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  // middleware 已經擋咗未登入，呢度係雙重保險
  const profile = await getProfile();
  if (!profile) redirect("/login?next=/account");
  const staff = await getStaff();

  return (
    <div className="flex min-h-dvh flex-col">
      <DemoBanner />
      <SiteHeader loggedIn accountHref={staff ? staffHome(staff) : "/account"} accountLabel={staff ? "管理後台" : "我的帳戶"} />
      <Container className="flex-1 py-6 sm:py-10">
        <div className="grid gap-6 lg:grid-cols-[13rem_1fr] lg:gap-10">
          <aside>
            <p className="mb-3 hidden px-4 text-xs font-semibold text-ink-subtle lg:block">
              {profile.full_name ?? profile.email}
            </p>
            <AccountNav adminHref={staff ? staffHome(staff) : undefined} />
          </aside>
          <main id="main" className="min-w-0">
            {children}
          </main>
        </div>
      </Container>
      <SiteFooter />
    </div>
  );
}
