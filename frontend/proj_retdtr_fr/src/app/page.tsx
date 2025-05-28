"use client";
import { useState } from "react";
import UploadForm from "../components/UploadForm";
import { Button } from "../components/ui/button";
import VideoStreamPlayer from "../components/VideoStreamPlayer";

const backendHost = process.env.NEXT_PUBLIC_BACKEND_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:8000"
    : `http://${window.location.hostname}:8000`);

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showStream, setShowStream] = useState(false);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    const res = await fetch(`${backendHost}/api/detect_and_stream`, {
      method: "POST",
      body: formData,
    });
    console.log('file uploaded Sucessfully');
    if (res.ok) {
      setShowStream(true);
    }
    setUploading(false);
  };
    console.log('showStream is getting ready');

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="flex flex-col items-center justify-center w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        {!showStream && (
          <UploadForm onFileSelect={(file) => {
            setSelectedFile(file);
            if (file) {
              const localUrl = URL.createObjectURL(file);
              setUploadedVideoUrl(localUrl);
            } else {
              setUploadedVideoUrl(null);
            }
          }} />
        )}
        {uploadedVideoUrl && !showStream && (
          <div className="w-full mt-6">
            <video src={uploadedVideoUrl} controls className="w-full rounded-lg shadow-md" />
          </div>
        )}
        {!showStream && (
          <Button className="mt-8 mb-4 w-40 h-14 text-lg rounded-lg" onClick={handleUpload} disabled={!selectedFile || uploading}>
            {uploading ? "Uploading..." : "Upload Video"}
          </Button>
        )}
        {showStream && (
          <>
            <div className="w-full mt-6">
              <VideoStreamPlayer streamUrl={`${backendHost}/api/stream/`} />
            </div>
            <Button className="mt-4 w-40 h-14 text-lg rounded-lg bg-red-600 hover:bg-red-700" onClick={async () => {
              await fetch(`${backendHost}/api/stop_stream`, { method: "POST" });
              setShowStream(false);
              setSelectedFile(null);
              setUploadedVideoUrl(null);
            }}>
              Stop
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
