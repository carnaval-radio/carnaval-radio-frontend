// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RefreshPage from "@/app/refresh/page";
import refresh from "@/app/refresh/actions";

vi.mock("@/app/fonts/font", () => ({ Indie: { className: "test-font" } }));
vi.mock("@/app/refresh/actions", () => ({ default: vi.fn() }));

beforeEach(() => vi.stubEnv("VALID_TOKEN", "test-refresh-token"));

describe("refresh page", () => {
  it.each([undefined, "wrong-token", ["test-refresh-token"]])(
    "refuses a missing, incorrect or repeated token (%s)",
    async (token) => {
      render(await RefreshPage({ searchParams: { token } }));
      expect(screen.getByRole("heading")).toHaveTextContent("Niet toegestaan");
      expect(refresh).not.toHaveBeenCalled();
    },
  );

  it("splits comma-separated tags after authenticating", async () => {
    render(await RefreshPage({
      searchParams: { token: "test-refresh-token", tags: "/,navigation" },
    }));
    expect(refresh).toHaveBeenCalledExactlyOnceWith(["/", "navigation"]);
    expect(screen.getByRole("heading")).toHaveTextContent("Gelukt");
  });

  it("passes repeated tags and defaults to the full refresh when omitted", async () => {
    const first = render(await RefreshPage({
      searchParams: { token: "test-refresh-token", tags: ["/", "navigation"] },
    }));
    expect(refresh).toHaveBeenLastCalledWith(["/", "navigation"]);
    first.unmount();
    render(await RefreshPage({ searchParams: { token: "test-refresh-token" } }));
    expect(refresh).toHaveBeenLastCalledWith([]);
  });

  it("denies requests when the server token is not configured", async () => {
    vi.stubEnv("VALID_TOKEN", undefined);
    render(await RefreshPage({ searchParams: {} }));
    expect(screen.getByRole("heading")).toHaveTextContent("Niet toegestaan");
    expect(refresh).not.toHaveBeenCalled();
  });

  it("does not display success if refreshing fails", async () => {
    vi.mocked(refresh).mockRejectedValueOnce(new Error("Refresh failed"));
    await expect(RefreshPage({ searchParams: { token: "test-refresh-token" } }))
      .rejects.toThrow("Refresh failed");
    expect(screen.queryByText("Gelukt")).not.toBeInTheDocument();
  });
});
