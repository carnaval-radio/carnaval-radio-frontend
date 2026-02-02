/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.reliastream.com',
      },
            {
        protocol: 'https',
        hostname: '**.mzstatic.com',
      },
    ],
  },

  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/verzoekjes",
          destination: "/requests/whatsapp",
        },
        {
          source: "/gedraaide-nummers",
          destination: "/recentSongs",
        },
        {
          source: "/favorieten",
          destination: "/favorites",
        },
        {
          source: "/evenementen",
          destination: "/events",
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
          source: '/socials',
          destination: '/social',
        },
        {
          source: '/nieuwsberichten/o/:path*',
          destination: '/articles/article/:path*',
        },
        {
          source: '/nieuwsberichten/:path*',
          destination: '/articles/:path*',
        },
        {
          source: '/reacties',
          destination: '/comments',
        },
      ]
    }
  },
  async redirects() {
    return [
      {
        source: '/post/:path*.aspx',
        destination: '/nieuwsberichten/article/:path*',
        permanent: true,
      },
      {
          source: '/n/:path*',
          destination: '/nieuwsberichten/:path*',
          permanent: true,
      },
      {
        source: '/:path*.aspx',
        destination: '/:path*',
        permanent: true,
      },
      {
        source: '/audioplayer',
        destination: '/luisteren',
        permanent: false,
      },
      {
        source: '/recente-nummers',
        destination: '/gedraaide-nummers',
        permanent: true,
      },
      {
        source: '/recentenummers',
        destination: '/gedraaide-nummers',
        permanent: true,
      },
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
      {
        source: "/tickets-kopen",
        destination: "https://www.ticketcrew.nl/tickets/carnaval-radio",
        permanent: false,
        basePath: false,
      },
        {
          source: "/tickets",
          destination: "https://www.ticketcrew.nl/tickets/carnaval-radio",
          permanent: false,
          basePath: false,
        },
      {
        source: "/donatie",
        destination: process.env.NEXT_PUBLIC_PAYMENT_LINK,
        permanent: false,
        basePath: false,
     },
     {
        source: '/team',
        destination: '/team/standaard',
        permanent: false,
      },
      {
        source: '/tune-in',
        destination: 'https://tunein.com/radio/Carnaval-Radio-s351099/',
        permanent: false,
      },
      {
        source: '/app/android',
        destination: 'https://play.google.com/store/apps/details?id=com.carnavalradio&hl=nl',
        permanent: false,
      },
      {
        source: '/app/ios',
        destination: 'https://apps.apple.com/nl/app/carnaval-radio/id6470475333',
        permanent: false,
      },
      {
        source: '/insta',
        destination: 'https://www.instagram.com/carnaval.radio',
        permanent: false,
      },
      {
        source: '/fb',
        destination: 'https://www.facebook.com/carnavalradio',
        permanent: false,
      },
      {
        source: '/yt',
        destination: 'https://www.youtube.com/@Carnavalsradio',
        permanent: false,
      },
      {
        source: '/tiktok',
        destination: 'https://www.tiktok.com/@carnavalradiobrunssum',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
