import { CourseCard } from "@/components/courses/CourseCard";
import { Container } from "@/components/ui/Container";
import type { CourseWithClasses } from "@/lib/data/courses";
import { SectionHeading } from "./SectionHeading";

/** 熱門課程：按報名比例（已佔名額 / 總名額）揀頭 3 個 */
export function FeaturedCourses({ courses }: { courses: CourseWithClasses[] }) {
  const demand = (c: CourseWithClasses) => {
    const capacity = c.classes.reduce((s, cls) => s + cls.capacity, 0);
    const taken = c.classes.reduce((s, cls) => s + (cls.capacity - cls.remaining), 0);
    return capacity ? taken / capacity : 0;
  };
  const featured = [...courses].sort((a, b) => demand(b) - demand(a)).slice(0, 3);
  if (featured.length === 0) return null;

  return (
    <section>
      <Container className="py-16 sm:py-20">
        <SectionHeading eyebrow="熱門課程" title="家長最常報嘅班" href="/courses" linkLabel="睇全部課程" />
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((course) => (
            <li key={course.id}>
              <CourseCard course={course} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
