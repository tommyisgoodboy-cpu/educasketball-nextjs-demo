"use client";

import { useActionState, useEffect, useState } from "react";
import { deleteVenue, saveVenue, type VenueFormState } from "@/app/(admin)/admin/venues/actions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Form";
import type { Venue } from "@/lib/supabase/types";
import { ConfirmButton } from "./ConfirmButton";

function VenueForm({ venue, onDone }: { venue?: Venue; onDone: () => void }) {
  const [state, action, pending] = useActionState<VenueFormState, FormData>(saveVenue, { status: "idle" });
  const err = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  useEffect(() => {
    if (state.status === "saved") onDone();
  }, [state, onDone]);

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2" noValidate>
      {venue && <input type="hidden" name="id" value={venue.id} />}
      {state.status === "error" && !state.fieldErrors && (
        <p role="alert" className="text-sm text-red-600 sm:col-span-2">
          {state.message}
        </p>
      )}
      <Field label="場地名稱" required error={err.name}>
        {(p) => <Input {...p} name="name" defaultValue={venue?.name} />}
      </Field>
      <Field label="地區" required error={err.district} hint="課程篩選會用到">
        {(p) => <Input {...p} name="district" defaultValue={venue?.district} placeholder="例如：元朗" />}
      </Field>
      <Field label="地址" required error={err.address} className="sm:col-span-2">
        {(p) => <Input {...p} name="address" defaultValue={venue?.address} />}
      </Field>
      <Field label="地圖連結" error={err.map_url} className="sm:col-span-2" hint="選填，例如 Google Maps 分享連結">
        {(p) => <Input {...p} name="map_url" type="url" defaultValue={venue?.map_url ?? ""} placeholder="https://" />}
      </Field>
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "儲存中…" : "儲存"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          取消
        </Button>
      </div>
    </form>
  );
}

export function VenueCard({ venue, classCount, activeClassCount }: { venue: Venue; classCount: number; activeClassCount: number }) {
  const [editing, setEditing] = useState(false);
  return (
    <Card>
      <CardBody>
        {editing ? (
          <VenueForm venue={venue} onDone={() => setEditing(false)} />
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-ink">{venue.name}</h3>
                <Badge tone="brand">{venue.district}</Badge>
              </div>
              <p className="mt-1 text-sm text-ink-muted">{venue.address}</p>
              <p className="mt-1 text-xs text-ink-subtle">
                進行中班次 {activeClassCount} · 歷來 {classCount}
                {venue.map_url && (
                  <>
                    {" · "}
                    <a href={venue.map_url} target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:underline">
                      地圖
                    </a>
                  </>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
                修改
              </Button>
              {classCount === 0 && (
                <ConfirmButton variant="ghost" confirmText={`刪除場地「${venue.name}」？`} action={deleteVenue.bind(null, venue.id)}>
                  刪除
                </ConfirmButton>
              )}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export function AddVenue() {
  const [open, setOpen] = useState(false);
  if (!open) return <Button onClick={() => setOpen(true)}>＋ 新增場地</Button>;
  return (
    <Card>
      <CardBody className="space-y-4">
        <h2 className="text-lg font-bold">新增場地</h2>
        <VenueForm onDone={() => setOpen(false)} />
      </CardBody>
    </Card>
  );
}
