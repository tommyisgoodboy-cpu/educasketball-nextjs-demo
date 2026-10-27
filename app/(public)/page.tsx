import { CoachesPreview } from "@/components/home/CoachesPreview";
import { CtaBand } from "@/components/home/CtaBand";
import { FeaturedCourses } from "@/components/home/FeaturedCourses";
import { Features } from "@/components/home/Features";
import { Hero } from "@/components/home/Hero";
import { LevelSystem } from "@/components/home/LevelSystem";
import { Testimonials } from "@/components/home/Testimonials";
import { getCoaches } from "@/lib/data/coaches";
import { getCourses } from "@/lib/data/courses";

export default async function HomePage() {
  const [courses, coaches] = await Promise.all([getCourses(), getCoaches()]);

  return (
    <>
      <Hero />
      <LevelSystem />
      <FeaturedCourses courses={courses} />
      <Features />
      <CoachesPreview coaches={coaches} />
      <Testimonials />
      <CtaBand />
    </>
  );
}
