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
  poweredByHeader: false,
  async headers() {
    const isProduction = process.env.NODE_ENV === 'production';
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://backend-production-9d40.up.railway.app';
    const wsUrl = apiBaseUrl.replace(/^http/, 'ws');

    const cspDirectives = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' ${isProduction ? '' : "'unsafe-eval'"} https://js.stripe.com https://*.stripe.com https://*.sumsub.com`,
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' blob: data: https://*.stripe.com https://*.sumsub.com",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://*.stripe.com https://*.sumsub.com",
      `connect-src 'self' ${apiBaseUrl} ${wsUrl} ${isProduction ? '' : 'http://localhost:3001 http://127.0.0.1:3001 http://localhost:3003 http://127.0.0.1:3003'} https://api.stripe.com https://maps.googleapis.com https://*.stripe.com https://r.stripe.com https://*.stripe.network https://m.stripe.network https://*.sumsub.com`,
      "object-src 'none'",
      "upgrade-insecure-requests"
    ].join('; ');

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
        value: 'strict-origin-when-cross-origin'
      },
      {
        key: 'Content-Security-Policy',
        value: cspDirectives
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
      },
      {
        key: 'Cross-Origin-Opener-Policy',
        value: 'same-origin'
      },
      {
        key: 'Cross-Origin-Embedder-Policy',
        value: 'credentialless'
      },
      {
        key: 'Cross-Origin-Resource-Policy',
        value: 'same-origin'
      }
    ];

    if (isProduction) {
      headers.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload'
      });
    }

    return [
      {
        source: '/:path*',
        headers
      },
      {
        source: '/(dashboard|admin|profile|settings)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0, must-revalidate'
          }
        ]
      }
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api-proxy/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'https://backend-production-9d40.up.railway.app'}/:path*`,
      },
    ];
  },
};

export default withSerwist(nextConfig);
