import { Container } from "@/components/ui/Container";
import { SectionHeading } from "./SectionHeading";

const FEATURES = [
  { title: "小班教學", body: "每班最多 16 人，配合助教，教練睇得到每個學員嘅動作細節。", icon: "M17 20h5v-2a3 3 0 0 0-5.36-1.86M17 20H7m10 0v-2c0-.66-.13-1.28-.36-1.86M7 20H2v-2a3 3 0 0 1 5.36-1.86M7 20v-2c0-.66.13-1.28.36-1.86m0 0a5 5 0 0 1 9.28 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" },
  { title: "每期技術評核", body: "統一評核標準，記錄運球、傳球、投籃等項目，升級有根有據。", icon: "M9 12l2 2 4-4m5.62-4.02A12 12 0 0 1 12 2.94a12 12 0 0 1-8.62 3.04A12 12 0 0 0 3 9c0 5.6 3.82 10.3 9 11.62 5.18-1.33 9-6.03 9-11.62 0-1.04-.13-2.05-.38-3.02Z" },
  { title: "家長全程透明", body: "會員區睇到時間表、出席紀錄同積分，唔使再逐個 WhatsApp 問。", icon: "M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-12 0C4.27 7.94 7.8 5 12 5s7.73 2.94 9 7c-1.27 4.06-4.8 7-9 7s-7.73-2.94-9-7Z" },
];

export function Features() {
  return (
    <section className="bg-white">
      <Container className="py-16 sm:py-20">
        <SectionHeading eyebrow="點解揀我哋" title="教得有系統，家長睇得清楚" />
        <ul className="grid gap-6 md:grid-cols-3">
          {FEATURES.map((f) => (
            <li key={f.title} className="rounded-card bg-surface-muted p-6">
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-brand-700 text-white" aria-hidden>
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={f.icon} />
                </svg>
              </span>
              <h3 className="text-lg font-bold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{f.body}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
