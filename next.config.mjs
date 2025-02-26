/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {}, // ✅ Fixed: Changed from boolean to object
  },
};

export default nextConfig;
