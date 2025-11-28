/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  transpilePackages: ["jsonresume-theme-even"],
  serverExternalPackages: ["jsonresume-theme-elegant", "jsonresume-theme-flat"],
  output: "standalone",
};

export default nextConfig;
