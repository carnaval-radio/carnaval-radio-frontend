# Carnaval Radio Frontend

This is the frontend of Carnaval-Radio.nl, built with Next.JS

[![Netlify Status](https://api.netlify.com/api/v1/badges/2ee00722-68c7-4cbf-a9d9-813ae8882cf2/deploy-status)](https://app.netlify.com/sites/carnaval-radio/deploys)

![Vercel](https://vercelbadge.vercel.app/api/carnaval-radio/carnaval-radio-frontend)


## Getting Started

- Create `.env.local` in the root
- Copy the `.env.example` file into the `.env.local` file.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Ticket promotion

- Manage the shared desktop and mobile menu in Strapi's `main` navigation. Add a **Tickets** external link with the URL `https://entrii.shop/carnaval-radio#`, rather than linking to the local tickets page. HTTPS menu links automatically open in a new tab. Navigation is cached for one hour.
- Configure ticket promotions in [notificationData.ts](data/notificationData.ts) and redeploy. Both the modal (`enabled`) and mobile ticket icon (`nudgeEnabled`) are scheduled for **8 November 2026 at 10:11 Europe/Amsterdam**, using `startsAt: "2026-11-08T10:11:00+01:00"`. Deploy before that time; no redeploy or cache refresh is needed at activation, including for visitors who already have the site open. Set `startsAt: null` for immediate activation, or set either feature flag to `false` to disable it.
- The modal appears 15 seconds after activation or arrival (whichever is later) and repeats on a subsequent visit after 5 days, controlled by `delay` and `showAgainAfterDays`. Both promotions use the configured ticket-shop link.
- To test the modal again before the repeat interval, run `localStorage.removeItem("notification_last_shown")` in the browser console and reload.
- Set `nudgeEnabled: true` in the same configuration to show the animated ticket icon in the mobile header.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
