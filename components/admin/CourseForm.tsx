"use client";

import { useActionState } from "react";
import { useActionRedirect } from "@/components/admin/useActionRedirect";
import { saveCourse, type FormState } from "@/app/(admin)/admin/courses/actions";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/components/ui/Form";
import { AGE_GROUP_LABELS, SKILL_LEVELS } from "@/lib/constants";
import type { Course } from "@/lib/supabase/types";

export function CourseForm({ course, coaches = [] }: { course?: Course; coaches?: { id: string; label: string }[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveCourse, { status: "idle" });
  useActionRedirect(state);
  const err = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={action} noValidate>
      <Card className="max-w-2xl">
        <CardBody className="grid gap-5">
          {state.status === "error" && (
            <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.message}
            </p>
          )}
          {course && <input type="hidden" name="id" value={course.id} />}
          <Field label="課程名稱" required error={err.title}>
            {(p) => <Input {...p} name="title" defaultValue={course?.title} />}
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="年齡組別" required error={err.age_group}>
              {(p) => (
                <Select {...p} name="age_group" defaultValue={course?.age_group ?? "primary"}>
                  {Object.entries(AGE_GROUP_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="技術等級" required error={err.level}>
              {(p) => (
                <Select {...p} name="level" defaultValue={course?.level ?? "starter"}>
                  {SKILL_LEVELS.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.stage} {l.label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="每期收費（HK$）" required error={err.price}>
              {(p) => <Input {...p} name="price" type="number" min={0} step={10} inputMode="numeric" defaultValue={course?.price} />}
            </Field>
            <Field label="每期堂數" required error={err.sessions_count} hint="開新班次時用嚟推算完結日期">
              {(p) => <Input {...p} name="sessions_count" type="number" min={1} max={100} inputMode="numeric" defaultValue={course?.sessions_count ?? 8} />}
            </Field>
          </div>
          <Field label="預設教練" error={err.default_coach_id} hint="開新班次時自動帶入，仍然可以逐班更改">
            {(p) => (
              <Select {...p} name="default_coach_id" defaultValue={course?.default_coach_id ?? ""}>
                <option value="">未指定（開班時自己揀）</option>
                {coaches.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="課程簡介">
            {(p) => <Textarea {...p} name="description" rows={4} defaultValue={course?.description ?? ""} />}
          </Field>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" name="is_active" defaultChecked={course?.is_active ?? true} className="h-4 w-4 accent-brand-600" />
            上架（前台顯示同接受報名）
          </label>
          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? "儲存中…" : "儲存"}
            </Button>
            <ButtonLink href="/admin/courses" variant="ghost">
              取消
            </ButtonLink>
          </div>
        </CardBody>
      </Card>
    </form>
  );
}
