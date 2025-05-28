"use client";
import React, { useRef } from "react";
import { useVideoStore } from "../lib/videoStore";
import { Input } from "./ui/input";
import { cn } from "../lib/utils";

interface UploadFormProps {
  onFileSelect: (file: File | null) => void;
}

const UploadForm: React.FC<UploadFormProps> = ({ onFileSelect }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { setVideoUrl } = useVideoStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    }
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0] || null;
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    }
    onFileSelect(file);
  };

  return (
    <div
      className={cn(
        "border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition hover:border-primary",
        "bg-white"
      )}
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
    >
      <Input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <span className="text-gray-500 mb-2">Drag & drop a video file here, or click to select</span>
    </div>
  );
};

export default UploadForm; 