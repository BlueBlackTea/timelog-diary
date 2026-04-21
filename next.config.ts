import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/timelog-diary",
  images: { unoptimized: true },
};

export default nextConfig;
