import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/events/submit/route";
import { validateEventSubmission } from "@/helpers/eventSubmission";

const input = {
  title: "Feestavond",
  address: "Brikke Oave, Brunssum",
  localDateTime: "2027-01-23T19:30",
  link: "https://example.com/event",
  turnstileToken: "challenge-token",
};

function request(body: unknown = input, headers: Record<string, string> = {}) {
  return new NextRequest("https://www.carnaval-radio.nl/api/events/submit", {
    method: "POST",
    headers: { origin: "https://www.carnaval-radio.nl", "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const verification = { success: true, action: "event-submit", hostname: "www.carnaval-radio.nl" };

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-08T09:00:00Z"));
  vi.stubEnv("STRAPI_EVENT_SUBMISSION_TOKEN", "server-token");
  vi.stubEnv("TURNSTILE_SECRET_KEY", "server-secret");
  vi.stubEnv("TURNSTILE_HOSTNAMES", "www.carnaval-radio.nl,carnaval-radio.nl");
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("event input", () => {
  it("trims fields and forces an unhighlighted draft, ignoring arbitrary CMS fields", () => {
    expect(validateEventSubmission({
      ...input, title: " Feestavond ", publishedAt: "2026-11-08", IsHighlighted: true,
    })).toEqual({
      token: input.turnstileToken,
      data: {
        Title: "Feestavond", Date: "2027-01-23T18:30:00.000Z",
        Address: input.address, Link: input.link, publishedAt: null, IsHighlighted: false,
      },
    });
  });

  it("converts Dutch summer time and accepts no link", () => {
    const result = validateEventSubmission({ ...input, localDateTime: "2027-07-01T19:30", link: "" });
    expect(result).toMatchObject({ data: { Date: "2027-07-01T17:30:00.000Z", Link: null } });
  });

  it.each([
    null, [], {}, { ...input, title: "x" }, { ...input, title: "a".repeat(121) },
    { ...input, address: 42 }, { ...input, address: "a".repeat(201) },
    { ...input, link: "javascript:alert(1)" }, { ...input, link: "/tickets" },
    { ...input, link: "https://user:password@example.com" }, { ...input, link: 2 },
    { ...input, link: "https://example.com/" + "a".repeat(2048) },
    { ...input, localDateTime: "2027-02-30T19:30" },
    { ...input, localDateTime: "2027-03-28T02:30" },
    { ...input, localDateTime: "2027-10-31T02:30" },
    { ...input, localDateTime: "2026-01-01T12:00" },
    { ...input, localDateTime: "2027-01-23" },
    { ...input, turnstileToken: "" }, { ...input, turnstileToken: "x".repeat(2049) },
  ])("rejects invalid input without returning a draft: %j", (body) => {
    expect(validateEventSubmission(body)).toHaveProperty("error");
  });
});

describe("submission API", () => {
  it("validates Turnstile and sends only allowlisted draft data to Strapi", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(Response.json(verification))
      .mockImplementationOnce(async (_url, options) => {
        const payload = JSON.parse(String(options?.body));
        return Response.json({ data: { id: 99, attributes: payload.data } }, { status: 201 });
      });
    const response = await POST(request({ ...input, IsHighlighted: true, publishedAt: "2027-01-01" }));
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ ok: true });
    expect(fetch).toHaveBeenNthCalledWith(1, "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      expect.objectContaining({ body: JSON.stringify({ secret: "server-secret", response: "challenge-token" }) }));
    expect(fetch).toHaveBeenNthCalledWith(2, "https://api.carnaval-radio.nl/api/events",
      expect.objectContaining({
        redirect: "error",
        headers: { "Content-Type": "application/json", Authorization: "Bearer server-token" },
        body: JSON.stringify({ data: {
          Title: input.title, Date: "2027-01-23T18:30:00.000Z", Address: input.address,
          Link: input.link, IsHighlighted: false, publishedAt: null,
        } }),
      }));
  });

  it.each([
    ["cross-origin", input, { origin: "https://other.example" }, 403],
    ["missing origin", input, { origin: "" }, 403],
    ["wrong content type", input, { "content-type": "text/plain" }, 415],
    ["invalid JSON", "{", {}, 400],
    ["invalid fields", {}, {}, 400],
    ["large declared body", input, { "content-length": "8193" }, 413],
    ["large actual body", JSON.stringify({ ...input, extra: "x".repeat(8193) }), {}, 413],
  ] as const)("rejects %s before network calls", async (_name, body, headers, status) => {
    expect((await POST(request(body, headers))).status).toBe(status);
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each(["STRAPI_EVENT_SUBMISSION_TOKEN", "TURNSTILE_SECRET_KEY", "TURNSTILE_HOSTNAMES"])(
    "fails closed without %s", async (name) => {
      vi.stubEnv(name, "");
      expect((await POST(request())).status).toBe(503);
      expect(fetch).not.toHaveBeenCalled();
    },
  );

  it("rejects a host outside the explicit allowlist", async () => {
    vi.stubEnv("TURNSTILE_HOSTNAMES", "other.example");
    expect((await POST(request())).status).toBe(403);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects localhost in a production allowlist", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("TURNSTILE_HOSTNAMES", "www.carnaval-radio.nl,localhost");
    expect((await POST(request())).status).toBe(403);
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each([
    { ...verification, success: false }, { ...verification, action: "other" },
    { ...verification, hostname: "other.example" }, null,
  ])("rejects failed or mismatched Turnstile challenges", async (result) => {
    vi.mocked(fetch).mockResolvedValueOnce(Response.json(result));
    expect((await POST(request())).status).toBe(400);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it.each(["http", "network", "json"])("surfaces Turnstile %s failures", async (failure) => {
    if (failure === "network") vi.mocked(fetch).mockRejectedValueOnce(new Error("network"));
    else vi.mocked(fetch).mockResolvedValueOnce(failure === "http"
      ? new Response("", { status: 503 }) : new Response("not JSON"));
    expect((await POST(request())).status).toBe(503);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it.each(["http", "network", "published", "highlighted", "malformed", "changed"])(
    "does not claim success or retry after a CMS %s failure", async (failure) => {
      vi.mocked(fetch).mockResolvedValueOnce(Response.json(verification));
      if (failure === "network") vi.mocked(fetch).mockRejectedValueOnce(new Error("timeout"));
      else if (failure === "http") vi.mocked(fetch).mockResolvedValueOnce(new Response("", { status: 403 }));
      else {
        const validated = validateEventSubmission(input);
        if ("error" in validated) throw new Error(validated.error);
        const attributes = { ...validated.data };
        const result = {
          data: { id: 99, attributes: {
            ...attributes,
            ...(failure === "published" ? { publishedAt: "2027-01-01" } : {}),
            ...(failure === "highlighted" ? { IsHighlighted: true } : {}),
            ...(failure === "changed" ? { Title: "Changed" } : {}),
          } },
        };
        vi.mocked(fetch).mockResolvedValueOnce(Response.json(failure === "malformed" ? {} : result));
      }
      const response = await POST(request());
      expect(response.status).toBe(502);
      expect(await response.json()).toMatchObject({ ok: false });
      expect(fetch).toHaveBeenCalledTimes(2);
    },
  );
});
