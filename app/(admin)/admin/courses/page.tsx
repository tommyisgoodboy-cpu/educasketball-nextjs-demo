import Link from "next/link";
import { AdminPageHeader, EmptyRow, ListFilterForm, TableWrap } from "@/components/admin/AdminPage";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Badge, LevelBadge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/admin";
import { AGE_GROUP_LABELS } from "@/lib/constants";
import { getAllCourses } from "@/lib/data/admin";
import { formatHKD } from "@/lib/utils";
import { toggleCourseActive } from "./actions";

export const metadata = { title: "課程" };

export default async function CoursesAdminPage({ searchParams }: { searchParams: Promise<{ q?: string; age?: string; state?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase().slice(0, 50);
  const age = sp.age && sp.age in AGE_GROUP_LABELS ? sp.age : "";
  const state = sp.state === "active" || sp.state === "inactive" || sp.state === "running" ? sp.state : "";
  const courses = (await getAllCourses()).filter(
    (c) =>
      (!q || c.title.toLowerCase().includes(q)) &&
      (!age || c.age_group === age) &&
      (state === "" || (state === "active" && c.is_active) || (state === "inactive" && !c.is_active) || (state === "running" && c.activeClasses > 0)),
  );

  return (
    <>
      <AdminPageHeader title="課程" description="課程係班次嘅範本：收費、堂數、年齡同等級。具體上堂時間喺「班次」設定。" actions={<ButtonLink href="/admin/courses/new">＋ 新增課程</ButtonLink>} />
      <ListFilterForm action="/admin/courses" q={q} qPlaceholder="搜尋課程名稱" noDate>
        <select name="age" defaultValue={age} aria-label="對象" className="h-11 rounded-lg border border-surface-border bg-white px-3 text-sm text-ink">
          <option value="">全部對象</option>
          {Object.entries(AGE_GROUP_LABELS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <select name="state" defaultValue={state} aria-label="狀態" className="h-11 rounded-lg border border-surface-border bg-white px-3 text-sm text-ink">
          <option value="">全部狀態</option>
          <option value="active">上架中</option>
          <option value="inactive">已下架</option>
          <option value="running">有進行中班次</option>
        </select>
      </ListFilterForm>
      <TableWrap>
        <thead>
          <tr>
            <th>課程</th>
            <th>對象</th>
            <th>收費</th>
            <th>班次</th>
            <th>狀態</th>
            <th className="text-right">動作</th>
          </tr>
        </thead>
        <tbody>
          {courses.length === 0 && <EmptyRow colSpan={6}>冇符合條件嘅課程</EmptyRow>}
          {courses.map((c) => (
            <tr key={c.id}>
              <td>
                <Link href={`/admin/courses/${c.id}`} className="font-semibold text-brand-700 hover:underline">
                  {c.title}
                </Link>
              </td>
              <td>
                <div className="flex flex-wrap gap-1">
                  <Badge tone="brand">{AGE_GROUP_LABELS[c.age_group]}</Badge>
                  <LevelBadge level={c.level} />
                </div>
              </td>
              <td className="whitespace-nowrap">
                {formatHKD(c.price)} / {c.sessions_count} 堂
              </td>
              <td className="whitespace-nowrap text-ink-muted">
                <Link href="/admin/classes" className="hover:text-brand-700">
                  進行中 {c.activeClasses} · 共 {c.totalClasses}
                </Link>
              </td>
              <td>{c.is_active ? <Badge tone="success">上架</Badge> : <Badge>下架</Badge>}</td>
              <td>
                <div className="flex justify-end gap-2">
                  <ButtonLink href={`/admin/courses/${c.id}/overview`} size="sm" variant="secondary">
                    睇班況
                  </ButtonLink>
                  <ButtonLink href={`/admin/classes/new?course=${c.id}`} size="sm" variant="secondary">
                    開班
                  </ButtonLink>
                  <ConfirmButton
                    variant="ghost"
                    confirmText={c.is_active ? `下架「${c.title}」？前台會即時睇唔到同報唔到。` : undefined}
                    action={toggleCourseActive.bind(null, c.id, !c.is_active)}
                  >
                    {c.is_active ? "下架" : "上架"}
                  </ConfirmButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </>
  );
}
