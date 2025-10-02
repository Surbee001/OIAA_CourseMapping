import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'github.com',
        pathname: '/Surbee001/webimg/**',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/Surbee001/webimg/**',
      },
    ],
  },
  // Disable font optimization to allow external fonts
  optimizeFonts: false,
};

export default nextConfig;
