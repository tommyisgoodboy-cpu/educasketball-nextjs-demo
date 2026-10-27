import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { getMyPoints, getPointsRules } from "@/lib/data/account";
import { cn, formatTimestampDate } from "@/lib/utils";

export const metadata = { title: "積分" };

export default async function PointsPage() {
  const [{ balance, ledger }, rules] = await Promise.all([getMyPoints(), getPointsRules()]);
  const redeemable = Math.floor(balance / rules.redeemPoints) * rules.redeemValue;

  const earn = [
    { label: "出席一堂", value: `+${rules.attendance}` },
    { label: `商店消費每 $${rules.spendPerPoint}`, value: "+1" },
    { label: "首次報名", value: `+${rules.firstEnrollment}` },
    { label: "推薦朋友成功報名", value: `+${rules.referral}` },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-brand-800 sm:text-3xl">積分</h1>
      </header>

      <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
        <Card className="bg-gradient-to-br from-brand-700 to-brand-900 text-white">
          <CardBody className="flex h-full flex-col justify-between gap-6">
            <div>
              <p className="text-sm text-brand-200">積分餘額</p>
              <p className="mt-1 text-5xl font-bold">{balance.toLocaleString("en-HK")}</p>
            </div>
            <p className="text-sm text-brand-100">
              {redeemable > 0
                ? `可以喺商店抵扣 $${redeemable}（每 ${rules.redeemPoints} 分 = $${rules.redeemValue}）`
                : `儲夠 ${rules.redeemPoints} 分就可以喺商店抵扣 $${rules.redeemValue}`}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>點樣賺積分</CardTitle>
          </CardHeader>
          <CardBody>
            <ul className="divide-y divide-surface-border text-sm">
              {earn.map((r) => (
                <li key={r.label} className="flex justify-between py-2 first:pt-0 last:pb-0">
                  <span className="text-ink-muted">{r.label}</span>
                  <span className="font-bold text-emerald-700">{r.value}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>積分紀錄</CardTitle>
        </CardHeader>
        <CardBody>
          {ledger.length > 0 ? (
            <ul className="divide-y divide-surface-border">
              {ledger.map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{row.reason}</p>
                    <p className="text-xs text-ink-subtle">{formatTimestampDate(row.created_at)}</p>
                  </div>
                  <span className={cn("shrink-0 font-bold", row.delta > 0 ? "text-emerald-700" : "text-red-600")}>
                    {row.delta > 0 ? `+${row.delta}` : row.delta}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-muted">仲未有積分紀錄。出席第一堂就會開始儲分。</p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
