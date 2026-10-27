import { DemoBanner } from "@/components/layout/DemoBanner";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getStaff, staffHome } from "@/lib/admin";
import { getUser } from "@/lib/auth";

// 未做好嘅頁（商店、登入等）同真正搵唔到嘅頁都會嚟呢度
export default async function NotFound() {
  const user = await getUser();
  const staff = user ? await getStaff() : null;

  return (
    <div className="flex min-h-dvh flex-col">
      <DemoBanner />
      <SiteHeader loggedIn={Boolean(user)} accountHref={staff ? staffHome(staff) : "/account"} accountLabel={staff ? "管理後台" : "我的帳戶"} />
      <main className="flex flex-1 items-center">
        <Container className="flex flex-col items-center gap-4 py-24 text-center">
          <p className="text-sm font-semibold text-aqua-600">即將推出</p>
          <h1 className="text-3xl font-bold text-brand-800">呢一頁仲準備緊</h1>
          <p className="max-w-md text-ink-muted">你搵緊嘅頁面未開放，或者已經搬咗位置。可以先睇吓我哋嘅課程。</p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/courses" variant="cta">
              睇課程
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
