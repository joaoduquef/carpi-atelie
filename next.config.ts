import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // permite o "?v=2" das fotos (ver src/lib/fotos.ts)
    localPatterns: [{ pathname: "/**" }],
  },
};

export default nextConfig;
