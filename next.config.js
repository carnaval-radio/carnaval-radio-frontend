/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  images: {
    domains: ["res.cloudinary.com", "ams1.reliastream.com"],
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/verzoekjes",
          destination: "/requests",
        },
        {
          source: "/gedraaide-nummers",
          destination: "/recentSongs",
        },
        {
          source: '/nieuwsberichten',
          destination: '/articles',
        },
        {
          source: '/nieuws',
          destination: '/articles',
        },
        {
          source: '/nieuwsberichten/:path*',
          destination: '/articles/:path*',
        },
        {
          source: '/nieuws/:path*',
          destination: '/articles/:path*',
        },
        {
          source: '/timer',
          destination: '/wanneer-begint-de-carnaval',
        },
      ]
    }
  },
  async redirects() {
    return [
      {
        source: "/beheer",
        destination: process.env.NEXT_PUBLIC_STRAPI_URL + "/admin",
        permanent: false,
        basePath: false,
      },
      {
         source: "/start-verkoop",
         destination: "https://www.ticketcrew.nl/tickets/carnaval-radio",
permanent: false,
        basePath: false,
      },
    ];
  },
};

module.exports = nextConfig;
