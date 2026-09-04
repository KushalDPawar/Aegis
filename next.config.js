/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Next 14: ship the seeded SQLite file with serverless traces.
  experimental: {
    outputFileTracingIncludes: {
      "/*": ["./prisma/deploy.db", "./prisma/schema.prisma"],
      "/platform": ["./prisma/deploy.db", "./prisma/schema.prisma"],
      "/login": ["./prisma/deploy.db", "./prisma/schema.prisma"],
      "/register": ["./prisma/deploy.db", "./prisma/schema.prisma"],
      "/pay": ["./prisma/deploy.db", "./prisma/schema.prisma"],
      "/pay/:path*": ["./prisma/deploy.db", "./prisma/schema.prisma"],
      "/incidents": ["./prisma/deploy.db", "./prisma/schema.prisma"],
      "/incidents/:path*": ["./prisma/deploy.db", "./prisma/schema.prisma"],
      "/recovery": ["./prisma/deploy.db", "./prisma/schema.prisma"],
      "/lab": ["./prisma/deploy.db", "./prisma/schema.prisma"],
      "/trusted-circle": ["./prisma/deploy.db", "./prisma/schema.prisma"],
      "/trusted/:path*": ["./prisma/deploy.db", "./prisma/schema.prisma"],
      "/console": ["./prisma/deploy.db", "./prisma/schema.prisma"],
      "/console/:path*": ["./prisma/deploy.db", "./prisma/schema.prisma"],
    },
  },
};

module.exports = nextConfig;
