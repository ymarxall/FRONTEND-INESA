/** @type {import('next').NextConfig} */
const NGROK_URL = 'https://joyful-analysis-production.up.railway.app';

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: NGROK_URL.replace('https://', ''),
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${NGROK_URL}/api/:path*`,
      },
      {
        source: '/local-api/:path*',
        destination: 'http://192.168.1.85:8080/:path*',
      },
      {
        source: '/sekretaris-api/:path*',
        destination: 'http://192.168.1.85:8088/api/:path*', // Perbaiki path untuk menyertakan /api
      },
    ]
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, ngrok-skip-browser-warning, Origin, Accept, X-Requested-With" },
        ],
      },
    ]
  },
};

export default nextConfig;