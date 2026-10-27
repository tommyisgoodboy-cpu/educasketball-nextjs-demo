"use client";

import { useActionState } from "react";
import { saveSettings, type SettingsState } from "@/app/(admin)/admin/settings/actions";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Form";
import { PhoneInput } from "@/components/ui/PhoneInput";

type Settings = {
  site: Record<string, unknown>;
  whatsapp: Record<string, unknown>;
  fps: Record<string, unknown>;
  points_rules: Record<string, unknown>;
};

const s = (v: unknown) => (v == null ? "" : String(v));
const stripHK = (v: unknown) => s(v).replace(/^\+?852\s?/, "");

export function SettingsForm({ settings }: { settings: Settings }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(saveSettings, { status: "idle" });
  const err = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const r = settings.points_rules;

  const rule = (key: string, label: string, hint?: string) => (
    <Field label={label} hint={hint} error={err[`rule_${key}`]}>
      {(p) => <Input {...p} name={`rule_${key}`} type="number" min={0} inputMode="numeric" defaultValue={s(r[key])} />}
    </Field>
  );

  return (
    <form action={action} className="max-w-3xl space-y-6" noValidate>
      {state.status === "error" && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </p>
      )}
      {state.status === "saved" && (
        <p role="status" className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          已儲存，前台即時更新。
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>聯絡資料</CardTitle>
        </CardHeader>
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Field label="聯絡電話" required error={err.site_phone} hint="顯示喺頁尾，撳一下可以直接打">
            {(p) => <PhoneInput {...p} name="site_phone" defaultValue={stripHK(settings.site.phone)} />}
          </Field>
          <Field label="電郵" error={err.site_email}>
            {(p) => <Input {...p} name="site_email" type="email" defaultValue={s(settings.site.email)} />}
          </Field>
          <Field label="WhatsApp 號碼" required error={err.whatsapp_number}>
            {(p) => <PhoneInput {...p} name="whatsapp_number" defaultValue={stripHK(settings.whatsapp.display ?? settings.whatsapp.number)} />}
          </Field>
          <Field label="WhatsApp 預設訊息" hint="全站浮動按鈕用；課程頁會自動帶入班名">
            {(p) => <Input {...p} name="whatsapp_message" maxLength={200} defaultValue={s(settings.whatsapp.default_message)} />}
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>FPS 轉數快</CardTitle>
        </CardHeader>
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Field label="FPS 識別碼 / 電話" required error={err.fps_id}>
            {(p) => <Input {...p} name="fps_id" maxLength={50} defaultValue={s(settings.fps.fps_id)} />}
          </Field>
          <Field label="收款人名稱" required error={err.fps_account_name}>
            {(p) => <Input {...p} name="fps_account_name" maxLength={100} defaultValue={s(settings.fps.account_name)} />}
          </Field>
          <Field label="付款指示" className="sm:col-span-2" hint="顯示喺訂單頁">
            {(p) => <Textarea {...p} name="fps_instructions" rows={2} maxLength={500} defaultValue={s(settings.fps.instructions)} />}
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>積分規則</CardTitle>
        </CardHeader>
        <CardBody className="grid gap-4 sm:grid-cols-3">
          {rule("attendance", "出席一堂 +", "點名出席時自動加")}
          {rule("first_enrollment", "首次報名 +", "第一個報名確認時加")}
          {rule("referral", "推薦朋友 +", "喺會員頁手動調整")}
          {rule("spend_per_point", "消費每 $ 得 1 分")}
          {rule("redeem_points", "兌換：每幾多分")}
          {rule("redeem_value", "兌換：抵扣 $")}
          <p className="text-xs text-ink-subtle sm:col-span-3">改咗只影響之後嘅積分，已經入咗紀錄嘅唔會變。</p>
        </CardBody>
      </Card>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "儲存中…" : "儲存設定"}
      </Button>
    </form>
  );
}
