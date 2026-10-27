import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPage";
import { getStaff } from "@/lib/admin";

export const metadata = { title: "使用說明" };

type Step = { title: string; who: "管理員" | "教練" | "兩者"; steps: string[]; tip?: string };

const GUIDE: Step[] = [
  { title: "確認報名 / 候補轉正", who: "管理員", steps: ["左邊選單「報名管理」→ 揀「待確認」。", "核實家長已經轉數（FPS）後，撳該行嘅「確認」。", "額滿嘅班有人取消時，「候補中」嗰行撳「候補轉正」。", "想一眼睇晒各狀態：右上切換「看板」。"], tip: "取消報名會自動還返名額；已取消嘅可以撳「恢復」。" },
  { title: "點名（教練 / 管理員）", who: "兩者", steps: ["選單「日曆及點名」→ 撳當日嗰堂。", "每位學員撳「出席 / 缺席 / 請假」，即時儲存，唔使再撳儲存。", "大部分人都到：撳「未點名嘅全部設為出席」，再逐個改缺席或請假。", "點錯可以直接改；由出席改做缺席，積分會自動扣返。"], tip: "教練只會見到自己負責嘅班。" },
  { title: "學員備注（手受傷、要補習等）", who: "兩者", steps: ["點名頁每位學員下面撳「＋ 備注」。", "揀類型（健康 / 時間 / 其他），寫低內容，撳 Enter 或「儲存」。", "例如：「手腕受傷，兩星期內避免大力運球」、「逢週五 19:00 要補習」。"], tip: "備注只有教練同管理員睇到，家長睇唔到；教練只可以刪自己寫嘅。" },
  { title: "頒發徽章", who: "兩者", steps: ["點名頁學員下面撳「＋ 頒發徽章」。", "揀徽章、可寫一句評語，撳「頒發」。家長喺會員區即時睇到。"] },
  { title: "處理商店訂單", who: "管理員", steps: ["選單「訂單」→「待付款」。", "核對家長上載嘅 FPS 付款截圖，對得上就撳「標示已付款」（庫存同積分自動處理）。", "貨品寄出 / 交收後撳「標示已出貨」。取消會自動還返庫存同積分。"] },
  { title: "開班、改班、下架課程", who: "管理員", steps: ["選單「課程」→ 撳「睇班況」睇該課程每個班嘅名額、候補、出席率。", "撳「開班」揀星期、時間、場地同教練，系統自動生成每一堂。", "課程唔再開：撳「下架」，前台即時報唔到（已報嘅唔受影響）。"] },
  { title: "日曆匯入手機 / 電腦", who: "兩者", steps: ["「日曆及點名」右上撳「匯入日曆」，下載 .ics 檔。", "用手機或電腦日曆打開，就會一次過加入而家睇緊嗰段日期嘅課堂。"], tip: "家長喺會員區「上課時間表」都有同樣嘅「一鍵加入日曆」。" },
];

const DAILY = ["睇 Dashboard 四個數字（待確認報名、候補、待處理訂單、訂製查詢）。", "處理「待確認」報名，回覆家長。", "上課當日：教練手機點名，有特別情況寫備注。", "核對 FPS 付款截圖，標示已付款 / 已出貨。", "每週：睇「班況」，名額將滿或出席率偏低嘅班作跟進。"];

export default async function GuidePage() {
  const staff = await getStaff();
  return (
    <>
      <AdminPageHeader
        title="使用說明"
        description="後台日常操作同 SOP（標準作業程序）。正式版會按你實際流程度身寫成說明文件，並隨系統一齊交付；使用上有問題可以 WhatsApp 查詢，技術支援同小功能調整包含喺 Pro 營運系統嘅月費入面。"
      />
      <section className="mb-8 rounded-card border border-surface-border bg-white p-5 shadow-card">
        <h2 className="mb-2 text-lg font-bold text-ink">每日 SOP（約 10 分鐘）</h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-ink-muted">
          {DAILY.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ol>
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        {GUIDE.filter((g) => staff?.isAdmin || g.who !== "管理員").map((g) => (
          <section key={g.title} className="rounded-card border border-surface-border bg-white p-5 shadow-card">
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-bold text-ink">{g.title}</h2>
              <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">{g.who}</span>
            </div>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-ink-muted">
              {g.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            {g.tip && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">💡 {g.tip}</p>}
          </section>
        ))}
      </div>
      <p className="mt-6 text-sm">
        <Link href="/admin" className="font-semibold text-brand-700 hover:underline">
          ← 返回 Dashboard
        </Link>
      </p>
    </>
  );
}
