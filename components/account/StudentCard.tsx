"use client";

import { useState, useTransition } from "react";
import { deleteStudent } from "@/app/(account)/account/students/actions";
import { BadgeList } from "@/components/badges/BadgeList";
import { Badge, LevelBadge } from "@/components/ui/Badge";
import type { StudentBadge } from "@/lib/data/badges";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import type { Student } from "@/lib/supabase/types";
import { StudentForm } from "./StudentForm";

export function StudentCard({ student, courses, badges }: { student: Student; courses: string[]; badges: StudentBadge[] }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const age = new Date().getFullYear() - student.birth_year;

  function onDelete() {
    if (!confirm(`確定刪除學員「${student.name}」？`)) return;
    startTransition(async () => {
      const result = await deleteStudent(student.id);
      setError(result.error);
    });
  }

  return (
    <Card>
      <CardBody className="space-y-4">
        {editing ? (
          <StudentForm student={student} onDone={() => setEditing(false)} />
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-ink">{student.name}</h3>
                <p className="text-sm text-ink-muted">
                  {student.birth_year} 年出生（約 {age} 歲）· 球齡 {student.years_playing === 0 ? "少於 1 年" : `${student.years_playing} 年`}
                </p>
              </div>
              <LevelBadge level={student.level} />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-ink-subtle">技術徽章</p>
              <BadgeList badges={badges} />
            </div>
            {courses.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {courses.map((c) => (
                  <Badge key={c} tone="brand">
                    {c}
                  </Badge>
                ))}
              </div>
            )}
            {student.notes && <p className="rounded-lg bg-surface-muted p-3 text-sm text-ink-muted">備註：{student.notes}</p>}
            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
                修改資料
              </Button>
              <Button size="sm" variant="ghost" onClick={onDelete} disabled={pending} className="text-red-600 hover:bg-red-50">
                刪除
              </Button>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}
