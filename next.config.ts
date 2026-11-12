import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces .next/standalone (minimal server.js + traced dependencies) used by the Docker image.
  // Has no effect on `next dev`.
  output: "standalone",
};

export default nextConfig;
