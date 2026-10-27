"use client";

import { useActionState, useState } from "react";
import { useActionRedirect } from "@/components/admin/useActionRedirect";
import { saveClass } from "@/app/(admin)/admin/classes/actions";
import type { FormState } from "@/app/(admin)/admin/courses/actions";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/Form";
import { weekdayLabel } from "@/lib/utils";

type Option = { id: string; label: string };
type CourseOption = Option & { sessionsCount: number; defaultCoachId?: string | null };

export type ClassFormValues = {
  id?: string;
  course_id: string;
  coach_id: string | null;
  venue_id: string | null;
  weekday: number;
  start_time: string;
  end_time: string;
  start_date: string;
  end_date: string;
  capacity: number;
};

/** 由開始日期推算第 n 堂：開始日期之後第一個符合星期嘅日子，再加 (n-1) 星期 */
function computeEndDate(startDate: string, weekday: number, sessions: number) {
  if (!startDate || !sessions) return "";
  const d = new Date(`${startDate}T00:00:00Z`);
  const iso = d.getUTCDay() === 0 ? 7 : d.getUTCDay();
  d.setUTCDate(d.getUTCDate() + ((weekday - iso + 7) % 7) + (sessions - 1) * 7);
  return d.toISOString().slice(0, 10);
}

export function ClassForm({
  initial,
  courses,
  coaches,
  venues,
  takenSeats = 0,
}: {
  initial: ClassFormValues;
  courses: CourseOption[];
  coaches: Option[];
  venues: Option[];
  takenSeats?: number;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveClass, { status: "idle" });
  useActionRedirect(state);
  const err = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const [v, setV] = useState(initial);
  const set = <K extends keyof ClassFormValues>(k: K, value: ClassFormValues[K]) => setV((s) => ({ ...s, [k]: value }));
  const course = courses.find((c) => c.id === v.course_id);
  const suggestedEnd = course ? computeEndDate(v.start_date, v.weekday, course.sessionsCount) : "";

  return (
    <form action={action} noValidate>
      <Card className="max-w-3xl">
        <CardBody className="grid gap-5">
          {state.status === "error" && (
            <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.message}
            </p>
          )}
          {v.id && <input type="hidden" name="id" value={v.id} />}

          <Field label="課程" required error={err.course_id}>
            {(p) => (
              <Select {...p} name="course_id" value={v.course_id} onChange={(e) => {
                  const id = e.target.value;
                  const picked = courses.find((c) => c.id === id);
                  // 開新班次（未揀教練）時，帶入課程預設教練
                  setV((s) => ({ ...s, course_id: id, coach_id: !s.id && !s.coach_id && picked?.defaultCoachId ? picked.defaultCoachId : s.coach_id }));
                }}>
                <option value="">請揀課程</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}（每期 {c.sessionsCount} 堂）
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="星期" required error={err.weekday}>
              {(p) => (
                <Select {...p} name="weekday" value={v.weekday} onChange={(e) => set("weekday", Number(e.target.value))}>
                  {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                    <option key={d} value={d}>
                      {weekdayLabel(d)}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="開始時間" required error={err.start_time}>
              {(p) => <Input {...p} name="start_time" type="time" step={900} value={v.start_time} onChange={(e) => set("start_time", e.target.value)} />}
            </Field>
            <Field label="完結時間" required error={err.end_time}>
              {(p) => <Input {...p} name="end_time" type="time" step={900} value={v.end_time} onChange={(e) => set("end_time", e.target.value)} />}
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="開始日期" required error={err.start_date}>
              {(p) => <Input {...p} name="start_date" type="date" value={v.start_date} onChange={(e) => set("start_date", e.target.value)} />}
            </Field>
            <div className="flex flex-col gap-1.5">
              <Field label="完結日期" required error={err.end_date}>
                {(p) => <Input {...p} name="end_date" type="date" value={v.end_date} onChange={(e) => set("end_date", e.target.value)} />}
              </Field>
              {suggestedEnd && suggestedEnd !== v.end_date && (
                <button type="button" onClick={() => set("end_date", suggestedEnd)} className="self-start text-xs font-semibold text-brand-700 hover:underline">
                  按 {course?.sessionsCount} 堂計：設為 {suggestedEnd}
                </button>
              )}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="名額" required error={err.capacity} hint={takenSeats ? `已佔 ${takenSeats} 個位` : undefined}>
              {(p) => <Input {...p} name="capacity" type="number" min={1} max={200} inputMode="numeric" value={v.capacity} onChange={(e) => set("capacity", Number(e.target.value))} />}
            </Field>
            <Field label="教練" error={err.coach_id}>
              {(p) => (
                <Select {...p} name="coach_id" value={v.coach_id ?? ""} onChange={(e) => set("coach_id", e.target.value || null)}>
                  <option value="">未定</option>
                  {coaches.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="場地" error={err.venue_id}>
              {(p) => (
                <Select {...p} name="venue_id" value={v.venue_id ?? ""} onChange={(e) => set("venue_id", e.target.value || null)}>
                  <option value="">未定</option>
                  {venues.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>
          {takenSeats > v.capacity && (
            <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">名額少過已報人數（{takenSeats}），已報嘅學員唔會受影響，但新報名會自動變候補。</p>
          )}
          <p className="text-xs text-ink-subtle">儲存後會按開始至完結日期之間每個{weekdayLabel(v.weekday)}自動生成每一堂。改日期時，未點名嘅舊堂會自動移除。</p>

          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? "儲存中…" : "儲存"}
            </Button>
            <ButtonLink href="/admin/classes" variant="ghost">
              取消
            </ButtonLink>
          </div>
        </CardBody>
      </Card>
    </form>
  );
}
