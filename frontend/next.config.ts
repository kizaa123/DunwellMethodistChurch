import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['localhost', '127.0.0.1', '10.61.155.240'],
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:5000"}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
