import type { Metadata } from "next";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getStaff, staffHome } from "@/lib/admin";
import { getUser } from "@/lib/auth";

export const metadata: Metadata = { title: "冇權限", robots: { index: false } };

export default async function NoAccessPage() {
  const user = await getUser();
  const staff = user ? await getStaff() : null;
  return (
    <div className="flex min-h-dvh flex-col">
      <DemoBanner />
      <SiteHeader loggedIn={Boolean(user)} accountHref={staff ? staffHome(staff) : "/account"} accountLabel={staff ? "管理後台" : "我的帳戶"} />
      <main className="flex flex-1 items-center">
        <Container className="flex flex-col items-center gap-4 py-24 text-center">
          <h1 className="text-3xl font-bold text-brand-800">你冇權限睇呢一頁</h1>
          <p className="max-w-md text-ink-muted">呢一頁只限管理員或者負責嘅教練使用。如果你覺得應該有權限，請聯絡管理員。</p>
          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink href={user ? "/account" : "/login"} variant="primary">
              {user ? "返會員區" : "登入"}
            </ButtonLink>
            <ButtonLink href="/" variant="secondary">
              返主頁
            </ButtonLink>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
