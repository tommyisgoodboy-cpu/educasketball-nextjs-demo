import type { Metadata } from "next";
import { Suspense } from "react";
import { CourseCard } from "@/components/courses/CourseCard";
import { CourseFilters } from "@/components/courses/CourseFilters";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/ui/Container";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { AGE_GROUP_LABELS, SKILL_LEVEL_LABELS } from "@/lib/constants";
import { getCourses, getDistricts, type CourseFilters as Filters } from "@/lib/data/courses";
import type { AgeGroup, SkillLevel } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "課程及報名",
  description: "幼兒、小學、中學及成人籃球課程，按年齡、技術等級同地區揀啱嘅班。",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const pick = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

function parseFilters(sp: Awaited<SearchParams>, districts: string[]): Filters {
  const age = pick(sp.age);
  const level = pick(sp.level);
  const district = pick(sp.district);
  return {
    age: age && age in AGE_GROUP_LABELS ? (age as AgeGroup) : undefined,
    level: level && level in SKILL_LEVEL_LABELS ? (level as SkillLevel) : undefined,
    district: district && districts.includes(district) ? district : undefined,
  };
}

export default async function CoursesPage({ searchParams }: { searchParams: SearchParams }) {
  const districts = await getDistricts();
  const filters = parseFilters(await searchParams, districts);
  const courses = await getCourses(filters);

  return (
    <>
      <PageHeader
        eyebrow="課程及報名"
        title="揀一個適合嘅班"
        description="按年齡同能力分級，每期設技術評核。唔肯定揀邊級？WhatsApp 我哋，教練會幫你建議。"
      />

      <Container className="space-y-8 py-10">
        <div className="rounded-card border border-surface-border bg-white p-5 shadow-card">
          <Suspense>
            <CourseFilters districts={districts} />
          </Suspense>
        </div>

        <p className="text-sm text-ink-muted" aria-live="polite">
          共 {courses.length} 個課程
        </p>

        {courses.length > 0 ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <li key={course.id}>
                <CourseCard course={course} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-card border border-dashed border-surface-border bg-white px-6 py-12 text-center">
            <p className="font-semibold text-ink">暫時冇符合條件嘅課程</p>
            <p className="text-sm text-ink-muted">試吓改篩選條件，或者直接問我哋有冇合適嘅班。</p>
            <WhatsAppButton />
          </div>
        )}
      </Container>
    </>
  );
}
