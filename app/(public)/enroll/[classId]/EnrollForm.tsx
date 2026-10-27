"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/components/ui/Form";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { PayPanel } from "../PayPanel";
import { enroll, type EnrollFields, type EnrollState } from "./actions";

const YEARS_PLAYING = ["0", "1", "2", "3", "4", "5"];

/** 已登入會員：可以揀已有學員，家長資料預先填好 */
export type EnrollMember = {
  full_name: string;
  phone: string;
  email: string;
  students: { id: string; name: string; birth_year: number }[];
};

export function EnrollForm({
  classId,
  isFull,
  courseTitle,
  member,
}: {
  classId: string;
  isFull: boolean;
  courseTitle: string;
  member: EnrollMember | null;
}) {
  const [state, action, pending] = useActionState<EnrollState, FormData>(enroll.bind(null, classId), { status: "idle" });
  const [studentId, setStudentId] = useState(member?.students[0]?.id ?? "new");

  if (state.status === "success") {
    return <EnrollSuccess state={state} courseTitle={courseTitle} isMember={Boolean(member)} />;
  }

  const err = state.status === "error" ? state.fieldErrors : {};
  const val: Partial<EnrollFields> = state.status === "error" ? state.values : {};
  const thisYear = new Date().getFullYear();
  const existing = member?.students.find((s) => s.id === studentId);

  return (
    // key：每次提交後重新掛載，令 defaultValue 跟返伺服器回傳嘅值
    <form action={action} noValidate className="space-y-6" key={state.status === "error" ? JSON.stringify(val) : "new"}>
      {state.status === "error" && (
        <ErrorSummary message={state.message} />
      )}

      {member && member.students.length > 0 && (
        <Card>
          <CardBody className="space-y-4">
            <h2 className="text-lg font-bold text-ink">幫邊位學員報名？</h2>
            <input type="hidden" name="student_id" value={studentId} />
            <input type="hidden" name="student_label" value={existing?.name ?? ""} />
            <div role="radiogroup" aria-label="選擇學員" className="grid gap-2 sm:grid-cols-2">
              {[...member.students.map((s) => ({ id: s.id, label: s.name, sub: `${s.birth_year} 年出生` })), { id: "new", label: "＋ 新增學員", sub: "幫第二位小朋友報名" }].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${studentId === opt.id ? "border-brand-500 bg-brand-50" : "border-surface-border hover:bg-surface-muted"}`}
                >
                  <input
                    type="radio"
                    name="student_choice"
                    value={opt.id}
                    checked={studentId === opt.id}
                    onChange={() => setStudentId(opt.id)}
                    className="h-4 w-4 accent-brand-600"
                  />
                  <span>
                    <span className="block font-semibold text-ink">{opt.label}</span>
                    <span className="block text-xs text-ink-muted">{opt.sub}</span>
                  </span>
                </label>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {existing ? (
        <Card>
          <CardBody>
            <Field label="備註" hint="例如健康狀況、想教練留意嘅地方">
              {(p) => <Textarea {...p} name="notes" rows={3} maxLength={1000} defaultValue={val.notes} />}
            </Field>
          </CardBody>
        </Card>
      ) : (
      <>
      <Card>
        <CardBody className="space-y-5">
          <h2 className="text-lg font-bold text-ink">家長資料</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="家長姓名" required error={err.parent_name}>
              {(p) => <Input {...p} name="parent_name" autoComplete="name" placeholder="例如：陳太" defaultValue={val.parent_name ?? member?.full_name} />}
            </Field>
            <Field label="聯絡電話" required hint="我哋會用 WhatsApp 確認報名" error={err.parent_phone}>
              {(p) => (
                <PhoneInput {...p} name="parent_phone" defaultValue={val.parent_phone ?? member?.phone ?? undefined} />
              )}
            </Field>
          </div>
          <Field label="電郵" hint={member ? undefined : "選填，之後開會員帳戶可以用返"} error={err.parent_email}>
            {(p) => <Input {...p} name="parent_email" type="email" autoComplete="email" defaultValue={val.parent_email ?? member?.email} />}
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-5">
          <h2 className="text-lg font-bold text-ink">學員資料</h2>
          <Field label="學員姓名" required error={err.student_name}>
            {(p) => <Input {...p} name="student_name" placeholder="例如：陳小晴" defaultValue={val.student_name} />}
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="出生年份" required error={err.birth_year}>
              {(p) => (
                <Input
                  {...p}
                  name="birth_year"
                  type="number"
                  inputMode="numeric"
                  min={thisYear - 80}
                  max={thisYear - 3}
                  placeholder={`例如：${thisYear - 9}`}
                  defaultValue={val.birth_year}
                />
              )}
            </Field>
            <Field label="球齡" hint="學咗籃球幾耐">
              {(p) => (
                <Select {...p} name="years_playing" defaultValue={val.years_playing ?? "0"}>
                  {YEARS_PLAYING.map((y) => (
                    <option key={y} value={y}>
                      {y === "0" ? "未學過 / 少於 1 年" : y === "5" ? "5 年或以上" : `${y} 年`}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>
          <Field label="備註" hint="例如健康狀況、想教練留意嘅地方" error={err.notes}>
            {(p) => <Textarea {...p} name="notes" rows={3} maxLength={1000} defaultValue={val.notes} />}
          </Field>
        </CardBody>
      </Card>
      </>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-ink-subtle">提交即表示同意我哋用以上資料處理報名。付款可以揀網上付款（測試模式）或 FPS，確認後先需要付款。</p>
        <Button type="submit" variant={isFull ? "primary" : "cta"} size="lg" disabled={pending} className="shrink-0">
          {pending ? "提交中…" : isFull ? "加入候補名單" : "提交報名"}
        </Button>
      </div>
    </form>
  );
}

/** 錯誤訊息喺表格頂，提交後捲返上嚟 */
function ErrorSummary({ message }: { message: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div ref={ref} role="alert" className="scroll-mt-24 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  );
}

function EnrollSuccess({
  state,
  courseTitle,
  isMember,
}: {
  state: Extract<EnrollState, { status: "success" }>;
  courseTitle: string;
  isMember: boolean;
}) {
  const waitlisted = state.enrollmentStatus === "waitlist";
  const ref = useRef<HTMLDivElement>(null);

  // 提交時通常捲咗落表格底，成功後捲返上嚟睇結果
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    ref.current?.focus();
  }, []);

  return (
    <Card ref={ref} tabIndex={-1} className="scroll-mt-24 outline-none">
      <CardBody className="space-y-6 text-center sm:p-10">
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${waitlisted ? "bg-cta-soft text-cta" : "bg-emerald-50 text-emerald-600"}`}
          aria-hidden
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.5">
            {waitlisted ? <path d="M12 7v5l3 3M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /> : <path d="m5 12 5 5L20 7" />}
          </svg>
        </div>

        <div className="space-y-2" role="status">
          <h2 className="text-2xl font-bold text-ink">{waitlisted ? "已加入候補名單" : "已收到報名"}</h2>
          <p className="text-ink-muted">
            {waitlisted
              ? `「${courseTitle}」呢班暫時額滿，${state.studentName} 已排入候補。一有位我哋會即刻 WhatsApp 通知你。`
              : `${state.studentName} 報讀「${courseTitle}」嘅申請已收到，狀態係「待確認」。職員會喺 1–2 個工作天內 WhatsApp 聯絡你確認同付款。`}
          </p>
        </div>

        {!waitlisted && state.enrollmentId && <PayPanel enrollmentId={state.enrollmentId} stripeReady={Boolean(state.stripeReady)} />}

        {isMember ? null : (
          <div className="rounded-lg bg-brand-50 p-5 text-left">
            <p className="font-semibold text-brand-800">開個會員帳戶，隨時睇上堂時間同進度</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-brand-700">
              <li>啱啱嘅報名會自動連結到你個帳戶</li>
              <li>睇報名狀態、上課時間表同出席紀錄</li>
              <li>出席每堂賺 10 積分，可以喺商店換折扣</li>
              <li>一個帳戶管理晒屋企幾個小朋友</li>
            </ul>
          </div>
        )}

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href={isMember ? "/account" : "/register"} variant="cta" size="lg">
            {isMember ? "去會員區睇報名" : "免費開會員帳戶"}
          </ButtonLink>
          <ButtonLink href="/courses" variant="secondary" size="lg">
            睇其他課程
          </ButtonLink>
        </div>
      </CardBody>
    </Card>
  );
}
