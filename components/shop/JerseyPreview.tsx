"use client";

import { cn } from "@/lib/utils";

export const JERSEY_COLORS = [
  { name: "深藍", hex: "#173E77" },
  { name: "天藍", hex: "#43B0F3" },
  { name: "白", hex: "#F8FAFC" },
  { name: "黑", hex: "#111827" },
  { name: "紅", hex: "#C62828" },
  { name: "橙", hex: "#F26B1D" },
  { name: "黃", hex: "#FACC15" },
  { name: "綠", hex: "#15803D" },
  { name: "紫", hex: "#6D28D9" },
] as const;

export type JerseyDesign = { body: string; trim: string; number: string; name: string; view: "front" | "back"; team: string };

const hexOf = (name: string) => JERSEY_COLORS.find((c) => c.name === name)?.hex ?? "#173E77";

/** 球衣預覽：揀主色、號碼色，輸入號碼同名，即時睇前後幅 */
export function JerseyPreview({ design, onChange }: { design: JerseyDesign; onChange: (d: JerseyDesign) => void }) {
  const body = hexOf(design.body);
  const trim = hexOf(design.trim);
  const set = (patch: Partial<JerseyDesign>) => onChange({ ...design, ...patch });

  return (
    <div className="grid gap-6 sm:grid-cols-[14rem_1fr] sm:items-start">
      <figure className="space-y-2">
        <svg viewBox="0 0 200 220" className="mx-auto w-48 drop-shadow-md sm:w-full" role="img" aria-label={`${design.body}色球衣，${design.trim}色號碼 ${design.number || ""}`}>
          {/* 背心款球衣 */}
          <path
            d="M60 10 C70 30 130 30 140 10 L170 22 C165 55 168 70 178 82 L178 210 L22 210 L22 82 C32 70 35 55 30 22 Z"
            fill={body}
            stroke={trim}
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <path d={design.view === "front" ? "M60 10 C70 40 130 40 140 10" : "M62 10 C75 22 125 22 138 10"} fill="none" stroke={trim} strokeWidth="6" />
          {design.view === "front" ? (
            <>
              <text x="100" y="78" textAnchor="middle" fill={trim} fontSize="18" fontWeight="700" letterSpacing="1">
                {(design.team || "TEAM").slice(0, 12).toUpperCase()}
              </text>
              <text x="100" y="150" textAnchor="middle" fill={trim} fontSize="64" fontWeight="800">
                {design.number || "0"}
              </text>
            </>
          ) : (
            <>
              <text x="100" y="72" textAnchor="middle" fill={trim} fontSize="20" fontWeight="700" letterSpacing="2">
                {(design.name || "NAME").slice(0, 10).toUpperCase()}
              </text>
              <text x="100" y="168" textAnchor="middle" fill={trim} fontSize="86" fontWeight="800">
                {design.number || "0"}
              </text>
            </>
          )}
        </svg>
        <div role="tablist" aria-label="預覽方向" className="flex justify-center gap-1">
          {(["front", "back"] as const).map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={design.view === v}
              onClick={() => set({ view: v })}
              className={cn("rounded-md px-3 py-1 text-xs font-semibold", design.view === v ? "bg-brand-700 text-white" : "bg-white text-ink-muted")}
            >
              {v === "front" ? "正面" : "背面"}
            </button>
          ))}
        </div>
      </figure>

      <div className="space-y-4">
        <Swatches label="主色" value={design.body} onPick={(body) => set({ body, trim: body === design.trim ? (body === "白" ? "深藍" : "白") : design.trim })} />
        <Swatches label="號碼 / 字色" value={design.trim} onPick={(trim) => set({ trim })} exclude={design.body} />
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm font-semibold">
            號碼
            <input
              inputMode="numeric"
              maxLength={2}
              value={design.number}
              onChange={(e) => set({ number: e.target.value.replace(/\D/g, "").slice(0, 2) })}
              className="h-10 rounded-lg border border-surface-border px-3 font-normal"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            背面名
            <input
              maxLength={10}
              value={design.name}
              onChange={(e) => set({ name: e.target.value.replace(/[^A-Za-z .'-]/g, "").slice(0, 10), view: "back" })}
              placeholder="英文"
              className="h-10 rounded-lg border border-surface-border px-3 font-normal"
            />
          </label>
        </div>
        <p className="text-xs text-ink-subtle">預覽只供參考，最終設計會由我哋同你確認。</p>
      </div>
    </div>
  );
}

function Swatches({ label, value, onPick, exclude }: { label: string; value: string; onPick: (name: string) => void; exclude?: string }) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-semibold">
        {label}：<span className="font-normal text-ink-muted">{value}</span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {JERSEY_COLORS.filter((c) => c.name !== exclude).map((c) => (
          <button
            key={c.name}
            type="button"
            aria-label={c.name}
            aria-pressed={value === c.name}
            onClick={() => onPick(c.name)}
            className={cn("h-8 w-8 rounded-full border-2 transition-transform", value === c.name ? "scale-110 border-brand-600 ring-2 ring-brand-200" : "border-surface-border")}
            style={{ backgroundColor: c.hex }}
          />
        ))}
      </div>
    </fieldset>
  );
}
