import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: process.env.ALLOWED_DEV_ORIGINS?.split(",") || [
    "http://localhost:3000",
    "http://192.168.81.39:3000"
  ],
};

export default nextConfig;
