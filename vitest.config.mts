import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  oxc: {
    jsx: {
      runtime: "automatic",
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
    setupFiles: ["./tests/setup.ts"],
    clearMocks: true,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      include: [
        "helpers/useScheduledActivation.ts",
        "helpers/storageHelper.tsx",
        "helpers/favorites.ts",
        "helpers/deviceId.ts",
        "GlobalState/features/PlayerSlice.ts",
        "GlobalState/ApiCalls/fetchSongs.ts",
        "GlobalState/ApiCalls/fetchSocials.ts",
        "GlobalState/ApiCalls/socialSnapshots.ts",
        "components/Notification.tsx",
        "components/TicketNudge.tsx",
        "components/RecentSongs/RecentSongs.tsx",
        "components/DateAndTime.tsx",
        "components/Post/ArticleContent.tsx",
        "components/Post/ArticleGallery.tsx",
        "components/Socials/SocialWidget.tsx",
        "components/Socials/SocialCaption.tsx",
        "components/Sidebar/SidebarLinkItem.tsx",
        "components/Sidebar/SidebarLinks.tsx",
        "app/api/songs/route.ts",
        "app/refresh/actions.ts",
        "app/refresh/page.tsx",
      ],
      thresholds: {
        statements: 90,
        branches: 85,
        functions: 90,
        lines: 90,
      },
    },
  },
});
