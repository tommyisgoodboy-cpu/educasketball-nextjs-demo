"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { StudentForm } from "./StudentForm";

export function AddStudent({ startOpen = false }: { startOpen?: boolean }) {
  const [open, setOpen] = useState(startOpen);

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        ＋ 新增學員
      </Button>
    );
  }
  return (
    <Card>
      <CardBody className="space-y-4">
        <h2 className="text-lg font-bold text-ink">新增學員</h2>
        <StudentForm onDone={() => setOpen(false)} />
      </CardBody>
    </Card>
  );
}
