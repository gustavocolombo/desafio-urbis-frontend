import type { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path',
        destination: `${API_URL}/api/*`, 
      },
    ]
  }
};

export default nextConfig;
