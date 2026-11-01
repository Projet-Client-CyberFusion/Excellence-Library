/** @type {import('next').NextConfig} */
const nextConfig = {
  // Hide the Next.js development badge while keeping runtime errors visible in the terminal.
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: { bodySizeLimit: '2mb' },
    // Réutilise le rendu déjà chargé lors des navigations répétées (précédent/suivant,
    // retour au catalogue…) au lieu de tout redemander au serveur à chaque clic.
    staleTimes: { dynamic: 30, static: 180 },
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

export default nextConfig
