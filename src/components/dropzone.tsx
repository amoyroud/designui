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
          "relative overflow-hidden border-2 border-dashed border-[#C5BEAF] transition-all duration-200",
          "flex cursor-pointer flex-col gap-5 bg-white px-12 py-14 text-left",
          "hover:-translate-y-[2px] hover:border-[#2A4A8A]",
          isDragging && "border-[#4A6FA5] bg-[#F5F2ED]",
          disabled && "cursor-not-allowed opacity-50",
        )}
        role="button"
        tabIndex={0}
        aria-disabled={disabled || undefined}
        aria-label="Upload inspirational imagery"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(197,190,175,0.18) 1px, transparent 1px), linear-gradient(0deg, rgba(197,190,175,0.18) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        <div className="relative z-10 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#0D1E3C]">
            Upload inspiration imagery
          </p>
          <p className="max-w-xl text-sm leading-relaxed text-muted">
            Drag & drop brand assets, product shots, or mood imagery. We’ll analyse palette, typography, and texture to map the aesthetic DNA.
          </p>
        </div>

        <button
          type="button"
          className="relative z-10 inline-flex items-center border-2 border-[#2A4A8A] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[#2A4A8A] transition-all duration-200 hover:-translate-y-[2px] hover:bg-[#2A4A8A] hover:text-white focus:outline-none"
          onClick={handleClick}
          disabled={disabled}
        >
          Select Images
        </button>

        {isAnalyzing ? (
          <div className="relative z-10 mt-6 flex items-center gap-3">
            <div className="h-2 w-2 animate-pulse rounded-full bg-[#2A4A8A]" />
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
              Analyzing your aesthetic…
            </p>
          </div>
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

