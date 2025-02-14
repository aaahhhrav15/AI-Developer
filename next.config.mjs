/** @type {import('next').NextConfig} */
const nextConfig = {
    api: {
      bodyParser: false, // Disables Next.js API route body parsing (optional)
    },
    experimental: {
      serverActions: true, // If using Next.js 14+ Server Actions
    },
  };
  
  export default nextConfig;
  