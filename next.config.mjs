/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: [
    "jsonresume-theme-elegant",
    "jsonresume-theme-flat",
    "jsonresume-theme-even",
    "jsonresume-theme-jacrys",
    "jsonresume-theme-kendall",
    "jsonresume-theme-macchiato",
    "jsonresume-theme-pumpkin",
    "jsonresume-theme-modern",
    "jsonresume-theme-short",
    "jsonresume-theme-paper",
    "jsonresume-theme-minyma",
    "jsonresume-theme-tan-responsive",
    "jsonresume-theme-rickosborne",
    "jsonresume-theme-eloquent",
    "jsonresume-theme-onepage-plus",
    "jsonresume-theme-autumn",
    "jsonresume-theme-spartan",
    "jsonresume-theme-minimal",
    "jsonresume-theme-crisp",
  ],
  output: "standalone",
};

export default nextConfig;
