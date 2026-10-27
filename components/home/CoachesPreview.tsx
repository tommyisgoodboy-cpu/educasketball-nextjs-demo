import { CoachAvatar } from "@/components/coaches/CoachCard";
import { Container } from "@/components/ui/Container";
import type { CoachWithCourses } from "@/lib/data/coaches";
import { SectionHeading } from "./SectionHeading";

export function CoachesPreview({ coaches }: { coaches: CoachWithCourses[] }) {
  if (coaches.length === 0) return null;
  return (
    <section>
      <Container className="py-16 sm:py-20">
        <SectionHeading eyebrow="教練團隊" title="持牌教練，統一教學大綱" href="/coaches" linkLabel="認識教練" />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {coaches.map((coach, i) => (
            <li key={coach.id} className="flex items-center gap-4 rounded-card border border-surface-border bg-white p-4 shadow-card">
              <CoachAvatar name={coach.name} photoUrl={coach.photo_url} index={i} size="md" />
              <div className="min-w-0">
                <p className="font-bold text-ink">{coach.name} 教練</p>
                <p className="truncate text-sm text-ink-muted">{coach.certifications[0]}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
