"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload, ImageIcon, Camera } from "lucide-react";

interface UploadZoneProps {
  onImage: (dataUrl: string) => void;
}

export function UploadZone({ onImage }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const read = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) read(file);
      }}
      className={`relative rounded-2xl border transition-all ${
        dragging
          ? "border-pacific-light/80 bg-pacific-light/5"
          : "border-white/15 bg-white/[.02]"
      }`}
    >
      <div className="px-8 py-14 md:py-20 flex flex-col items-center text-center gap-5">
        <div className="w-16 h-16 rounded-full bg-pacific-light/10 ring-1 ring-white/10 flex items-center justify-center">
          <Upload className="w-6 h-6 text-pacific-light/90" strokeWidth={1.5} />
        </div>
        <div>
          <div className="text-pacific-light text-xl md:text-2xl font-light tracking-tight">
            Upload a photo of your space
          </div>
          <div className="text-pacific-mid text-sm mt-2 max-w-md">
            JPG or PNG · shot from eye level · keep countertops unobstructed for the
            cleanest result
          </div>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <motion.button
            onClick={() => inputRef.current?.click()}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 bg-pacific-light text-pacific-dark px-5 py-2.5 rounded-full text-sm tracking-tight font-medium hover:bg-white transition-colors"
          >
            <ImageIcon className="w-4 h-4" />
            Choose file
          </motion.button>
          <motion.button
            onClick={() => inputRef.current?.click()}
            whileTap={{ scale: 0.97 }}
            className="hidden md:inline-flex items-center gap-2 text-pacific-light/90 border border-white/15 px-5 py-2.5 rounded-full text-sm tracking-tight hover:border-white/40 transition-colors"
          >
            <Camera className="w-4 h-4" />
            Use camera
          </motion.button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) read(file);
          }}
        />
      </div>

      {dragging && (
        <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-pacific-light/60 flex items-center justify-center pointer-events-none">
          <span className="text-pacific-light tracking-[.22em] uppercase text-xs">
            Drop to upload
          </span>
        </div>
      )}
    </div>
  );
}
