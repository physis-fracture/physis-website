"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from "../constants/upload";

const ACCEPT = ".png,.jpg,.jpeg,.tif,.tiff,.bmp,.webp,.gif";

function formatSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ImageDropzone({
  id,
  file,
  disabled = false,
  onFileChange,
}: {
  id: string;
  file: File | null;
  disabled?: boolean;
  onFileChange: (file: File | null) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const dragDepthRef = useRef(0);

  const objectUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  const acceptFile = (candidate?: File | null) => {
    if (!candidate) {
      return;
    }
    if (!ALLOWED_MIME_TYPES.includes(candidate.type as (typeof ALLOWED_MIME_TYPES)[number])) {
      toast.error(`${candidate.name} uses an unsupported format.`);
      return;
    }
    if (candidate.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`${candidate.name} exceeds the 32 MB limit.`);
      return;
    }
    onFileChange(candidate);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (disabled) {
      return;
    }
    dragDepthRef.current += 1;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    dragDepthRef.current -= 1;
    if (dragDepthRef.current <= 0) {
      dragDepthRef.current = 0;
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    dragDepthRef.current = 0;
    setIsDragging(false);
    if (disabled) {
      return;
    }
    acceptFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <Input
        id={id}
        type="file"
        accept={ACCEPT}
        className="sr-only peer"
        disabled={disabled}
        onChange={(e) => {
          acceptFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <label
        htmlFor={id}
        onDragEnter={handleDragEnter}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-6 text-center transition-colors",
          isDragging && "border-primary bg-primary/5",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-ring/50",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        {file ? (
          <div className="flex w-full items-center gap-4 text-left">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={objectUrl ?? undefined}
              alt={`Preview of ${file.name}`}
              className="h-20 w-20 shrink-0 rounded-md border object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatSize(file.size)}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <ImagePlus className="size-6 text-muted-foreground" />
            <p className="text-sm font-medium">
              Drag &amp; drop image or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, TIFF, BMP, WEBP, GIF · max 32 MB
            </p>
          </div>
        )}
      </label>
      {file && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="self-start"
          disabled={disabled}
          onClick={() => onFileChange(null)}
        >
          <X data-icon="inline-start" />
          Remove
        </Button>
      )}
    </div>
  );
}

export { ImageDropzone };
