import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '15mb',
    },
    middlewareClientMaxBodySize: '25mb',
  },
}

export default nextConfig