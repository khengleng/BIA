import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_API_URL?.includes('localhost'),
});

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  async headers() {
    const isLocal = process.env.NEXTAUTH_URL?.includes('localhost') || !process.env.NEXTAUTH_URL;
    const headers = [
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'on'
      },
      {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN'
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff'
      },
      {
        key: 'Referrer-Policy',
        value: 'origin-when-cross-origin'
      },
      {
        key: 'Content-Security-Policy',
        value: `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://*.stripe.com https://*.sumsub.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' blob: data: https://*.stripe.com https://*.sumsub.com; frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://*.stripe.com https://*.sumsub.com; connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'} http://localhost:3001 http://127.0.0.1:3001 http://localhost:3003 http://127.0.0.1:3003 https://api.stripe.com https://maps.googleapis.com https://*.stripe.com https://*.stripe.network https://*.sumsub.com ws: wss:;`
      }
    ];

    if (!isLocal) {
      headers.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload'
      });
    }

    return [
      {
        source: '/:path*',
        headers
      }
    ];
  }
};

export default withSerwist(nextConfig);
