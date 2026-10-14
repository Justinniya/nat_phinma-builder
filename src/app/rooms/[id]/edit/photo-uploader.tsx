"use client";

import { ImagePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PHOTO_BUCKET } from "@/lib/room-photos";

// Phone cameras take 3–10 MB photos. We shrink each one in the browser
// (longest side 1600px, JPEG) before uploading, so uploads are fast on
// mobile data and stay under the bucket's 5 MB limit.
const MAX_SIDE = 1600;

async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not read photo"))), "image/jpeg", 0.8),
  );
}

export function PhotoUploader({ folder }: { folder: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function upload(files: FileList) {
    setError(null);
    // Uploads go straight from the browser to Supabase Storage. The
    // storage security rules check that this room belongs to whoever is
    // logged in — nobody can upload into someone else's room.
    const supabase = createClient();
    const list = Array.from(files);
    try {
      for (const [i, file] of list.entries()) {
        setStatus(`Uploading ${i + 1} of ${list.length}…`);
        const blob = await shrink(file);
        const path = `${folder}/${Date.now()}-${i}.jpg`;
        const { error } = await supabase.storage
          .from(PHOTO_BUCKET)
          .upload(path, blob, { contentType: "image/jpeg" });
        if (error) throw error;
      }
      router.refresh();
    } catch (e) {
      setError(
        e instanceof Error && e.message !== "Could not read photo"
          ? e.message
          : "Couldn't read that photo. Try a JPEG or PNG photo.",
      );
    } finally {
      setStatus(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius)] border-2 border-dashed border-input p-6 text-center transition-colors hover:bg-secondary ${status ? "pointer-events-none opacity-60" : ""}`}
      >
        <ImagePlus className="h-8 w-8 text-primary" aria-hidden />
        <span className="font-medium">{status ?? "Add photos"}</span>
        <span className="text-sm text-muted-foreground">Tap to take or choose photos. You can pick several.</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          disabled={Boolean(status)}
          onChange={(e) => e.target.files?.length && upload(e.target.files)}
        />
      </label>
      {error && (
        <p className="rounded-[var(--radius)] bg-red-500/15 p-3 text-sm text-red-700 dark:text-red-300">{error}</p>
      )}
    </div>
  );
}
