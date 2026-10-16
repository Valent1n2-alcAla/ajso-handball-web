import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Envoi de photos depuis l'admin (réduites à ~1 Mo dans le navigateur ; marge pour les originaux)
    serverActions: { bodySizeLimit: '10mb' },
    proxyClientMaxBodySize: '10mb',
  },
};

export default nextConfig;
