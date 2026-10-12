import type { NextConfig } from 'next';

// NFR-SEC-04. Admin uploads talk to api.github.com straight from the browser; sign-in goes via github.com.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://avatars.githubusercontent.com",
  "connect-src 'self' https://api.github.com",
  "frame-src 'self'",
  "frame-ancestors 'self'",
  "form-action 'self' https://github.com",
  "object-src 'none'",
  "base-uri 'self'",
].join('; ');

export default {
  async headers() {
    if (process.env.NODE_ENV !== 'production') return []; // dev tooling needs eval
    return [
      {
        // PDFs are left out: the browser's PDF viewer does not need the page policy
        source: '/((?!Content/).*)',
        headers: [{ key: 'Content-Security-Policy', value: csp }],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        // ponytail: replaced files keep their path, so browsers may show the old copy for up to an hour
        source: '/Content/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' }],
      },
    ];
  },
} satisfies NextConfig;
