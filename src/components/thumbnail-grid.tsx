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
      <div className="rounded-[24px] border border-dashed border-[rgba(47,47,47,0.08)] bg-white/30 p-10 text-center text-sm text-muted">
        Uploaded imagery will appear here as a tidy grid once added.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <figure
          key={item.id}
          className="group relative overflow-hidden rounded-3xl border border-[rgba(47,47,47,0.07)] bg-white/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)] transition-transform duration-150 hover:-translate-y-1 hover:shadow-xl"
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
              <div className="flex h-full w-full flex-col justify-between bg-[radial-gradient(circle_at_top,_rgba(250,247,242,1)_0%,_rgba(240,236,230,1)_100%)] p-6 text-left">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[rgba(92,92,92,0.8)]">
                  URL Inspiration
                </span>
                <div className="space-y-2">
                  <p className="text-base font-medium text-[rgba(47,47,47,0.9)]">{item.name}</p>
                  {item.href ? (
                    <p className="break-words text-xs text-[rgba(92,92,92,0.85)]">{item.href}</p>
                  ) : null}
                </div>
              </div>
            )}
          </div>
          <figcaption className="flex items-center justify-between gap-3 px-4 py-3 text-xs text-muted">
            <span className="truncate font-medium text-[rgba(47,47,47,0.8)]">
              {item.name}
            </span>
            <span className="flex items-center gap-2">
              {item.status ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.12em]",
                    item.status === "analyzed" && "bg-[rgba(138,126,106,0.12)] text-[rgba(138,126,106,1)]",
                    item.status === "pending" && "bg-[rgba(92,92,92,0.12)] text-[rgba(92,92,92,0.9)]",
                    item.status === "failed" && "bg-[rgba(200,80,80,0.12)] text-[rgba(150,40,40,1)]",
                  )}
                >
                  {item.status}
                </span>
              ) : null}
              {item.sizeLabel ? <span>{item.sizeLabel}</span> : null}
            </span>
          </figcaption>
          {onRemove ? (
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-[rgba(47,47,47,0.7)] opacity-0 transition-opacity duration-150 hover:bg-white group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[rgba(138,126,106,0.7)]"
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

