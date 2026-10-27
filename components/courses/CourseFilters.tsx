"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Label, Select } from "@/components/ui/Form";
import { AGE_GROUP_LABELS, SKILL_LEVELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const FILTERS = ["age", "level", "district"] as const;

/** 篩選條件寫入網址（?age=primary&level=foundation&district=元朗），可以直接分享 */
export function CourseFilters({ districts }: { districts: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function update(key: (typeof FILTERS)[number], value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    const qs = params.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  const hasFilters = FILTERS.some((k) => searchParams.get(k));

  return (
    <div
      role="search"
      aria-label="篩選課程"
      className={cn("grid gap-4 sm:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end", pending && "opacity-60")}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filter-age">年齡組別</Label>
        <Select id="filter-age" value={searchParams.get("age") ?? ""} onChange={(e) => update("age", e.target.value)}>
          <option value="">全部年齡</option>
          {Object.entries(AGE_GROUP_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filter-level">技術等級</Label>
        <Select id="filter-level" value={searchParams.get("level") ?? ""} onChange={(e) => update("level", e.target.value)}>
          <option value="">全部等級</option>
          {SKILL_LEVELS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.stage} {l.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filter-district">地區</Label>
        <Select
          id="filter-district"
          value={searchParams.get("district") ?? ""}
          onChange={(e) => update("district", e.target.value)}
        >
          <option value="">全部地區</option>
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </Select>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={() => startTransition(() => router.replace(pathname, { scroll: false }))}
          className="h-11 rounded-lg px-3 text-sm font-semibold text-brand-700 hover:bg-brand-50"
        >
          清除篩選
        </button>
      )}
    </div>
  );
}
