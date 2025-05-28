"use client";
import React, { useEffect, useRef } from "react";

interface VideoStreamPlayerProps {
  streamUrl: string;
}

const VideoStreamPlayer: React.FC<VideoStreamPlayerProps> = ({ streamUrl }) => {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let abort = false;
    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
    let url: string | null = null;

    const fetchStream = async () => {
      const res = await fetch(streamUrl);
      if (!res.body) return;
      reader = res.body.getReader();
      let chunks: Uint8Array[] = [];
      while (!abort) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          const blob = new Blob(chunks, { type: "image/jpeg" });
          if (url) URL.revokeObjectURL(url);
          url = URL.createObjectURL(blob);
          if (imgRef.current) imgRef.current.src = url;
          chunks = [];
        }
      }
    };

    fetchStream();

    return () => {
      abort = true;
      if (reader) reader.cancel();
      if (url) URL.revokeObjectURL(url);
    };
  }, [streamUrl]);

  return (
    <div>
      <img ref={imgRef} alt="Video Stream" style={{ width: "100%" }} />
    </div>
  );
};

export default VideoStreamPlayer;