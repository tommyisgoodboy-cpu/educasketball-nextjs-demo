"use client";

import { useActionState } from "react";
import { FormAlert } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Form";
import { login, type AuthState } from "../auth/actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(login, { status: "idle" });
  const values = state.status === "error" ? state.values : undefined;

  return (
    <form action={action} className="space-y-5" noValidate>
      {state.status === "error" && <FormAlert>{state.message}</FormAlert>}
      <input type="hidden" name="next" value={next ?? ""} />
      <Field label="電郵或電話" required hint="可以用註冊嘅電郵，或 8 位香港電話">
        {(p) => <Input {...p} name="identifier" type="text" inputMode="email" autoComplete="username" placeholder="例如 member@example.com 或 9123 4567" defaultValue={values?.identifier} />}
      </Field>
      <Field label="密碼" required>
        {(p) => <Input {...p} name="password" type="password" autoComplete="current-password" />}
      </Field>
      <Button type="submit" variant="primary" size="lg" fullWidth disabled={pending}>
        {pending ? "登入中…" : "登入"}
      </Button>
    </form>
  );
}
