"use client";
import React, { useEffect, useRef } from "react";

interface VideoStreamPlayerProps {
  streamUrl: string;
}

const FPS = 30; // Adjust as needed

const VideoStreamPlayer: React.FC<VideoStreamPlayerProps> = ({ streamUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<Blob[]>([]);
  const playingRef = useRef(true);

  useEffect(() => {
    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
    let received = new Uint8Array();

    const fetchStream = async () => {
      try {
        const res = await fetch(streamUrl);
        if (!res.body) return;
        reader = res.body.getReader();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value) {
            // Concatenate new data
            let tmp = new Uint8Array(received.length + value.length);
            tmp.set(received, 0);
            tmp.set(value, received.length);
            received = tmp;

            // Parse JPEG frames from the stream
            while (true) {
              // Find JPEG SOI (0xFFD8) and EOI (0xFFD9)
              let soi = -1, eoi = -1;
              for (let i = 0; i < received.length - 1; i++) {
                if (received[i] === 0xff && received[i + 1] === 0xd8) soi = i;
                if (received[i] === 0xff && received[i + 1] === 0xd9 && soi !== -1) {
                  eoi = i + 2;
                  break;
                }
              }
              if (soi !== -1 && eoi !== -1 && eoi > soi) {
                const frame = received.slice(soi, eoi);
                framesRef.current.push(new Blob([frame], { type: "image/jpeg" }));
                received = received.slice(eoi);
              } else {
                break;
              }
            }
          }
        }
      } catch (err) {
        console.log("Stream ended or error occurred:", err);
      }
    };

    // Draw frames at FPS
    const drawFrames = async () => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext("2d");
      while (playingRef.current) {
        if (framesRef.current.length > 0) {
          const blob = framesRef.current.shift()!;
          const img = new window.Image();
          img.src = URL.createObjectURL(blob);
          await new Promise((resolve) => {
            img.onload = () => {
              ctx?.drawImage(img, 0, 0, canvasRef.current!.width, canvasRef.current!.height);
              URL.revokeObjectURL(img.src);
              resolve(true);
            };
          });
        }
        await new Promise((r) => setTimeout(r, 1000 / FPS));
      }
    };

    playingRef.current = true;
    fetchStream();
    drawFrames();

    return () => {
      playingRef.current = false;
      if (reader) reader.cancel();
    };
  }, [streamUrl]);

  return (
    <div>
      <canvas ref={canvasRef} width={640} height={480} style={{ width: "100%" }} />
    </div>
  );
};

export default VideoStreamPlayer;