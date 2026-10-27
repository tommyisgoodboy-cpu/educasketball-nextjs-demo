"use client";

import { useState, useTransition } from "react";
import { awardBadge, revokeBadge } from "@/app/(admin)/admin/badges/actions";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Form";
import { BADGES, type BadgeKey } from "@/lib/constants";
import type { StudentBadge } from "@/lib/data/badges";

/** 後台：睇、頒發、收回徽章 */
/** viewerId / isAdmin：管理員可以收回任何徽章，教練只可以收回自己頒發嘅 */
export function BadgeManager({ studentId, studentName, badges, viewerId, isAdmin }: { studentId: string; studentName: string; badges: StudentBadge[]; viewerId: string; isAdmin: boolean }) {
  const canRevoke = (b: StudentBadge) => isAdmin || b.awarded_by === viewerId;
  const [open, setOpen] = useState(false);
  const owned = new Set(badges.map((b) => b.badge_key));
  const available = (Object.keys(BADGES) as BadgeKey[]).filter((k) => !owned.has(k));
  const [key, setKey] = useState<BadgeKey | "">(available[0] ?? "");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<string>();
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      <ul className="flex flex-wrap gap-2" aria-label={`${studentName} 嘅徽章`}>
        {badges.map((b) => (
          <li key={b.id} className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-200">
            <span aria-hidden>{BADGES[b.badge_key].icon}</span>
            {BADGES[b.badge_key].label}
            {canRevoke(b) && (
              <button
                type="button"
                aria-label={`收回 ${BADGES[b.badge_key].label}`}
                className="ml-1 text-amber-600 hover:text-red-600"
                disabled={pending}
                onClick={() => {
                  if (!confirm(`收回「${BADGES[b.badge_key].label}」？`)) return;
                  startTransition(async () => setMsg((await revokeBadge(b.id)).error));
                }}
              >
                ×
              </button>
            )}
          </li>
        ))}
        {available.length > 0 && !open && (
          <li>
            <button type="button" onClick={() => setOpen(true)} className="rounded-full border border-dashed border-amber-300 px-2.5 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-50">
              ＋ 頒發徽章
            </button>
          </li>
        )}
      </ul>
      {open && (
        <div className="flex flex-wrap items-center gap-2">
          <Select aria-label="徽章" value={key} onChange={(e) => setKey(e.target.value as BadgeKey)} className="h-9 w-auto">
            {available.map((k) => (
              <option key={k} value={k}>
                {BADGES[k].icon} {BADGES[k].label}
              </option>
            ))}
          </Select>
          <Input aria-label="評語（選填）" placeholder="評語（選填）" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} className="h-9 w-48" />
          <Button
            size="sm"
            disabled={!key || pending}
            onClick={() =>
              startTransition(async () => {
                const r = await awardBadge(studentId, key, note);
                setMsg(r.error ?? `已頒發「${BADGES[key as BadgeKey].label}」`);
                if (!r.error) {
                  setOpen(false);
                  setNote("");
                }
              })
            }
          >
            頒發
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
            取消
          </Button>
        </div>
      )}
      {msg && <p className="text-xs text-ink-muted">{msg}</p>}
    </div>
  );
}
