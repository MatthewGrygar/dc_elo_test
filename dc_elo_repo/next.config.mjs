/** @type {import('next').NextConfig} */
// GitHub Pages requires a fully static build.
// Set NEXT_PUBLIC_BASE_PATH to your repo name with a leading slash, e.g. "/dc_elo_test".
// Locally you can leave it empty.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath,
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
