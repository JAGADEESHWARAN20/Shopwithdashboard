/** @type {import('next').NextConfig} */
const nextConfig = {
  crossOrigin: 'anonymous',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '**',
      },
    ],
  },
  async headers() {
    const allowedOrigins = [
      "https://ecommercestore-online.vercel.app",
      "https://kajol-ecommercestore-online.vercel.app",
    ];

    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "", // This will be dynamically set below.
          },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
          { key: "Access-Control-Allow-Credentials", value: "true" },
        ],
      },
    ].map((headerConfig) => {
      // Dynamically set Access-Control-Allow-Origin
      return {
        ...headerConfig,
        headers: headerConfig.headers.map((header) => {
          if (header.key === "Access-Control-Allow-Origin") {
            return {
              ...header,
              value: allowedOrigins.join(", "),
            };
          }
          return header;
        }),
      };
    });
  },
};

export default nextConfig;
