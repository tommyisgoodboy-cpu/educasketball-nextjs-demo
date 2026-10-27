import Image from "next/image";
import { imgSrc } from "@/lib/demoShop";
import type { ProductCategory } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

// 未有商品相時按類別顯示圖示
const ICONS: Record<ProductCategory, string> = {
  jersey: "M8 3 4 6l2 4 2-1v12h8V9l2 1 2-4-4-3h-2a2 2 0 0 1-4 0H8Z",
  shorts: "M5 4h14l1 15h-6l-2-7-2 7H4L5 4Z",
  ball: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 0v18M3 12h18M5.6 5.6c3 2.6 3 10.2 0 12.8M18.4 5.6c-3 2.6-3 10.2 0 12.8",
  training: "M6 4v16M18 4v16M6 8h12M6 12h12M6 16h12",
};

export function ProductImage({
  src,
  alt,
  category,
  className,
  sizes = "(min-width: 1024px) 33vw, 100vw",
}: {
  src: string | null;
  alt: string;
  category: ProductCategory;
  className?: string;
  sizes?: string;
}) {
  return (
    <div
      className={cn(
        "relative aspect-square overflow-hidden bg-gradient-to-br from-brand-50 to-aqua-100",
        className,
      )}
    >
      {src ? (
        <Image
          src={imgSrc(src)}
          alt={alt}
          fill
          sizes={sizes}
          className="object-cover"
        />
      ) : (
        <svg
          viewBox="0 0 24 24"
          className="absolute inset-0 m-auto h-1/3 w-1/3 text-brand-300"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d={ICONS[category]} />
        </svg>
      )}
    </div>
  );
}
