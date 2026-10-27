import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { getSiteContact, getWhatsAppSettings } from "@/lib/data/settings";
import { getVenues } from "@/lib/data/venues";
import { telHref } from "@/lib/phone";

export const metadata: Metadata = { title: "聯絡我們", description: "電話、WhatsApp、電郵同訓練場地地址。" };

export default async function ContactPage() {
  const [contact, whatsapp, venues] = await Promise.all([getSiteContact(), getWhatsAppSettings(), getVenues()]);

  return (
    <>
      <PageHeader eyebrow="聯絡我們" title="有問題？隨時搵我哋" description="WhatsApp 最快回覆；辦公時間星期一至六 10:00–19:00。" />
      <Container className="grid gap-8 py-10 lg:grid-cols-[22rem_1fr]">
        <Card className="self-start">
          <CardBody className="space-y-5">
            <div>
              <p className="text-sm text-ink-subtle">電話</p>
              <a href={telHref(contact.phone)} className="text-xl font-bold text-brand-800 hover:underline">
                {contact.phone}
              </a>
            </div>
            <div>
              <p className="text-sm text-ink-subtle">WhatsApp</p>
              <p className="text-xl font-bold text-ink">{whatsapp.display}</p>
            </div>
            <div>
              <p className="text-sm text-ink-subtle">電郵</p>
              <a href={`mailto:${contact.email}`} className="font-semibold text-brand-700 hover:underline">
                {contact.email}
              </a>
            </div>
            <WhatsAppButton className="w-full" />
          </CardBody>
        </Card>

        <section aria-labelledby="venues-heading">
          <h2 id="venues-heading" className="mb-4 text-xl font-bold text-ink">
            訓練場地
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {venues.map((v) => (
              <li key={v.id} className="rounded-card border border-surface-border bg-white p-5 shadow-card">
                <p className="text-xs font-semibold text-aqua-600">{v.district}</p>
                <h3 className="mt-1 font-bold text-ink">{v.name}</h3>
                <p className="mt-2 text-sm text-ink-muted">{v.address}</p>
                <a
                  href={v.map_url ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm font-semibold text-brand-700 hover:underline"
                >
                  喺地圖睇 →
                </a>
              </li>
            ))}
          </ul>
        </section>
      </Container>
    </>
  );
}
