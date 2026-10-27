import Link from "next/link";

export function Logo({ inverted = false, iconOnlyMobile = false }: { inverted?: boolean; iconOnlyMobile?: boolean }) {
  return (
    <Link href="/" className="flex min-h-[44px] items-center gap-2.5" aria-label="Educasketball 主頁">
      <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0" aria-hidden>
        <circle cx="16" cy="16" r="15" fill={inverted ? "#FFFFFF" : "#173E77"} />
        <path
          d="M16 1v30M1 16h30M5.5 5.5c5 4 5 17 0 21M26.5 5.5c-5 4-5 17 0 21"
          stroke={inverted ? "#173E77" : "#7FCBFA"}
          strokeWidth="1.6"
          fill="none"
        />
      </svg>
      <span className={`${inverted ? "text-lg font-bold text-white" : "text-lg font-bold text-brand-800"}${iconOnlyMobile ? " hidden sm:inline" : ""}`}>
        Educa<span className={inverted ? "text-aqua-300" : "text-aqua-600"}>sketball</span>
      </span>
    </Link>
  );
}
