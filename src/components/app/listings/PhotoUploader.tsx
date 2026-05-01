"use client";

import { useCallback, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/heic", "image/heif"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const DEFAULT_MAX_PHOTOS = 8;

interface PhotoState {
  id: string;
  file: File;
  previewUrl: string;
  status: "uploading" | "uploaded" | "error";
  publicUrl?: string;
  error?: string;
}

interface PhotoUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxPhotos?: number;
}

export function PhotoUploader({
  value,
  onChange,
  maxPhotos = DEFAULT_MAX_PHOTOS,
}: PhotoUploaderProps) {
  const [photos, setPhotos] = useState<PhotoState[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const draggingIndexRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File, photoId: string) => {
      try {
        const signResponse = await fetch("/api/listings/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            contentLength: file.size,
          }),
        });

        if (!signResponse.ok) {
          const errorData = (await signResponse.json()) as { error?: string };
          const message = errorData.error ?? "Upload failed";

          if (signResponse.status === 500 && message === "Image storage not configured") {
            setStorageError("Image storage is not configured. Please contact support.");
          }

          setPhotos((prev) =>
            prev.map((p) =>
              p.id === photoId ? { ...p, status: "error", error: message } : p,
            ),
          );
          return;
        }

        const { uploadUrl, publicUrl } = (await signResponse.json()) as {
          uploadUrl: string;
          publicUrl: string;
          key: string;
        };

        setStorageError(null);

        const putResponse = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });

        if (!putResponse.ok) {
          setPhotos((prev) =>
            prev.map((p) =>
              p.id === photoId
                ? { ...p, status: "error", error: "Upload to storage failed" }
                : p,
            ),
          );
          return;
        }

        setPhotos((prev) => {
          const updated = prev.map((p) =>
            p.id === photoId ? { ...p, status: "uploaded" as const, publicUrl } : p,
          );
          const uploadedUrls = updated
            .filter((p) => p.status === "uploaded" && p.publicUrl)
            .map((p) => p.publicUrl!);
          onChange(uploadedUrls);
          return updated;
        });
      } catch {
        setPhotos((prev) =>
          prev.map((p) =>
            p.id === photoId
              ? { ...p, status: "error", error: "Network error during upload" }
              : p,
          ),
        );
      }
    },
    [onChange],
  );

  const processFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remaining = maxPhotos - photos.length;

      if (remaining <= 0) return;

      const toProcess = fileArray.slice(0, remaining);

      const newPhotos: PhotoState[] = toProcess
        .filter((file) => {
          if (!ACCEPTED_TYPES.includes(file.type)) return false;
          if (file.size > MAX_FILE_SIZE) return false;
          return true;
        })
        .map((file) => ({
          id: crypto.randomUUID(),
          file,
          previewUrl: URL.createObjectURL(file),
          status: "uploading" as const,
        }));

      if (newPhotos.length === 0) return;

      setPhotos((prev) => [...prev, ...newPhotos]);

      for (const photo of newPhotos) {
        void uploadFile(photo.file, photo.id);
      }
    },
    [photos.length, maxPhotos, uploadFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        processFiles(e.target.files);
      }
      e.target.value = "";
    },
    [processFiles],
  );

  const handleDelete = useCallback(
    (photoId: string) => {
      setPhotos((prev) => {
        const updated = prev.filter((p) => p.id !== photoId);
        const uploadedUrls = updated
          .filter((p) => p.status === "uploaded" && p.publicUrl)
          .map((p) => p.publicUrl!);
        onChange(uploadedUrls);
        return updated;
      });
    },
    [onChange],
  );

  const handlePreviewDragStart = useCallback((index: number) => {
    draggingIndexRef.current = index;
  }, []);

  const handlePreviewDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      setDragOverIndex(index);
    },
    [],
  );

  const handlePreviewDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      const dragIndex = draggingIndexRef.current;
      if (dragIndex === null || dragIndex === dropIndex) {
        setDragOverIndex(null);
        return;
      }

      setPhotos((prev) => {
        const reordered = [...prev];
        const [moved] = reordered.splice(dragIndex, 1);
        reordered.splice(dropIndex, 0, moved);
        const uploadedUrls = reordered
          .filter((p) => p.status === "uploaded" && p.publicUrl)
          .map((p) => p.publicUrl!);
        onChange(uploadedUrls);
        return reordered;
      });

      draggingIndexRef.current = null;
      setDragOverIndex(null);
    },
    [onChange],
  );

  const handlePreviewDragEnd = useCallback(() => {
    draggingIndexRef.current = null;
    setDragOverIndex(null);
  }, []);

  const canAddMore = photos.length < maxPhotos;

  return (
    <div className="flex flex-col gap-4">
      {storageError && (
        <div className="rounded-lg border border-[#b42318]/30 bg-[#b42318]/10 px-4 py-3 text-sm text-[#b42318]">
          {storageError}
        </div>
      )}

      {canAddMore && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload photos"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              fileInputRef.current?.click();
            }
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition",
            isDragging
              ? "border-[var(--accent)] bg-[var(--accent)]/5"
              : "border-[var(--border)] hover:border-[var(--accent)]/50 hover:bg-[var(--panel-muted)]",
          )}
        >
          <UploadIcon className="h-8 w-8 text-[var(--accent)]" />
          <p className="text-sm font-medium text-[var(--foreground)]">
            Drag &amp; drop photos here, or click to select
          </p>
          <p className="text-xs text-[var(--foreground)]/50">
            JPG, PNG, HEIC — up to 10 MB each &middot; {photos.length}/{maxPhotos} photos
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            multiple
            className="sr-only"
            onChange={handleFileInput}
          />
        </div>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              draggable
              onDragStart={() => handlePreviewDragStart(index)}
              onDragOver={(e) => handlePreviewDragOver(e, index)}
              onDrop={(e) => handlePreviewDrop(e, index)}
              onDragEnd={handlePreviewDragEnd}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-lg border transition",
                dragOverIndex === index
                  ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/30"
                  : "border-[var(--border)]",
                photo.status === "error" && "border-[#b42318]/50",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.previewUrl}
                alt={`Photo ${index + 1}`}
                className="h-full w-full object-cover"
              />

              {/* Status overlay */}
              {photo.status === "uploading" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <SpinnerIcon className="h-6 w-6 animate-spin text-white" />
                </div>
              )}

              {photo.status === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60 p-2">
                  <ErrorIcon className="h-5 w-5 text-[#f87171]" />
                  <p className="text-center text-xs text-[#f87171]">
                    {photo.error ?? "Upload failed"}
                  </p>
                </div>
              )}

              {/* Delete button */}
              {photo.status !== "uploading" && (
                <button
                  type="button"
                  onClick={() => handleDelete(photo.id)}
                  aria-label="Remove photo"
                  className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition hover:bg-black/80 group-hover:opacity-100"
                >
                  <CloseIcon className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Drag handle indicator */}
              <div className="absolute bottom-1.5 left-1.5 opacity-0 transition group-hover:opacity-100">
                <DragIcon className="h-4 w-4 text-white drop-shadow" />
              </div>
            </div>
          ))}
        </div>
      )}

      {value.length > 0 && (
        <p className="text-xs text-[var(--foreground)]/50">
          {value.length} photo{value.length !== 1 ? "s" : ""} ready
        </p>
      )}
    </div>
  );
}

// ── Inline icon components ────────────────────────────────────────────────────

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function DragIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="18" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="18" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
