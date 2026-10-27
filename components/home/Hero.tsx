import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";

const STATS = [
  { value: "4 級", label: "技術等級體系" },
  { value: "每期", label: "技術評核報告" },
  { value: "3 區", label: "天水圍・元朗・屯門" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 text-white">
      <svg viewBox="0 0 200 200" className="absolute -right-24 -top-24 h-[28rem] w-[28rem] text-white/5" aria-hidden>
        <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M100 4v192M4 100h192M36 36c28 24 28 104 0 128M164 36c-28 24-28 104 0 128" stroke="currentColor" strokeWidth="3" fill="none" />
      </svg>
      <Container className="relative py-16 sm:py-24">
        <p className="mb-3 text-sm font-semibold tracking-wide text-aqua-300">以教育為本嘅籃球訓練</p>
        <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
          每一堂都有目標，
          <br />
          每一期都睇得到進步
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-brand-100 sm:text-lg">
          由 4 歲幼兒到成人，四級技術體系配合每期評核。家長喺會員區隨時睇到出席、時間表同學習進度。
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/courses" variant="cta" size="lg">
            睇課程同報名
          </ButtonLink>
          <WhatsAppButton className="border-white/30 bg-white/10 text-white hover:border-white/50 hover:bg-white/20" />
        </div>

        <dl className="mt-12 grid max-w-xl grid-cols-3 gap-4 border-t border-white/15 pt-6">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col-reverse">
              <dt className="text-xs text-brand-200 sm:text-sm">{s.label}</dt>
              <dd className="text-2xl font-bold sm:text-3xl">{s.value}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
