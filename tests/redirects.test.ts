import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import type { NextConfig } from "next";

const require = createRequire(import.meta.url);
const config: NextConfig = require("../next.config.js");

describe("public route compatibility", () => {
  it("redirects every advertised ticket URL to the same shop", async () => {
    const redirects = await config.redirects!();
    const tickets = redirects.filter(({ source }) =>
      ["/tickets", "/tickets-kopen", "/start-verkoop"].includes(source),
    );
    expect(tickets).toHaveLength(3);
    for (const redirect of tickets) {
      expect(redirect).toMatchObject({
        destination: "https://entrii.shop/carnaval-radio#",
        permanent: false,
        basePath: false,
      });
    }
  });

  it("keeps the news article rewrite and request form alias", async () => {
    const rewrites = await config.rewrites!();
    if (Array.isArray(rewrites)) throw new Error("Expected beforeFiles rewrites");
    expect(rewrites.beforeFiles).toEqual(expect.arrayContaining([
      { source: "/nieuwsberichten/:path*", destination: "/articles/:path*" },
      { source: "/verzoekjes", destination: "/requests/whatsapp" },
    ]));
  });
});
