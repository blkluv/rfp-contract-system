import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};
// next.config.js
module.exports = {
  eslint: {
    // 🚨 This makes builds succeed even with ESLint errors
    ignoreDuringBuilds: true,
  },
};
export default nextConfig;
