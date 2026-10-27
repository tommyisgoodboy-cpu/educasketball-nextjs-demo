"use client";

import { useActionState } from "react";
import {
  saveQuote,
  type QuoteState,
} from "@/app/(admin)/admin/custom-requests/actions";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Form";

export function QuoteForm({
  id,
  amount,
  note,
  isDraft = false,
}: {
  id: string;
  amount: number | null;
  note: string | null;
  isDraft?: boolean;
}) {
  const [state, action, pending] = useActionState<QuoteState, FormData>(
    saveQuote.bind(null, id),
    { status: "idle" },
  );
  return (
    <form action={action} className="space-y-4" noValidate>
      <Field
        label="報價金額（HK$）"
        required
        hint={isDraft ? "已預填系統估價，請按設計同加工調整後確認" : undefined}
      >
        {(p) => (
          <Input
            {...p}
            name="quote_amount"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            defaultValue={amount ?? undefined}
          />
        )}
      </Field>
      <Field label="報價備註" hint="例如包括咩、交貨期">
        {(p) => (
          <Textarea
            {...p}
            name="quote_note"
            rows={3}
            defaultValue={note ?? ""}
          />
        )}
      </Field>
      <Button type="submit" disabled={pending}>
        {pending
          ? "儲存中…"
          : isDraft
            ? "確認並發出正式報價"
            : amount
              ? "更新報價"
              : "發出報價"}
      </Button>
      {state.status === "error" && (
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      )}
      {state.status === "saved" && (
        <p role="status" className="text-sm text-emerald-700">
          已發出報價，會員喺會員區即時睇到。
        </p>
      )}
    </form>
  );
}
