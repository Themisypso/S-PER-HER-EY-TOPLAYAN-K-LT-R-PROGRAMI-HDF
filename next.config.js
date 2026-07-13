/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
const nextConfig = {
  images: {
    remotePatterns: [
      // TMDB — movie & TV posters and backdrops
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
      // Google user profile images (OAuth avatars)
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      // RAWG — game cover images
      {
        protocol: 'https',
        hostname: 'media.rawg.io',
        pathname: '/media/**',
      },
      // Google Books — book cover thumbnails
      {
        protocol: 'https',
        hostname: 'books.google.com',
      },
      // Supabase — user avatars and media uploads
      {
        protocol: 'https',
        hostname: 'tevryixfnyrxxjobolrl.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // Wikipedia — for steam icon in profile
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      // Steam CDN - for steam game covers
      {
        protocol: 'https',
        hostname: 'steamcdn-a.akamaihd.net',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/movies/:id',
        destination: '/media/:id?type=movie',
        permanent: true,
      },
      {
        source: '/tv-shows/:id',
        destination: '/media/:id?type=tvshow',
        permanent: true,
      },
      {
        source: '/tvshows/:id',
        destination: '/media/:id?type=tvshow',
        permanent: true,
      },
      {
        source: '/anime/:id',
        destination: '/media/:id?type=anime',
        permanent: true,
      },
      {
        source: '/animes/:id',
        destination: '/media/:id?type=anime',
        permanent: true,
      },
      {
        source: '/games/:id',
        destination: '/media/:id?type=game',
        permanent: true,
      },
      {
        source: '/books/:id',
        destination: '/media/:id?type=book',
        permanent: true,
      },
    ];
  },
}

module.exports = withNextIntl(nextConfig);
