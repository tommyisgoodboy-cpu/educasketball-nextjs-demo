import Link from "next/link";

export function SectionHeading({ eyebrow, title, description, href, linkLabel }: { eyebrow: string; title: string; description?: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-1 text-sm font-semibold text-aqua-600">{eyebrow}</p>
        <h2 className="text-2xl font-bold text-brand-800 sm:text-3xl">{title}</h2>
        {description && <p className="mt-2 max-w-2xl text-ink-muted">{description}</p>}
      </div>
      {href && (
        <Link href={href} className="shrink-0 text-sm font-semibold text-brand-700 hover:underline">
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}
