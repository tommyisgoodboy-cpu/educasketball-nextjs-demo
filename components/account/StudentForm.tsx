"use client";

import { useActionState, useEffect } from "react";
import { saveStudent, type StudentFormState } from "@/app/(account)/account/students/actions";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Form";
import type { Student } from "@/lib/supabase/types";

const YEARS = ["0", "1", "2", "3", "4", "5"];

export function StudentForm({ student, onDone }: { student?: Student; onDone?: () => void }) {
  const [state, action, pending] = useActionState<StudentFormState, FormData>(saveStudent, { status: "idle" });
  const err = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const thisYear = new Date().getFullYear();

  useEffect(() => {
    if (state.status === "saved") onDone?.();
  }, [state, onDone]);

  return (
    <form action={action} className="grid gap-4" noValidate>
      {student && <input type="hidden" name="id" value={student.id} />}
      {state.status === "error" && !state.fieldErrors && (
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="學員姓名" required error={err.name} className="sm:col-span-3">
          {(p) => <Input {...p} name="name" defaultValue={student?.name} placeholder="例如：陳小晴" />}
        </Field>
        <Field label="出生年份" required error={err.birth_year}>
          {(p) => (
            <Input
              {...p}
              name="birth_year"
              type="number"
              inputMode="numeric"
              min={thisYear - 80}
              max={thisYear - 3}
              defaultValue={student?.birth_year}
              placeholder={`例如：${thisYear - 9}`}
            />
          )}
        </Field>
        <Field label="球齡" error={err.years_playing}>
          {(p) => (
            <Select {...p} name="years_playing" defaultValue={String(Math.min(student?.years_playing ?? 0, 5))}>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y === "0" ? "未學過 / 少於 1 年" : y === "5" ? "5 年或以上" : `${y} 年`}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>
      <Field label="備註" hint="例如健康狀況、想教練留意嘅地方" error={err.notes}>
        {(p) => <Textarea {...p} name="notes" rows={2} maxLength={1000} defaultValue={student?.notes ?? ""} />}
      </Field>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "儲存中…" : student ? "儲存" : "新增學員"}
        </Button>
        {onDone && (
          <Button type="button" variant="ghost" onClick={onDone}>
            取消
          </Button>
        )}
      </div>
    </form>
  );
}
