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

## Event submissions

The events page includes a Dutch submission form. Incomplete configuration shows a contact link instead. Configure these environment variables in `.env.local` and your deployment, then restart/redeploy:

```dotenv
STRAPI_EVENT_SUBMISSION_TOKEN=your-create-only-api-token
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-turnstile-site-key
TURNSTILE_SECRET_KEY=your-turnstile-secret-key
TURNSTILE_HOSTNAMES=localhost,127.0.0.1
```

Submissions use the fixed endpoint `https://api.carnaval-radio.nl/api/events`. Keep both secrets server-side; never prefix them with `NEXT_PUBLIC_` or commit them. Create a **Custom** Strapi v4 API token granting only **Event > create** (no update, delete or read permissions). Do not reuse an administrative/full-access token. Draft & Publish must be enabled on Event. The server allowlists Title, Date, Address and optional Link, forces `publishedAt: null` and `IsHighlighted: false`, and verifies the returned draft. Editors review and publish drafts in Strapi; submissions do not refresh the public agenda.

**Create permission is not draft-only:** Strapi v4's standard create endpoint can accept a publication date. The frontend endpoint enforces drafts, but a stolen create-only token could still create published events directly. For a strict draft-only capability, enforce draft creation in a Strapi controller/policy or expose a dedicated submission endpoint and grant the token only that action. This requires changes in the backend, not this repository.

Reuse the existing Cloudflare Turnstile widget. Its allowed domains must cover production and local development. Set `TURNSTILE_HOSTNAMES=carnaval-radio.nl,www.carnaval-radio.nl` in Production and `localhost,127.0.0.1` in Development. Production rejects configurations containing loopback hosts. Leave Preview disabled until a widget-approved preview hostname is configured. Server-side verification requires an explicitly allowed, matching request hostname and the `event-submit` action. Ensure reverse proxies preserve the public request URL and Origin. Turnstile tokens are single-use; failures reset the widget. Do not automatically retry an unconfirmed CMS write, which might already have created a draft. Check Strapi before resubmitting.

Dates are interpreted in `Europe/Amsterdam` regardless of the visitor's timezone. Invalid/past dates and nonexistent/ambiguous clock-change times are rejected. The form uses only the existing event schema; it does not collect contact details, descriptions or end dates. Requests require same-origin JSON, size/field validation and a verified Turnstile challenge. Add deployment-level rate limiting if submission volume becomes an issue.

## Search and AI discovery

The homepage, news archive, events and team pages have distinct titles, descriptions, canonical URLs and matching social metadata. All team sort orders canonicalize to `/team/standaard`. Strapi content pages use their `Title` and a plain-text excerpt of `Content`; `/luisteren` and `/live-uitzendingen` have dedicated descriptions in [helpers/seo.ts](helpers/seo.ts). The root layout does not assign the homepage canonical to unrelated pages.

Station and website JSON-LD is rendered server-side, with stable entity IDs, official social profiles and Brunssum/Limburg location information. The service area includes the Dutch province of Limburg, the municipality of Beekdaelen, Parkstad and the cities Brunssum, Heerlen, Maastricht, Sittard, Geleen, Roermond, Venlo, Weert, Kerkrade, Landgraaf and Venray. These represent listener coverage, not additional studio addresses. The homepage includes visible, factual answers about the station and listening, with links to relevant pages. These improve machine-readable context; they do not guarantee Google snippets, sitelinks, rich results or AI citations. After deploying, request reindexing of the affected URLs in Google Search Console; Google decides the final search presentation.

## Played songs

The mobile bottom player places a 44px play/pause target on the left, fully wrapping song title/artist in the middle, then the favorite heart and compact artwork on the right. Favorites use the existing local favorites/sync helpers. Tap the artwork for comments, mute and available remote-playback controls; there is no comment button in the bottom bar. Desktop follows the same play/text/artwork hierarchy with a 48px play button and direct favorites, comments, mute, volume and available Chromecast/AirPlay controls. Titles retain their original casing and wrap rather than truncate. Player favorites stay synchronized between desktop and mobile on viewport changes. The bottom bar spans the main content area without covering the desktop sidebar, remains full-width on mobile, respects the device safe-area inset, and page padding follows its measured height at every breakpoint.

The homepage widget and history page share [RecentSongs](components/RecentSongs/RecentSongs.tsx). On mobile, full-size titles and artists wrap rather than being cut off at 18 characters, the time pill sits below the artist, and the heart/comment controls share a narrow vertical column. Comments remain directly accessible through a subdued icon, without an extra menu. Desktop keeps the original inline time pill and controls. The compact mobile date format is local to this list; other date displays keep their existing behavior.

## Homepage news and comments

The site brand logo (mobile header, desktop sidebar and footer) is an image-quality exception: [BrandLogo](components/BrandLogo.tsx) replaces existing Cloudinary transformations with automatic format selection, quality 100 and a size limit of three times the displayed width for retina screens. It preserves aspect ratio and avoids a second Next image compression pass. Sponsor logos and other images keep their existing optimizations.

Homepage news uses photo-led cards with alternating soft background colours, compact dates, readable titles and excerpts, and understated article links without an outer container. News and latest-comments section headings retain the site's Indie Flower style, and article titles retain the body font; news section headers have no subtitle and a colourful **Alle nieuws** button. The second news block is titled **Meer nieuws**. Video covers and current/archived article links remain supported; the news archive and article detail layouts are unchanged.

**Laatste reacties** shows the three newest listener quotes in orange, rose and green accented cards with song artwork, title/artist and timestamps in an open section, matching the homepage spacing without repeating the social widget container. Cards still open the song comments modal and refresh when it closes; the ten-minute background refresh remains. Loading, empty and error states stay visible.

On mobile, homepage news, comments and social cards use swipeable, scroll-snapping strips with a glimpse of the next card. Section spacing is reduced, archive links stay beside headings as compact **Alles** buttons, and social introductions/comment instructions are hidden. Desktop grids, full link labels and explanatory text remain unchanged.

News excerpts and **Lees verder** buttons use normal body-size text. Read-more buttons retain white backgrounds with per-card tertiary, secondary and primary accent borders/text.

## Article images

Current and archived article bodies use [ArticleContent](components/Post/ArticleContent.tsx). Consecutive image-only blocks (including Strapi figures or images inside a paragraph) become a responsive gallery, ignoring editor widths, floats, and alignment. Images separated by text remain in place. Images are uncropped, lazy-loaded, and constrained to the content width; captions and existing image links are preserved. A single image is centered.

Click an image to enlarge it. The native modal supports Escape, previous/next buttons, arrow keys, and returning focus to the opening button. Article cover images and non-image content retain their existing rendering.

## Social feeds

Facebook and Instagram use Graph API v27.0 through the shared `fetchSocialPosts` function in [fetchSocials](GlobalState/ApiCalls/fetchSocials.ts). It owns credentials, parallel platform requests, filtering, deduplication and newest-first sorting. Keep `FACEBOOK_ACCESS_TOKEN` and `INSTAGRAM_ACCESS_TOKEN` server-side; use Page tokens with the required permissions. Configure `NEXT_PUBLIC_FACEBOOK_PAGE_ID` and the connected professional account's `NEXT_PUBLIC_INSTAGRAM_ID`. Set `ENABLE_SOCIAL_POSTS=true` to show feeds on the homepage; `/social` does not use that flag.

After changing local environment variables, restart the development server if they are not picked up. Production environment changes must also be applied in Vercel and redeployed. Refresh cached social data with `/refresh?token=YOUR_REFRESH_TOKEN&tags=social`, using the server's `VALID_TOKEN`. This invalidates the social data and both `/` and `/social`; refresh confirms invalidation, not a successful Meta request. If the feed remains unavailable, inspect Vercel function logs for platform HTTP status and Meta error codes, and check the deployed account IDs, token validity and permissions. Instagram videos use thumbnails in the image cards. API failures log status/Meta error codes without tokens or response bodies.

Every caller uses the same batch of 25 recent posts per platform. Meta GET requests bypass the raw fetch cache through Next's `unstable_cache` callback scope; only validated successful payloads (including genuinely empty feeds) enter the shared cache, with `revalidate: 3600` and the `social` tag. Do not add explicit `cache: "no-store"` to the inner fetch: Next.js 14 treats it as a static-generation bailout even in this callback. Next's dynamic-rendering signals must propagate, not be logged as Meta failures. Cache keys include the account/query and a hash of the credential, never the token itself. Calls from different components/pages reuse this data cache; revalidation is traffic-driven, not a fixed hourly job. Failed hourly background refreshes retain the last good platform payload. On a cache miss or explicit invalidation, failures use the existing empty-feed UI but are not cached as data or as a rendered page, so the next request can recover immediately. The validated cache uses separate keys from the old raw-fetch cache, bypassing previously cached malformed responses on deployment. Development HMR/hard refresh behavior can differ from production caching.

### Optional durable fallback with Vercel Blob

1. In your Vercel project's **Storage** tab, create/connect a **private Vercel Blob store**. Do not select public access.
2. Ensure the connection provides `BLOB_READ_WRITE_TOKEN` to **Production**. It is a server-only secret; never prefix it with `NEXT_PUBLIC_` or commit it. Connecting Preview/Development is optional.
3. Redeploy with valid Meta tokens, then use the authenticated `tags=social` refresh and visit `/social`. Successful uncached Meta requests seed the store; an already fresh Next cache does not write snapshots.
4. In the store, verify JSON files exist under `social-feeds/v1/production/facebook/` and `social-feeds/v1/production/instagram/`. No SQL or database setup is required.

[socialSnapshots](GlobalState/ApiCalls/socialSnapshots.ts) saves one small JSON snapshot per platform/account/query only after a validated successful Meta request, including genuinely empty feeds. Live Meta data still refreshes hourly, but durable snapshots are written at most once every 24 hours, checked against Blob upload metadata on each successful uncached fetch. The first snapshot is saved immediately; subsequent writes are traffic-driven, not a scheduled daily job. Existing snapshots use conditional writes to avoid overwriting a concurrent update. Failed requests never replace snapshots. Paths are independent of Meta tokens and deployment builds; changing the account/query selects another snapshot. `VERCEL_ENV` separates production, preview and development, so local/preview writes cannot replace production data.

On Meta failure without usable Next cached data, the feed reads its saved snapshot. Blob reads use a five-minute Next cache tagged `social`; explicit refresh clears this cache but does not delete the durable files. Meta failures remain retryable rather than caching the fallback as a successful Meta response. That means outages can still generate a Meta request per page render, while repeated Blob reads are cached. Missing/unreadable/malformed snapshots are logged and use the existing empty-feed UI. Blob write failures are logged without hiding an otherwise successful live feed. Without `BLOB_READ_WRITE_TOKEN`, the feature is disabled and existing Next-only caching behavior is preserved.

Snapshots retain post text and image URLs, not image files; Meta image URLs can expire. Snapshots can remain stale until a successful daily write replaces them. On Pro, Blob usage consumes the plan's monthly credit and can become billable; Pro does not inherit Hobby's free Blob allowance. Daily writes for two platforms are roughly 60/month, plus metadata checks on successful uncached Meta fetches and cached fallback reads. Deployments/manual refreshes do not reset the daily snapshot age. Use Vercel's usage dashboard and Spend Management to monitor costs; this is not a hard spending cap.

The homepage uses [SocialWidget](components/Socials/SocialWidget.tsx), titled **Op onze socials**. Homepage order is news 1–3, social posts 1–3, latest comments, social posts 4–6 (**Meer op onze socials**), then news 4–6. Empty social widgets are hidden. `/social` uses the same widget in full-grid mode with all available filtered posts. The old `/social/facebook` and `/social/instagram` routes permanently redirect to `/social`.

Posts without meaningful caption text (blank, emoji-only, or only hashtags/mentions/URLs) are excluded before slicing, avoiding empty profile/photo updates and placeholder captions. Short genuine announcements are kept; there is no arbitrary minimum character count.

Cross-posts within 48 hours are combined into one card, retaining links to both platforms. Matching uses identical image URLs or captions, ignoring case/spacing. Longer captions may differ slightly in emoji, tags and mentions: at least 20 distinct words, the same opening eight words and a word-overlap score of at least 90% are required. The homepage widget is a swipeable strip on mobile and a grid on desktop. Images/captions link to Instagram when a cross-post is available, otherwise to the original platform. **Alles bekijken** opens the combined social page.

Social cards have solid orange Facebook pills at the image's top-right and red Instagram pills at bottom-left, including separate links on combined cross-posts. Each opens its own platform's post in a new tab. Images remain clickable without an additional external-link badge.

Social card images use a 4:5 portrait ratio on the homepage and combined feed, showing more of the vertical artwork.

Captions longer than 160 characters have a **Meer lezen** button showing the full text with line breaks in a scrollable reading view inside the existing card. Card height and surrounding layout remain unchanged. A translucent top fades into the solid text background, showing a glimpse of the photo without a heading. Close using the close button or Escape; focus returns to **Meer lezen**. It works with touch, mouse and keyboard without opening the external post. Short captions are shown in full.

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
