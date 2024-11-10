/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  transpilePackages: ["types"],
  bundlePagesRouterDependencies: true,
  logging: false,
  experimental: {
    optimizePackageImports: ["@mantine/core", "@mantine/hooks"]
  }
};

export default config;
