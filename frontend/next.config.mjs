/** @type {import('next').NextConfig} */
const nextConfig = {
  // Rewrites: proxy /api/* calls to the backend server during development
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
