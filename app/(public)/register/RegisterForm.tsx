"use client";

import { useActionState } from "react";
import { FormAlert } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Form";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { register, type AuthState } from "../auth/actions";

export function RegisterForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(register, { status: "idle" });

  if (state.status === "check-email") {
    return (
      <FormAlert tone="info">
        已經寄出確認電郵到 <strong>{state.email}</strong>。請撳電郵入面嘅連結啟用帳戶，之後就可以登入。
      </FormAlert>
    );
  }

  const err = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const val = state.status === "error" ? (state.values ?? {}) : {};

  return (
    <form action={action} className="space-y-5" noValidate key={JSON.stringify(val)}>
      {state.status === "error" && <FormAlert>{state.message}</FormAlert>}
      <Field label="家長姓名" required error={err.full_name}>
        {(p) => <Input {...p} name="full_name" autoComplete="name" placeholder="例如：陳太" defaultValue={val.full_name} />}
      </Field>
      <Field label="聯絡電話" required hint="用嚟 WhatsApp 通知上堂安排" error={err.phone}>
        {(p) => <PhoneInput {...p} name="phone" defaultValue={val.phone} />}
      </Field>
      <Field label="電郵" required hint="登入用" error={err.email}>
        {(p) => <Input {...p} name="email" type="email" autoComplete="email" defaultValue={val.email} />}
      </Field>
      <Field label="密碼" required hint="最少 8 個字元" error={err.password}>
        {(p) => <Input {...p} name="password" type="password" autoComplete="new-password" minLength={8} />}
      </Field>
      <Button type="submit" variant="cta" size="lg" fullWidth disabled={pending}>
        {pending ? "註冊中…" : "註冊會員"}
      </Button>
    </form>
  );
}
