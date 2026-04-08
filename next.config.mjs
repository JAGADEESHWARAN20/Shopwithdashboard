/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  crossOrigin: "anonymous",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          // ❗ Do NOT hardcode multiple origins here
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,PATCH,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, X-Requested-With" },
          { key: "Vary", value: "Origin" },
        ],
      },
    ];
  },
};

export default nextConfig;