import { beforeEach, describe, expect, it, vi } from "vitest";
import { BlobNotFoundError, get, head, put } from "@vercel/blob";
import { DynamicServerError } from "next/dist/client/components/hooks-server-context";
import { loadSocialSnapshot, saveSocialSnapshot } from "@/GlobalState/ApiCalls/socialSnapshots";

vi.mock("@vercel/blob", async (importOriginal) => ({
  ...await importOriginal<typeof import("@vercel/blob")>(),
  get: vi.fn(), head: vi.fn(), put: vi.fn(),
}));
vi.mock("next/cache", () => ({ unstable_cache: (fn: () => unknown) => fn }));

const posts = [{ id: "post", message: "Saved" }];
const blobResponse = (snapshot: unknown) => ({
  statusCode: 200 as const,
  stream: new Response(JSON.stringify(snapshot)).body!,
  headers: new Headers(),
  blob: {
    url: "/snapshot", downloadUrl: "/snapshot", pathname: "snapshot",
    contentType: "application/json", contentDisposition: "", cacheControl: "",
    etag: "etag", size: 100, uploadedAt: new Date(),
  },
});

beforeEach(() => {
  vi.stubEnv("BLOB_READ_WRITE_TOKEN", "fake-private-blob-token");
  vi.stubEnv("VERCEL_ENV", "production");
  vi.mocked(head).mockRejectedValue(new BlobNotFoundError());
});

describe("durable social snapshots", () => {
  it("is optional and makes no Blob requests without configuration", async () => {
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");
    await saveSocialSnapshot("Facebook", "page", "query", posts);
    expect(await loadSocialSnapshot("Facebook", "page", "query")).toBeNull();
    expect(put).not.toHaveBeenCalled();
    expect(get).not.toHaveBeenCalled();
    expect(head).not.toHaveBeenCalled();
  });

  it("overwrites one private snapshot with no credentials in its body or pathname", async () => {
    await saveSocialSnapshot("Facebook", "page", "query", posts);
    const [path, body, options] = vi.mocked(put).mock.calls[0];
    expect(path).toMatch(/^social-feeds\/v1\/production\/facebook\/[a-f0-9]{64}\.json$/);
    expect(JSON.parse(String(body))).toEqual({ version: 1, savedAt: expect.any(String), posts });
    expect(String(body)).not.toContain("fake-private-blob-token");
    expect(options).toMatchObject({
      access: "private", token: "fake-private-blob-token", allowOverwrite: false,
      addRandomSuffix: false, contentType: "application/json", cacheControlMaxAge: 60,
    });
  });

  it("skips recent snapshots and writes at the exact 24-hour boundary", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-07T20:00:00Z"));
    const metadata = {
      ...blobResponse({}).blob, contentType: "application/json", size: 100,
      uploadedAt: new Date("2026-11-06T20:00:00.001Z"),
    };
    vi.mocked(head).mockResolvedValue(metadata);
    await saveSocialSnapshot("Facebook", "page", "query", posts);
    expect(put).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    await saveSocialSnapshot("Facebook", "page", "query", posts);
    expect(put).toHaveBeenCalledExactlyOnceWith(
      expect.any(String), expect.any(String),
      expect.objectContaining({ allowOverwrite: true, ifMatch: "etag" }),
    );
  });

  it("does not overwrite snapshots when the metadata check fails", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(head).mockRejectedValue(new Error("Storage unavailable"));
    await saveSocialSnapshot("Facebook", "page", "query", posts);
    expect(put).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith("Facebook snapshot write failed:", "Error");
  });

  it("keeps paths stable across token changes but separates accounts, queries and environments", async () => {
    await saveSocialSnapshot("Facebook", "page", "query", posts);
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "rotated-blob-token");
    await saveSocialSnapshot("Facebook", "page", "query", posts);
    await saveSocialSnapshot("Facebook", "other-page", "query", posts);
    await saveSocialSnapshot("Instagram", "page", "query", posts);
    await saveSocialSnapshot("Facebook", "page", "other-query", posts);
    vi.stubEnv("VERCEL_ENV", "preview");
    await saveSocialSnapshot("Facebook", "page", "query", posts);
    vi.stubEnv("VERCEL_ENV", undefined);
    await saveSocialSnapshot("Facebook", "page", "query", posts);
    const paths = vi.mocked(put).mock.calls.map(([path]) => path);
    expect(paths[0]).toBe(paths[1]);
    expect(new Set(paths).size).toBe(6);
    expect(paths[5]).toContain("/preview/");
    expect(paths[6]).toContain("/development/");
  });

  it("reads the latest snapshot including a successful empty feed", async () => {
    vi.mocked(get).mockResolvedValue(blobResponse({
      version: 1, savedAt: "2026-11-06T20:00:00Z", posts,
    }));
    expect(await loadSocialSnapshot("Facebook", "page", "query")).toEqual(posts);
    expect(get).toHaveBeenCalledWith(expect.any(String), {
      token: "fake-private-blob-token", access: "private", useCache: false,
    });
    vi.mocked(get).mockResolvedValue(blobResponse({
      version: 1, savedAt: "2026-11-06T20:00:00Z", posts: [],
    }));
    expect(await loadSocialSnapshot("Facebook", "page", "query")).toEqual([]);
  });

  it("reports missing snapshots", async () => {
    const log = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.mocked(get).mockResolvedValue(null);
    expect(await loadSocialSnapshot("Facebook", "page", "query")).toBeNull();
    expect(log).toHaveBeenCalledWith("Facebook snapshot not found.");
  });

  it.each([
    null, {}, { version: 2 }, { version: 1 },
    { version: 1, savedAt: 42 },
    { version: 1, savedAt: "invalid" },
    { version: 1, savedAt: "2026-11-06T20:00:00Z" },
    { version: 1, savedAt: "2026-11-06T20:00:00Z", posts: "invalid" },
  ])("rejects malformed snapshots (%j)", async (snapshot) => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(get).mockResolvedValue(blobResponse(snapshot));
    expect(await loadSocialSnapshot("Facebook", "page", "query")).toBeNull();
    expect(log).toHaveBeenCalledWith("Facebook snapshot read failed:", "Error");
  });

  it("reports storage failures without exposing error messages or credentials", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(put).mockRejectedValue(new Error("fake-private-blob-token"));
    vi.mocked(get).mockRejectedValue(new Error("fake-private-blob-token"));
    await saveSocialSnapshot("Facebook", "page", "query", posts);
    expect(await loadSocialSnapshot("Facebook", "page", "query")).toBeNull();
    expect(log).toHaveBeenCalledWith("Facebook snapshot write failed:", "Error");
    expect(log).toHaveBeenCalledWith("Facebook snapshot read failed:", "Error");
    expect(JSON.stringify(log.mock.calls)).not.toContain("fake-private-blob-token");
  });

  it("preserves Next dynamic-rendering signals", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const bailout = new DynamicServerError("static generation bailout");
    vi.mocked(put).mockRejectedValue(bailout);
    vi.mocked(get).mockRejectedValue(bailout);
    await expect(saveSocialSnapshot("Facebook", "page", "query", posts)).rejects.toBe(bailout);
    await expect(loadSocialSnapshot("Facebook", "page", "query")).rejects.toBe(bailout);
    expect(log).not.toHaveBeenCalled();
  });
});
