import type { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`
      },
    ]
  }
};

export default nextConfig;
