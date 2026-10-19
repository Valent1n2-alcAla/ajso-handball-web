import type { NextConfig } from "next";

/** Origines servant les photos envoyées via l'admin (API Symfony, dossier /uploads). */
const originesImages = [
  ...new Set(
    [process.env.API_URL, process.env.NEXT_PUBLIC_API_URL, process.env.UPLOADS_URL, 'http://localhost:8000', 'http://127.0.0.1:8000']
      .flatMap((u) => {
        try {
          return u ? [new URL(u).origin] : [];
        } catch {
          return [];
        }
      }),
  ),
];

/** API locale (dev, ou API sur la même machine) : l'optimiseur doit pouvoir la joindre. */
const apiLocale = originesImages.some((o) => /^https?:\/\/(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|\[::1\])/.test(o));

const nextConfig: NextConfig = {
  experimental: {
    // Envoi de photos depuis l'admin (réduites à ~1 Mo dans le navigateur ; marge pour les originaux)
    serverActions: { bodySizeLimit: '10mb' },
    proxyClientMaxBodySize: '10mb',
  },
  // Lu par src/lib/images.ts (serveur et navigateur) : les autres URL d'images ne sont pas optimisées.
  env: { IMAGES_ORIGINES: originesImages.join(' ') },
  images: {
    remotePatterns: originesImages.map((o) => new URL(`${o}/uploads/**`)),
    // Limité aux origines ci-dessus par remotePatterns
    dangerouslyAllowLocalIP: apiLocale,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
