"use client";

import { useState } from "react";
import { Select } from "@/components/ui/Form";

export type CourseOpt = { id: string; title: string };
export type ClassOpt = { id: string; courseId: string; label: string };

/** 兩層選單：先揀課程（主選單），再揀班次（子選單，只列該課程嘅班）。表單送出 course / class 兩個參數 */
export function ClassCascadeSelect({ courses, classes, defaultCourse, defaultClass }: { courses: CourseOpt[]; classes: ClassOpt[]; defaultCourse?: string; defaultClass?: string }) {
  // 如果只指定咗班次（例如舊連結），由班次反推課程
  const initialCourse = defaultCourse ?? classes.find((c) => c.id === defaultClass)?.courseId ?? "";
  const [course, setCourse] = useState(initialCourse);
  const [cls, setCls] = useState(defaultClass ?? "");
  const subs = classes.filter((c) => !course || c.courseId === course);

  return (
    <>
      <Select
        name="course"
        value={course}
        aria-label="課程（主選單）"
        onChange={(e) => {
          setCourse(e.target.value);
          setCls(""); // 轉課程就重置班次
        }}
      >
        <option value="">全部課程</option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}（{classes.filter((x) => x.courseId === c.id).length} 班）
          </option>
        ))}
      </Select>
      <Select name="class" value={cls} onChange={(e) => setCls(e.target.value)} disabled={!course} aria-label="班次（子選單）">
        <option value="">{course ? `該課程全部班次（${subs.length}）` : "先揀課程"}</option>
        {subs.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </Select>
    </>
  );
}
