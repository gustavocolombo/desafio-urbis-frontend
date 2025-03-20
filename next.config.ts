import type { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true, 
  },
  reactStrictMode: true,
};

export default nextConfig;
