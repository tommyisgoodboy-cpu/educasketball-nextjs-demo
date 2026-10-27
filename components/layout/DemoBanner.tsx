import { Container } from "@/components/ui/Container";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/constants";
import { demoLogin } from "@/app/(public)/auth/actions";
import { ResetDemoButton } from "@/components/layout/ResetDemoButton";
import { getUser } from "@/lib/auth";
import { DEMO_LOCK } from "@/lib/demo";

const SHORT = { 管理員: "管理員", 教練: "教練", 會員家長: "家長" } as const;
const LONG = {
  管理員: "試玩管理員後台",
  教練: "試玩教練後台",
  會員家長: "試玩家長會員區",
} as const;
const resetBtn =
  "rounded-full border border-brand-300 px-3 py-1.5 font-semibold text-brand-100 hover:bg-brand-900 disabled:opacity-60";

/** 測試帳戶 + 還原（桌面橫幅同手機展開面板共用） */
function DemoDetails({ loggedIn }: { loggedIn: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <ul className="flex flex-wrap justify-center gap-2">
        {DEMO_ACCOUNTS.map((a) => (
          <li key={a.email} className="rounded-lg bg-brand-900 px-3 py-1.5">
            <span className="mr-2 font-semibold text-white">{a.role}</span>
            <code className="text-aqua-200">{a.email}</code>
            <span className="mx-1 text-brand-300">或</span>
            <code className="text-aqua-200">{a.phone}</code>
          </li>
        ))}
      </ul>
      {loggedIn && (
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-brand-300">
          <ResetDemoButton className={resetBtn} />
          <span>
            試完想由頭再玩？撳一下還原（你嘅改動、新註冊帳戶會清走）；每晚亦會自動還原。
          </span>
        </div>
      )}
      <p className="text-xs text-brand-300">
        登入可以用電郵或電話，密碼一律：
        <code className="text-aqua-200">{DEMO_PASSWORD}</code>
      </p>
    </div>
  );
}

/**
 * Demo 模式：
 * - 電腦（≥lg）：頂部橫幅（一鍵試玩 + 說明）；≥1180px 另有左下角浮動「一鍵試玩」，捲動時一直喺度
 * - 手機（<lg）：單行細橫幅，貼頂跟住捲動（高 40px），帳戶資料收喺「帳戶」展開
 */
export async function DemoBanner() {
  const user = DEMO_LOCK ? await getUser() : null;
  return (
    <>
      {DEMO_LOCK && (
        <style>{"@media (max-width:1023px){:root{--demo-bar:40px}}"}</style>
      )}

      <div
        className={`bg-brand-950 text-brand-100 ${DEMO_LOCK ? "hidden lg:block" : ""}`}
      >
        <Container>
          {DEMO_LOCK && (
            <form
              action={demoLogin}
              className="flex flex-wrap items-center justify-center gap-2 pt-2 text-sm"
            >
              <span className="text-brand-300">一鍵試玩：</span>
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.role}
                  type="submit"
                  name="role"
                  value={a.role}
                  className="inline-flex min-h-[44px] items-center rounded-full bg-cta px-4 text-sm font-semibold text-white hover:opacity-90"
                >
                  {LONG[a.role]}
                </button>
              ))}
            </form>
          )}
          <details className="group py-2 text-sm">
            <summary className="flex cursor-pointer list-none items-center justify-center gap-2 text-center [&::-webkit-details-marker]:hidden">
              <span className="rounded bg-cta px-1.5 py-0.5 text-xs font-bold text-white">
                DEMO
              </span>
              <span>示範網站：所有資料均屬虛構，歡迎用測試帳戶登入試玩</span>
              <span
                aria-hidden
                className="transition-transform group-open:rotate-180"
              >
                ▾
              </span>
            </summary>
            <div className="mt-3 pb-2">
              <DemoDetails loggedIn={Boolean(user)} />
            </div>
          </details>
        </Container>
      </div>

      {DEMO_LOCK && (
        <>
          {/* 手機：細橫幅，貼頂 */}
          <div className="sticky top-0 z-[41] bg-brand-950 text-brand-100 lg:hidden">
            <div className="relative mx-auto flex h-10 max-w-content items-center gap-1.5 px-3">
              <span className="rounded bg-cta px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                DEMO
              </span>
              <form action={demoLogin} className="flex items-center gap-1">
                {DEMO_ACCOUNTS.map((a) => (
                  <button
                    key={a.role}
                    type="submit"
                    name="role"
                    value={a.role}
                    className="group inline-flex h-10 items-center text-xs font-semibold text-white"
                  >
                    <span className="inline-flex h-7 items-center rounded-full bg-cta px-3 group-active:opacity-80">
                      {SHORT[a.role]}
                    </span>
                  </button>
                ))}
              </form>
              <details className="ml-auto">
                <summary className="flex h-10 cursor-pointer list-none items-center text-xs [&::-webkit-details-marker]:hidden">
                  <span className="inline-flex h-7 items-center rounded-full border border-brand-300/60 px-2.5">
                    帳戶 ▾
                  </span>
                </summary>
                <div className="absolute inset-x-2 top-full mt-1 rounded-lg border border-brand-800 bg-brand-950 p-3 text-sm shadow-lg">
                  <DemoDetails loggedIn={Boolean(user)} />
                </div>
              </details>
            </div>
          </div>

          {/* 電腦：左下角浮動「試玩身分」，收埋做一粒細掣，撳開先見三個身分（唔遮內容）；喺「返回上一頁」掣上面 */}
          <details className="group fixed bottom-[72px] left-4 z-[55] hidden lg:block">
            <summary className="flex h-9 cursor-pointer list-none items-center gap-1.5 rounded-full bg-brand-950/95 px-3.5 text-xs font-semibold text-white shadow-lg [&::-webkit-details-marker]:hidden">
              <span className="rounded bg-cta px-1 py-px text-[10px] leading-none">
                DEMO
              </span>
              試玩身分
              <span
                aria-hidden
                className="transition-transform group-open:rotate-180"
              >
                ▴
              </span>
            </summary>
            <form
              action={demoLogin}
              aria-label="一鍵試玩"
              className="absolute bottom-full left-0 mb-1.5 flex w-32 flex-col gap-1.5 rounded-2xl bg-brand-950/95 p-2 shadow-lg"
            >
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.role}
                  type="submit"
                  name="role"
                  value={a.role}
                  className="inline-flex h-8 items-center justify-center rounded-full bg-cta px-3 text-xs font-semibold text-white hover:opacity-90"
                >
                  {SHORT[a.role]}
                </button>
              ))}
            </form>
          </details>
        </>
      )}
    </>
  );
}
