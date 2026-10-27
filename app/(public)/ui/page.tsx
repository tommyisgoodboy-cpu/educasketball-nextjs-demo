import type { Metadata } from "next";
import { Badge, LevelBadge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, CardBody, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Field, Input, Select, Textarea } from "@/components/ui/Form";
import { AGE_GROUP_LABELS, SKILL_LEVELS } from "@/lib/constants";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { formatHKD } from "@/lib/utils";

// 內部頁：共用組件樣板 + 資料庫連線檢查（唔會出現喺 nav）
export const metadata: Metadata = { title: "組件樣板", robots: { index: false } };
export const dynamic = "force-dynamic";

type PublicTable = keyof Database["public"]["Tables"];

// anon 身份睇得到嘅公開 table
const PUBLIC_TABLES: { table: PublicTable; label: string; expected: number }[] = [
  { table: "venues", label: "場地", expected: 3 },
  { table: "coaches", label: "教練", expected: 4 },
  { table: "courses", label: "課程", expected: 6 },
  { table: "classes", label: "班次", expected: 0 },
  { table: "class_sessions", label: "每堂 session", expected: 0 },
  { table: "products", label: "商品", expected: 8 },
  { table: "product_variants", label: "商品款式", expected: 0 },
  { table: "site_settings", label: "網站設定", expected: 4 },
];

async function getSeedCounts() {
  if (!hasSupabaseEnv) return null;
  const supabase = await createClient();
  return Promise.all(
    PUBLIC_TABLES.map(async ({ table, label, expected }) => {
      const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
      return { table, label, expected, count: count ?? 0, error: error?.message };
    }),
  );
}

export default async function UiShowcasePage() {
  const counts = await getSeedCounts();

  return (
    <Container className="space-y-12 py-12">
      <header>
        <h1 className="text-2xl font-bold text-brand-800">組件樣板</h1>
        <p className="mt-1 text-sm text-ink-muted">第 1 階段驗收用：design tokens、共用組件、資料庫連線。</p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">資料庫連線（訪客身份）</h2>
        {counts === null ? (
          <Card>
            <CardBody className="text-sm text-ink-muted">
              未設定 <code>.env.local</code>。請先跑 <code>npx supabase start</code>，再將 URL 同 anon key 填入。
            </CardBody>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {counts.map((c) => {
              const ok = !c.error && c.count > 0 && (c.expected === 0 || c.count === c.expected);
              return (
                <Card key={c.table}>
                  <CardBody className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{c.label}</p>
                      <p className="text-xs text-ink-subtle">{c.table}</p>
                    </div>
                    <Badge tone={ok ? "success" : "danger"}>{c.error ? "錯誤" : `${c.count} 筆`}</Badge>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">Button</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>主要動作</Button>
          <Button variant="cta">立即報名</Button>
          <Button variant="secondary">次要動作</Button>
          <Button variant="ghost">文字按鈕</Button>
          <Button disabled>停用</Button>
          <ButtonLink href="/courses" variant="cta" size="lg">
            連結按鈕
          </ButtonLink>
          <Button size="sm">細</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">Badge</h2>
        <div className="flex flex-wrap gap-2">
          <Badge>一般</Badge>
          <Badge tone="brand">已報名</Badge>
          <Badge tone="aqua">新班</Badge>
          <Badge tone="success">已確認</Badge>
          <Badge tone="warning">待確認</Badge>
          <Badge tone="danger">已額滿</Badge>
          <Badge tone="cta">加入候補</Badge>
          {SKILL_LEVELS.map((l) => (
            <LevelBadge key={l.value} level={l.value} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">Card</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex gap-2">
                <Badge tone="brand">{AGE_GROUP_LABELS.primary}</Badge>
                <LevelBadge level="foundation" />
              </div>
              <CardTitle>小學基礎班</CardTitle>
              <CardDescription>星期六 11:30–13:00 · 天水圍訓練中心</CardDescription>
            </CardHeader>
            <CardBody className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-brand-800">{formatHKD(1680)}</span>
              <span className="text-sm text-ink-muted">10 堂 · 尚餘 5 位</span>
            </CardBody>
            <CardFooter>
              <ButtonLink href="/courses" variant="cta" fullWidth>
                報名
              </ButtonLink>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">Form</h2>
        <Card className="max-w-xl">
          <CardBody className="grid gap-5">
            <Field label="家長姓名" required>
              {(p) => <Input {...p} placeholder="例如：陳太" />}
            </Field>
            <Field label="聯絡電話" hint="我哋會用 WhatsApp 確認報名" required>
              {(p) => <Input {...p} type="tel" inputMode="tel" placeholder="例如：5555 0123" />}
            </Field>
            <Field label="出生年份" error="請輸入有效年份">
              {(p) => <Input {...p} defaultValue="20xx" />}
            </Field>
            <Field label="技術等級">
              {(p) => (
                <Select {...p} defaultValue="starter">
                  {SKILL_LEVELS.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.stage} {l.label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="備註">{(p) => <Textarea {...p} placeholder="例如：小朋友有哮喘" />}</Field>
          </CardBody>
        </Card>
      </section>
    </Container>
  );
}
