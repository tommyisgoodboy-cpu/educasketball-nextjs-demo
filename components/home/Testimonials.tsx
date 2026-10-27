import { Container } from "@/components/ui/Container";
import { SectionHeading } from "./SectionHeading";

// 示範用評價，人物均屬虛構
const TESTIMONIALS = [
  { quote: "以前唔知個仔學成點，而家每期有評核，仲睇到佢由 L2 升上 L3，好有成功感。", name: "黃太", child: "小學進階班家長" },
  { quote: "會員區睇到上堂時間同出席，請假都唔使再逐個訊息問，對返工嘅家長真係方便好多。", name: "李生", child: "幼兒啟蒙班家長" },
  { quote: "教練好有耐性，女兒本身好怕波，三個月後主動叫我帶佢去公園練習。", name: "張太", child: "小學基礎班家長" },
];

export function Testimonials() {
  return (
    <section className="bg-brand-50">
      <Container className="py-16 sm:py-20">
        <SectionHeading eyebrow="家長評價" title="家長最在意嘅，係睇得到進步" />
        <ul className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <li key={t.name}>
              <figure className="flex h-full flex-col rounded-card bg-white p-6 shadow-card">
                <svg viewBox="0 0 24 24" className="mb-3 h-7 w-7 text-aqua-300" fill="currentColor" aria-hidden>
                  <path d="M9.6 6C6.5 7.4 4.5 10 4.5 13.4V18h6v-6H7.6c.2-2 1.3-3.4 3.2-4.3L9.6 6Zm9 0c-3.1 1.4-5.1 4-5.1 7.4V18h6v-6h-2.9c.2-2 1.3-3.4 3.2-4.3L18.6 6Z" />
                </svg>
                <blockquote className="flex-1 leading-relaxed text-ink">{t.quote}</blockquote>
                <figcaption className="mt-4 text-sm">
                  <span className="font-bold text-ink">{t.name}</span>
                  <span className="text-ink-muted"> · {t.child}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-ink-subtle">＊示範網站：以上評價均屬虛構。</p>
      </Container>
    </section>
  );
}
