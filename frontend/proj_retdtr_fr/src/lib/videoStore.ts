import { create } from "zustand";
import { DetectionResult } from "../components/DetectionResults";

interface VideoState {
  videoUrl: string | null;
  results: DetectionResult[];
  setVideoUrl: (url: string) => void;
  setResults: (results: DetectionResult[]) => void;
}

export const useVideoStore = create<VideoState>((set) => ({
  videoUrl: null,
  results: [],
  setVideoUrl: (url) => set({ videoUrl: url }),
  setResults: (results) => set({ results }),
})); 