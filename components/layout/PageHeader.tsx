import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";

export function PageHeader({ eyebrow, title, description, children }: { eyebrow?: string; title: string; description?: ReactNode; children?: ReactNode }) {
  return (
    <section className="border-b border-surface-border bg-white">
      <Container className="py-10 sm:py-14">
        {eyebrow && <p className="mb-2 text-sm font-semibold text-aqua-600">{eyebrow}</p>}
        <h1 className="text-3xl font-bold text-brand-800 sm:text-4xl">{title}</h1>
        {description && <div className="mt-3 max-w-2xl text-ink-muted">{description}</div>}
        {children}
      </Container>
    </section>
  );
}
