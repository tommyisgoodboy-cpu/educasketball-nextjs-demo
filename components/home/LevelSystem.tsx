import { Container } from "@/components/ui/Container";
import { SKILL_LEVELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./SectionHeading";

const LEVEL_DETAIL: Record<string, { ages: string; color: string; ring: string }> = {
  starter: { ages: "4–6 歲起", color: "bg-level-starter", ring: "ring-level-starter/20" },
  foundation: { ages: "7 歲起 / 初學", color: "bg-level-foundation", ring: "ring-level-foundation/20" },
  intermediate: { ages: "球齡 1 年以上", color: "bg-level-intermediate", ring: "ring-level-intermediate/20" },
  elite: { ages: "校隊 / 比賽", color: "bg-level-elite", ring: "ring-level-elite/20" },
};

/** 教學體系等級圖：L1 → L4，每期評核達標升級 */
export function LevelSystem() {
  return (
    <section className="bg-white">
      <Container className="py-16 sm:py-20">
        <SectionHeading
          eyebrow="教學體系"
          title="四級技術體系，按能力分班"
          description="唔係淨係按年齡分班。每期最後一堂做技術評核，達標就升上一級，家長清楚知道小朋友去到邊。"
        />

        <ol className="relative grid gap-6 md:grid-cols-4 md:gap-4">
          <div className="absolute left-6 top-6 hidden h-0.5 w-[calc(75%+0.75rem)] bg-gradient-to-r from-level-starter via-level-intermediate to-level-elite md:block" aria-hidden />
          {SKILL_LEVELS.map((level, i) => {
            const d = LEVEL_DETAIL[level.value];
            return (
              <li key={level.value} className="relative flex gap-4 md:flex-col">
                <span className={cn("z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-bold text-white ring-8", d.color, d.ring)}>
                  {level.stage}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-ink">
                    {level.label}
                    <span className="ml-2 text-sm font-normal text-ink-subtle">{d.ages}</span>
                  </h3>
                  <p className="mt-1 text-sm text-ink-muted">{level.summary}</p>
                  {i < SKILL_LEVELS.length - 1 && <p className="mt-2 text-xs font-semibold text-aqua-600">評核達標 → 升級</p>}
                </div>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
