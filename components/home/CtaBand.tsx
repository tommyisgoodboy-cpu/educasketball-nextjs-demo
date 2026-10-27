import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";

export function CtaBand() {
  return (
    <section>
      <Container className="py-16">
        <div className="flex flex-col items-start gap-6 rounded-card bg-brand-800 p-8 text-white sm:p-10 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">唔肯定小朋友適合邊一級？</h2>
            <p className="mt-2 text-brand-100">話我哋知年齡同球齡，教練會建議合適嘅班次。</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/courses" variant="cta" size="lg">
              睇課程
            </ButtonLink>
            <WhatsAppButton className="border-white/30 bg-white/10 text-white hover:border-white/50 hover:bg-white/20" />
          </div>
        </div>
      </Container>
    </section>
  );
}
