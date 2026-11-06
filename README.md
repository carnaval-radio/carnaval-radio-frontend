# Carnaval Radio Frontend

This is the frontend of Carnaval-Radio.nl, built with Next.JS

[![Netlify Status](https://api.netlify.com/api/v1/badges/2ee00722-68c7-4cbf-a9d9-813ae8882cf2/deploy-status)](https://app.netlify.com/sites/carnaval-radio/deploys)

![Vercel](https://vercelbadge.vercel.app/api/carnaval-radio/carnaval-radio-frontend)


## Getting Started

- Create `.env.local` in the root
- Copy the `.env.example` file into the `.env.local` file.

Use Node.js 22.12 or newer within the Node 22 release line (see [.nvmrc](.nvmrc)) and the pinned pnpm version in [package.json](package.json). The engine range deliberately keeps deployments on Node 22 rather than automatically selecting a newer major.

```bash
nvm use
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Use pnpm for dependency changes and commit [pnpm-lock.yaml](pnpm-lock.yaml). Do not generate an npm or Yarn lockfile. `corepack pnpm` can be used instead of `pnpm` if your globally installed pnpm has a different version.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Automated checks and maintenance

```bash
pnpm check          # lint, TypeScript, tests, and coverage
pnpm test           # all regression tests, once
pnpm test:watch     # interactive test runner
pnpm test:coverage  # enforce thresholds and generate coverage/index.html
pnpm build          # production build with the configured backend environment
pnpm audit --prod   # review the remaining production dependency advisories
```

`pnpm check` uses Corepack for its child commands so every check uses the pinned pnpm version, even when a different global pnpm is installed.

- [CI](.github/workflows/ci.yml) runs a frozen pnpm install, lint, type checks, and coverage on pull requests and pushes to `main`, without production credentials. The HTML coverage report is uploaded as an artifact.
- [Dependabot](.github/dependabot.yml) opens weekly dependency and GitHub Actions update PRs. Minor/patch updates are grouped separately for development and production dependencies; major upgrades remain separate PRs. Updates are not auto-merged.
- [Tests](tests/) use Vitest and React Testing Library. They cover scheduled ticket promotions (including the exact activation boundary and timer cleanup), the shared Strapi navigation, ticket redirects, local favorites/device identity, player state, radio metadata, songs API merging and fallback behavior, and authenticated cache refresh.
- Tests use fake clocks and mocked network/database dependencies: they do not access Strapi, Supabase, or the live radio API. Async server pages are tested directly rather than through a running Next.js server.
- Coverage thresholds are **90% statements/lines/functions and 85% branches** for the explicit regression-tested modules listed in [vitest.config.mts](vitest.config.mts). These are **not whole-project coverage figures**. Extend that list when adding tests for another module.
- Existing hook, image/accessibility, and text-escaping lint warnings remain visible. Text escaping is a warning, not a correctness error. ESLint 8 remains aligned with Next.js 14 until the framework upgrade; no major production framework upgrade is included in this baseline.

### Remaining maintenance work

This baseline does not make the whole application fully tested or bring every dependency up to date. Production dependency advisories still require review and upgrades. Prioritize those, then a supported Next.js/React migration in separate, regression-tested changes.

Real-browser end-to-end coverage, audio playback/Chromecast on real devices, upload flows, comments/likes database integration, and full-page CMS rendering remain outside this suite. Production builds need the configured external services and font downloads, so the offline CI checks do not replace Vercel's deployment build.

After committing and pushing this workflow, enable the **Lint, types, and tests** check as a required status check in the GitHub branch rules for `main`, and require reviewed pull requests. This repository configuration alone does not block direct pushes or make Vercel wait for CI.

## Played songs

The homepage widget and history page share [RecentSongs](components/RecentSongs/RecentSongs.tsx). On mobile, full-size titles and artists wrap rather than being cut off at 18 characters, the time pill sits below the artist, and the heart/comment controls share a narrow vertical column. Comments remain directly accessible through a subdued icon, without an extra menu. Desktop keeps the original inline time pill and controls. The compact mobile date format is local to this list; other date displays keep their existing behavior.

## Article images

Current and archived article bodies use [ArticleContent](components/Post/ArticleContent.tsx). Consecutive image-only blocks (including Strapi figures or images inside a paragraph) become a responsive gallery, ignoring editor widths, floats, and alignment. Images separated by text remain in place. Images are uncropped, lazy-loaded, and constrained to the content width; captions and existing image links are preserved. A single image is centered.

Click an image to enlarge it. The native modal supports Escape, previous/next buttons, arrow keys, and returning focus to the opening button. Article cover images and non-image content retain their existing rendering.

## Social feeds

Facebook and Instagram use Graph API v27.0 through [fetchSocials](GlobalState/ApiCalls/fetchSocials.ts), with one-hour caching under the `social` tag. Keep `FACEBOOK_ACCESS_TOKEN` and `INSTAGRAM_ACCESS_TOKEN` server-side; use Page tokens with the required permissions. Configure `NEXT_PUBLIC_FACEBOOK_PAGE_ID` and the connected professional account's `NEXT_PUBLIC_INSTAGRAM_ID`. Set `ENABLE_SOCIAL_POSTS=true` to show feeds on the homepage; dedicated social pages do not use that flag.

After changing local environment variables, restart the development server if they are not picked up. Production environment changes must also be applied in Vercel and redeployed. Refresh cached social data with `/refresh?token=YOUR_REFRESH_TOKEN&tags=social,/`. Instagram videos use thumbnails in the image cards. API failures retain the existing empty-feed behavior and log HTTP status/Meta error codes without tokens or response bodies.

The homepage uses [SocialWidget](components/Socials/SocialWidget.tsx), titled **Op onze socials**: a photo-led mixed feed alternating Facebook and Instagram, starting with the newest post and keeping each platform in newest-first order. It fetches three posts from each platform and combines cross-posts within 48 hours into one card, retaining links to both platforms. Matching uses identical image URLs or captions, ignoring case/spacing. Longer captions may differ slightly in emoji, tags and mentions: at least 20 distinct words, the same opening eight words and a word-overlap score of at least 90% are required. Empty captions alone are never matched. The widget is a swipeable strip on mobile and a grid on desktop. Cards open the original post in a new tab; **Alles bekijken** opens the combined social page. Dedicated social pages keep their existing layout.

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
