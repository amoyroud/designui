"use client";

import type { ChangeEvent, DragEvent } from "react";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type DropzoneProps = {
  onFilesSelected?: (files: File[]) => void;
  disabled?: boolean;
  isAnalyzing?: boolean;
};

export function Dropzone({ onFilesSelected, disabled, isAnalyzing }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const emitFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || !onFilesSelected) {
        return;
      }

      const files = Array.from(fileList).filter((file) =>
        file.type.startsWith("image/"),
      );

      if (files.length) {
        onFilesSelected(files);
      }
    },
    [onFilesSelected],
  );

  const handleClick = useCallback(() => {
    if (disabled) {
      return;
    }

    inputRef.current?.click();
  }, [disabled]);

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (disabled) {
      return;
    }

    setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (disabled) {
        return;
      }

      setIsDragging(false);
      emitFiles(event.dataTransfer?.files ?? null);
    },
    [disabled, emitFiles],
  );

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      emitFiles(event.target.files);
      // Reset value so selecting the same file again still triggers change.
      event.target.value = "";
    },
    [emitFiles],
  );

  return (
    <div className="relative">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={handleDragLeave}
        className={cn(
          "surface-card transition-all duration-200 ease-out",
          "flex cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed border-transparent",
          "px-10 py-16 text-center",
          "bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.55)_0%,_rgba(240,236,230,0.9)_100%)]",
          "hover:shadow-xl",
          (isDragging || isAnalyzing) && "border-[rgba(138,126,106,0.35)]",
          disabled && "cursor-not-allowed opacity-60",
        )}
        role="button"
        tabIndex={0}
        aria-disabled={disabled || undefined}
        aria-label="Upload inspirational imagery"
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          className="mb-6 text-[rgba(47,47,47,0.6)]"
          aria-hidden="true"
        >
          <path
            d="M24 8v20m0-20 8 8m-8-8-8 8M12 32h24a4 4 0 0 1 0 8H12a4 4 0 0 1 0-8Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="space-y-2">
          <p className="text-lg font-medium tracking-tight">Drop your inspiration here</p>
          <p className="text-sm text-muted">
            Drag & drop brand assets, screenshots, or photos. You can also browse files from your
            device and paste inspiration URLs below.
          </p>
        </div>
        <div className="mt-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(138,126,106,0.12)] px-5 py-2 text-sm text-[rgba(138,126,106,1)]">
            <span>＋</span>
            Select images
          </span>
        </div>
        {isAnalyzing ? (
          <p className="mt-4 text-sm text-muted">Analyzing your aesthetic…</p>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleInputChange}
        tabIndex={-1}
      />
    </div>
  );
}

