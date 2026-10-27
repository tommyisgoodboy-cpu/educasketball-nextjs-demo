"use client";

import Image from "next/image";
import { DEMO_SHOP_IMAGES, imgSrc } from "@/lib/demoShop";

/** 揀示範相（可多選）；表單用 name 提交，或者用 onToggle 控制 */
export function SampleImagePicker({
  name,
  selected,
  onToggle,
  max = 8,
}: {
  name?: string;
  selected?: string[];
  onToggle?: (src: string) => void;
  max?: number;
}) {
  return (
    <ul className="grid grid-cols-5 gap-2 sm:grid-cols-7">
      {DEMO_SHOP_IMAGES.map((src) => {
        const on = selected?.includes(src);
        return (
          <li key={src}>
            <label className="relative block aspect-square cursor-pointer overflow-hidden rounded-lg border border-surface-border bg-surface-muted has-[:checked]:ring-2 has-[:checked]:ring-brand-600">
              {onToggle ? (
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={!!on}
                  onChange={() => onToggle(src)}
                  disabled={!on && (selected?.length ?? 0) >= max}
                />
              ) : (
                <input
                  type="checkbox"
                  className="sr-only"
                  name={name}
                  value={src}
                />
              )}
              <Image
                src={imgSrc(src)}
                alt="示範相"
                fill
                sizes="80px"
                className="object-cover"
              />
            </label>
          </li>
        );
      })}
    </ul>
  );
}
