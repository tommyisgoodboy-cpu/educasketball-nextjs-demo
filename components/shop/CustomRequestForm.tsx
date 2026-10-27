"use client";

import { useActionState, useState } from "react";
import {
  submitCustomRequest,
  type CustomState,
} from "@/app/(public)/custom/actions";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Field,
  FieldError,
  Input,
  Select,
  Textarea,
} from "@/components/ui/Form";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { CUSTOM_ITEM_TYPE_LABELS, CUSTOM_SIZES } from "@/lib/constants";
import { CUSTOM_FABRICS, estimateCustom, featuresFor } from "@/lib/customQuote";
import type { CustomItemType } from "@/lib/supabase/types";
import { formatHKD } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { JerseyPreview, type JerseyDesign } from "./JerseyPreview";

const LOGO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
];

export function CustomRequestForm({
  userId,
  defaults,
}: {
  userId: string | null;
  defaults: { name: string; phone: string; email: string };
}) {
  const [state, action, pending] = useActionState<CustomState, FormData>(
    submitCustomRequest,
    { status: "idle" },
  );
  const [sizes, setSizes] = useState<Record<string, number>>({});
  const [itemType, setItemType] = useState<CustomItemType>("jersey");
  const [fabric, setFabric] = useState<string>("standard");
  const [features, setFeatures] = useState<string[]>([]);
  const [logo, setLogo] = useState<{ path: string; name: string } | null>(null);
  const [logoMsg, setLogoMsg] = useState<string>();
  const [design, setDesign] = useState<JerseyDesign>({
    body: "深藍",
    trim: "白",
    number: "23",
    name: "",
    view: "front",
    team: "",
  });
  const colorsText = `主色${design.body}、號碼${design.trim}`;
  const total = Object.values(sizes).reduce((a, b) => a + (b || 0), 0);
  const availableFeatures = featuresFor(itemType);
  const chosenFeatures = features.filter((k) =>
    availableFeatures.some((f) => f.key === k),
  );
  const est =
    total > 0
      ? estimateCustom({
          itemType,
          qty: total,
          fabric,
          features: chosenFeatures,
        })
      : null;
  const err = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const minDate = new Date(Date.now() + 86400000).toLocaleDateString("en-CA", {
    timeZone: "Asia/Hong_Kong",
  });

  async function uploadLogo(file: File | undefined) {
    if (!file) return;
    if (!LOGO_TYPES.includes(file.type))
      return setLogoMsg("只接受 JPG、PNG、WebP、SVG 或 PDF");
    if (file.size > 10 * 1024 * 1024) return setLogoMsg("檔案唔可以大過 10MB");
    setLogoMsg("上載中…");
    const ext =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase()
        .replace(/[^a-z0-9]/g, "") || "png";
    const path = `${userId ?? `guest/${crypto.randomUUID()}`}/logo-${Date.now()}.${ext}`;
    const { error } = await createClient()
      .storage.from("team-logos")
      .upload(path, file, { contentType: file.type });
    if (error) return setLogoMsg("上載失敗，請再試一次");
    setLogo({ path, name: file.name });
    setLogoMsg(undefined);
  }

  if (state.status === "submitted") {
    return (
      <Card>
        <CardBody className="space-y-4 text-center sm:p-10" role="status">
          <h2 className="text-2xl font-bold">已收到你嘅訂製查詢</h2>
          <p className="text-ink-muted">
            我哋會喺 2
            個工作天內聯絡你，確認設計同正式報價（網頁嘅大約報價只供參考，以職員確認嘅為準）。
          </p>
          {state.loggedIn ? (
            <ButtonLink href="/account/orders" variant="cta">
              喺會員區睇進度
            </ButtonLink>
          ) : (
            <p className="text-sm text-ink-muted">
              登記做會員可以喺網上睇報價同進度。
            </p>
          )}
        </CardBody>
      </Card>
    );
  }

  return (
    <form action={action} className="space-y-6" noValidate>
      {state.status === "error" && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.message}
        </p>
      )}
      <input type="hidden" name="logo_path" value={logo?.path ?? ""} />

      <Card>
        <CardHeader>
          <CardTitle>球隊同聯絡人</CardTitle>
        </CardHeader>
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Field
            label="隊名 / 學校名"
            required
            error={err.team_name}
            className="sm:col-span-2"
          >
            {(p) => (
              <Input
                {...p}
                name="team_name"
                maxLength={100}
                onChange={(e) =>
                  setDesign((d) => ({
                    ...d,
                    team: e.target.value.replace(/[^A-Za-z0-9 ]/g, ""),
                  }))
                }
              />
            )}
          </Field>
          <Field label="聯絡人" required error={err.contact_name}>
            {(p) => (
              <Input
                {...p}
                name="contact_name"
                defaultValue={defaults.name}
                autoComplete="name"
              />
            )}
          </Field>
          <Field label="聯絡電話" required error={err.contact_phone}>
            {(p) => (
              <PhoneInput
                {...p}
                name="contact_phone"
                defaultValue={defaults.phone}
              />
            )}
          </Field>
          <Field
            label="電郵"
            error={err.contact_email}
            className="sm:col-span-2"
          >
            {(p) => (
              <Input
                {...p}
                name="contact_email"
                type="email"
                defaultValue={defaults.email}
                autoComplete="email"
              />
            )}
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>球衣預覽</CardTitle>
        </CardHeader>
        <CardBody>
          <JerseyPreview design={design} onChange={setDesign} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>訂製內容</CardTitle>
        </CardHeader>
        <CardBody className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="訂製類別" required error={err.item_type}>
              {(p) => (
                <Select
                  {...p}
                  name="item_type"
                  value={itemType}
                  onChange={(e) =>
                    setItemType(e.target.value as CustomItemType)
                  }
                >
                  {Object.entries(CUSTOM_ITEM_TYPE_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="顏色" hint="會跟上面預覽自動填，亦可以自己改">
              {(p) => (
                <Input
                  {...p}
                  name="colors"
                  maxLength={200}
                  key={colorsText}
                  defaultValue={colorsText}
                />
              )}
            </Field>
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold">
              尺碼分佈 <span className="text-red-600">*</span>
              <span className="ml-2 font-normal text-ink-muted">
                合共 {total} 件
              </span>
            </legend>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
              {CUSTOM_SIZES.map((s) => (
                <label
                  key={s}
                  className="flex flex-col gap-1 text-center text-xs text-ink-muted"
                >
                  {s}
                  <Input
                    name={`size_${s}`}
                    type="number"
                    min={0}
                    max={500}
                    inputMode="numeric"
                    placeholder="0"
                    className="h-10 px-1 text-center"
                    onChange={(e) =>
                      setSizes((cur) => ({
                        ...cur,
                        [s]: Math.max(0, Number(e.target.value) || 0),
                      }))
                    }
                  />
                </label>
              ))}
            </div>
            {err.sizes && <FieldError className="mt-1">{err.sizes}</FieldError>}
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold">面料</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {CUSTOM_FABRICS.map((f) => (
                <label
                  key={f.key}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm ${fabric === f.key ? "border-brand-600 bg-brand-50" : "border-surface-border bg-white hover:border-brand-200"}`}
                >
                  <input
                    type="radio"
                    name="fabric"
                    value={f.key}
                    checked={fabric === f.key}
                    onChange={() => setFabric(f.key)}
                    className="mt-1 accent-brand-600"
                  />
                  <span>
                    <span className="font-semibold text-ink">{f.label}</span>
                    <span className="ml-2 text-xs text-ink-muted">
                      {f.add > 0 ? `+HK$${f.add} / 件` : "基本款"}
                    </span>
                    <span className="block text-xs text-ink-muted">
                      {f.note}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold">
              功能 / 加工{" "}
              <span className="font-normal text-ink-muted">（可以揀多項）</span>
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {availableFeatures.map((f) => {
                const on = chosenFeatures.includes(f.key);
                return (
                  <label
                    key={f.key}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm ${on ? "border-brand-600 bg-brand-50" : "border-surface-border bg-white hover:border-brand-200"}`}
                  >
                    <input
                      type="checkbox"
                      name="features"
                      value={f.key}
                      checked={on}
                      onChange={() =>
                        setFeatures((cur) =>
                          cur.includes(f.key)
                            ? cur.filter((k) => k !== f.key)
                            : [...cur, f.key],
                        )
                      }
                      className="h-4 w-4 accent-brand-600"
                    />
                    <span className="font-semibold text-ink">{f.label}</span>
                    <span className="ml-auto text-xs text-ink-muted">
                      +HK${f.add} / 件
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div
            className="rounded-lg border border-brand-200 bg-brand-50/70 p-4"
            role="status"
            aria-live="polite"
          >
            <p className="text-sm font-semibold text-ink">
              大約報價（只供參考）
            </p>
            {est ? (
              <>
                <p className="mt-1 text-2xl font-bold text-brand-800">
                  約 {formatHKD(est.low)} – {formatHKD(est.high)}
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  {total} 件 · 每件約 {formatHKD(est.unit)}
                  {est.off > 0 &&
                    ` · 已計 ${Math.round(est.off * 100)}% 數量折扣`}
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm text-ink-muted">
                填寫尺碼數量後會即時顯示大約價錢。
              </p>
            )}
            <p className="mt-2 text-xs text-ink-subtle">
              呢個係系統估價，<b>唔係正式報價</b>
              。提交後職員會按設計同加工確認，喺後台發出正式報價；你接受報價之後先需要付款。
            </p>
          </div>

          <Field
            label="號碼名單"
            hint="每行一個：號碼 + 名，例如「23 CHAN」。未定可以留空"
          >
            {(p) => (
              <Textarea
                {...p}
                name="roster"
                rows={4}
                placeholder={"4 HO\n7 LAM\n10 CHEUNG"}
              />
            )}
          </Field>

          <div className="space-y-2">
            <p className="text-sm font-semibold">隊徽 / Logo</p>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-brand-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50">
              {logo ? "更換檔案" : "上載檔案"}
              <input
                type="file"
                accept={LOGO_TYPES.join(",")}
                className="sr-only"
                onChange={(e) => uploadLogo(e.target.files?.[0])}
              />
            </label>
            {logo && (
              <p className="text-sm text-emerald-700">已上載：{logo.name}</p>
            )}
            {(logoMsg || err.logo) && (
              <p className="text-sm text-ink-muted">{logoMsg ?? err.logo}</p>
            )}
            <p className="text-xs text-ink-subtle">
              JPG、PNG、SVG 或 PDF，10MB 以內
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="期望交貨日" error={err.due_date}>
              {(p) => (
                <Input {...p} name="due_date" type="date" min={minDate} />
              )}
            </Field>
          </div>
          <Field label="備註" error={err.notes}>
            {(p) => (
              <Textarea
                {...p}
                name="notes"
                rows={3}
                maxLength={1000}
                placeholder="例如：雙面款、校徽印左胸"
              />
            )}
          </Field>
        </CardBody>
      </Card>

      <Button type="submit" variant="cta" size="lg" disabled={pending}>
        {pending ? "提交中…" : "提交查詢"}
      </Button>
    </form>
  );
}
