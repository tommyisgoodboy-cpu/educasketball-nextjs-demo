"use client";

import { useState, useTransition } from "react";
import { addStudentNote, deleteStudentNote } from "@/app/(admin)/admin/notes/actions";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Form";
import type { NoteKind, StudentNote } from "@/lib/data/notes";
import { cn } from "@/lib/utils";

const KINDS: Record<NoteKind, { label: string; icon: string; chip: string }> = {
  health: { label: "健康", icon: "🩹", chip: "bg-red-50 text-red-800 ring-red-200" },
  schedule: { label: "時間", icon: "⏰", chip: "bg-sky-50 text-sky-800 ring-sky-200" },
  general: { label: "其他", icon: "📝", chip: "bg-slate-50 text-slate-700 ring-slate-200" },
};

/** 後台：學員備注（例如「手受傷」「逢週五 19:00 要補習」）。只有職員睇到；教練只可刪自己寫嘅 */
export function StudentNotes({ studentId, studentName, notes, viewerId, isAdmin }: { studentId: string; studentName: string; notes: StudentNote[]; viewerId: string; isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<NoteKind>("health");
  const [text, setText] = useState("");
  const [msg, setMsg] = useState<string>();
  const [pending, startTransition] = useTransition();
  const canDelete = (n: StudentNote) => isAdmin || n.created_by === viewerId;

  function save() {
    startTransition(async () => {
      const r = await addStudentNote(studentId, kind, text);
      setMsg(r.error);
      if (!r.error) {
        setText("");
        setOpen(false);
      }
    });
  }

  return (
    <div className="space-y-2">
      <ul className="space-y-1.5" aria-label={`${studentName} 嘅備注`}>
        {notes.map((n) => (
          <li key={n.id} className={cn("flex items-start gap-2 rounded-lg px-2.5 py-1.5 text-xs ring-1 ring-inset", KINDS[n.kind].chip)}>
            <span aria-hidden>{KINDS[n.kind].icon}</span>
            <span className="min-w-0 flex-1 break-words">
              <b className="mr-1 font-semibold">{KINDS[n.kind].label}</b>
              {n.body}
            </span>
            {canDelete(n) && (
              <button
                type="button"
                aria-label="刪除備注"
                disabled={pending}
                className="shrink-0 opacity-60 hover:opacity-100"
                onClick={() => {
                  if (!confirm("刪除呢個備注？")) return;
                  startTransition(async () => setMsg((await deleteStudentNote(n.id)).error));
                }}
              >
                ×
              </button>
            )}
          </li>
        ))}
      </ul>
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="rounded-full border border-dashed border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50">
          ＋ 備注
        </button>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Select aria-label="備注類型" value={kind} onChange={(e) => setKind(e.target.value as NoteKind)} className="h-9 w-auto">
            {(Object.keys(KINDS) as NoteKind[]).map((k) => (
              <option key={k} value={k}>
                {KINDS[k].icon} {KINDS[k].label}
              </option>
            ))}
          </Select>
          <Input
            aria-label="備注內容"
            value={text}
            maxLength={200}
            placeholder="例如：手腕受傷 / 逢週五 19:00 要補習"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !pending && text.trim() && save()}
            className="h-9 min-w-56 flex-1"
          />
          <Button size="sm" onClick={save} disabled={pending || !text.trim()}>
            儲存
          </Button>
          <button type="button" onClick={() => setOpen(false)} className="text-xs text-ink-muted hover:underline">
            取消
          </button>
        </div>
      )}
      {msg && (
        <p role="alert" className="text-xs text-red-600">
          {msg}
        </p>
      )}
    </div>
  );
}
