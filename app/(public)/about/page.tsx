import type { Metadata } from "next";
import { Features } from "@/components/home/Features";
import { LevelSystem } from "@/components/home/LevelSystem";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "關於我們",
  description: "Educasketball 以教育為本：四級技術體系、每期技術評核，令家長睇得到小朋友嘅進步。",
};

const VALUES = [
  { title: "以教育為本", body: "籃球係工具，學習先係目的。我哋重視紀律、團隊同自信，唔只係贏波。" },
  { title: "有系統嘅進度", body: "每個等級有清楚嘅技術大綱同評核標準，教練統一按大綱教學。" },
  { title: "家長全程透明", body: "時間表、出席、積分同技術徽章都喺會員區睇到，唔使逐個問教練。" },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="關於我們"
        title="教識小朋友打波，亦教識佢哋學習"
        description="Educasketball 由一班有教學背景嘅籃球教練成立，相信清晰嘅目標同即時嘅回饋，係小朋友持續進步嘅關鍵。（示範網站，品牌及內容均屬虛構）"
      />
      <section>
        <Container className="grid gap-6 py-14 md:grid-cols-3">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-card border border-surface-border bg-white p-6 shadow-card">
              <h2 className="text-lg font-bold text-brand-800">{v.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{v.body}</p>
            </div>
          ))}
        </Container>
      </section>
      <LevelSystem />
      <Features />
      <Container className="flex flex-wrap justify-center gap-3 py-14">
        <ButtonLink href="/courses" variant="cta" size="lg">
          睇課程
        </ButtonLink>
        <ButtonLink href="/coaches" variant="secondary" size="lg">
          認識教練
        </ButtonLink>
      </Container>
    </>
  );
}
