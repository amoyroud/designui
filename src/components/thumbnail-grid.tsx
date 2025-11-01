import Image from "next/image";
import { cn } from "@/lib/utils";
import type { InspirationKind } from "@/types/aesthetic";

export type ThumbnailItem = {
  id: string;
  kind: InspirationKind;
  name: string;
  previewUrl?: string;
  sizeLabel?: string;
  status?: "pending" | "analyzed" | "failed";
  href?: string;
};

type ThumbnailGridProps = {
  items: ThumbnailItem[];
  onRemove?: (id: string) => void;
};

export function ThumbnailGrid({ items, onRemove }: ThumbnailGridProps) {
  if (!items.length) {
    return (
      <div className="surface-card border-2 border-dashed p-12 text-center">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full border-2 border-[#C5BEAF] opacity-30" />
        <p className="text-sm text-muted">
          Uploaded imagery will appear here as a geometric grid once added.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <figure
          key={item.id}
          className="group relative overflow-hidden border-2 border-[#C5BEAF] bg-white transition-all duration-200 hover:-translate-y-[3px]"
        >
          <div className="relative aspect-[4/5] w-full overflow-hidden">
            {item.kind === "image" && item.previewUrl ? (
              <Image
                src={item.previewUrl}
                alt={item.name}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 240px, (min-width: 640px) 45vw, 90vw"
                placeholder="empty"
                unoptimized
              />
            ) : (
              <div className="surface-green flex h-full w-full flex-col justify-between p-6 text-left">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-white opacity-60" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/80">
                    URL Inspiration
                  </span>
                </div>
                <div className="space-y-3">
                  <p className="text-base font-bold uppercase tracking-wide text-white">
                    {item.name}
                  </p>
                  {item.href ? (
                    <p className="break-words text-[10px] leading-relaxed text-white/70">
                      {item.href}
                    </p>
                  ) : null}
                </div>
              </div>
            )}
            {/* Dot matrix overlay on hover */}
            <div className="absolute inset-0 dot-matrix opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
          </div>

          <figcaption className="flex items-center justify-between gap-3 border-t-2 border-[#E0DCD5] bg-white px-4 py-3 text-xs">
            <span className="truncate text-[10px] font-bold uppercase tracking-[0.15em] text-[#0D1E3C]">
              {item.name}
            </span>
            <span className="flex items-center gap-2">
              {item.status ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                    item.status === "analyzed" &&
                      "border-[#1A4D2E] bg-[#1A4D2E] text-white",
                    item.status === "pending" &&
                      "border-[#8A9BAA] bg-transparent text-[#5A6B8A]",
                    item.status === "failed" && "border-red-600 bg-red-600 text-white",
                  )}
                >
                  {item.status === "analyzed" && "✓"}
                  {item.status === "pending" && "○"}
                  {item.status === "failed" && "×"}
                </span>
              ) : null}
              {item.sizeLabel ? (
                <span className="text-[9px] font-medium text-muted">{item.sizeLabel}</span>
              ) : null}
            </span>
          </figcaption>

          {onRemove ? (
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="geometric-circle absolute right-3 top-3 flex h-10 w-10 items-center justify-center border-white bg-[#2A4A8A] text-lg font-bold text-white opacity-0 transition-all duration-200 hover:scale-110 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4A6FA5]"
              aria-label={`Remove ${item.name}`}
            >
              ×
            </button>
          ) : null}
        </figure>
      ))}
    </div>
  );
}

