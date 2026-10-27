"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { adjustPoints, setMemberAccess, setStudentLevel, type PointsFormState } from "@/app/(admin)/admin/members/actions";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Form";
import { SKILL_LEVELS } from "@/lib/constants";
import type { SkillLevel, UserRole } from "@/lib/supabase/types";

export function AdjustPointsForm({ profileId }: { profileId: string }) {
  const [state, action, pending] = useActionState<PointsFormState, FormData>(adjustPoints.bind(null, profileId), { status: "idle" });
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.status === "saved") formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="grid gap-3 sm:grid-cols-[8rem_1fr_auto] sm:items-end" noValidate>
      <Field label="加 / 減分" hint="減分用負數">
        {(p) => <Input {...p} name="delta" type="number" step={1} inputMode="numeric" placeholder="例如 50 或 -20" required />}
      </Field>
      <Field label="原因" required>
        {(p) => <Input {...p} name="reason" maxLength={200} placeholder="例如：推薦朋友成功報名" />}
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "儲存中…" : "調整積分"}
      </Button>
      {state.status === "error" && (
        <p role="alert" className="text-sm text-red-600 sm:col-span-3">
          {state.message}
        </p>
      )}
      {state.status === "saved" && (
        <p role="status" className="text-sm text-emerald-700 sm:col-span-3">
          已調整，會員區即時更新。
        </p>
      )}
    </form>
  );
}

export function StudentLevelSelect({ studentId, profileId, level }: { studentId: string; profileId: string; level: SkillLevel }) {
  const [pending, startTransition] = useTransition();
  return (
    <Select
      aria-label="技術等級"
      defaultValue={level}
      disabled={pending}
      className="h-9 w-auto"
      onChange={(e) =>
        startTransition(async () => {
          const r = await setStudentLevel(studentId, profileId, e.target.value as SkillLevel);
          if (r.error) alert(r.error);
        })
      }
    >
      {SKILL_LEVELS.map((l) => (
        <option key={l.value} value={l.value}>
          {l.stage} {l.label}
        </option>
      ))}
    </Select>
  );
}

export function AccessControls({ profileId, role, canManageVenues, isSelf }: { profileId: string; role: UserRole; canManageVenues: boolean; isSelf: boolean }) {
  const [r, setR] = useState(role);
  const [venues, setVenues] = useState(canManageVenues);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string>();
  const dirty = r !== role || venues !== canManageVenues;

  return (
    <div className="space-y-4">
      <Field label="角色" hint={r === "coach" ? "教練可以入後台為自己負責嘅班點名" : r === "admin" ? "管理員可以用後台全部功能" : undefined}>
        {(p) => (
          <Select {...p} value={r} disabled={isSelf} onChange={(e) => setR(e.target.value as UserRole)}>
            <option value="member">會員</option>
            <option value="coach">教練</option>
            <option value="admin">管理員</option>
          </Select>
        )}
      </Field>
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={r === "admin" || venues}
          disabled={r === "admin"}
          onChange={(e) => setVenues(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-brand-600"
        />
        <span>
          <span className="font-semibold text-ink">可管理場地</span>
          <span className="block text-xs text-ink-muted">新增、修改、刪除場地（管理員一律可以）</span>
        </span>
      </label>
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          disabled={!dirty || pending}
          onClick={() =>
            startTransition(async () => {
              if (r === "admin" && role !== "admin" && !confirm("確定將呢個帳戶設為管理員？佢會可以用後台全部功能。")) return;
              const result = await setMemberAccess(profileId, { role: r, canManageVenues: venues });
              setMsg(result.error ?? "已更新權限");
            })
          }
        >
          {pending ? "儲存中…" : "儲存權限"}
        </Button>
        {msg && <span className="text-sm text-ink-muted">{msg}</span>}
      </div>
      {isSelf && <p className="text-xs text-ink-subtle">唔可以更改自己嘅角色。</p>}
    </div>
  );
}
