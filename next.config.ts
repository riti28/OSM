import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  ...(process.env.OSM_STATIC_EXPORT === "1" ? { output: "export", trailingSlash: true } : {}),
};
export default config;
