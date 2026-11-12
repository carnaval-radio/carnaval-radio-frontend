// @vitest-environment jsdom

import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MobileHeader from "@/components/MobileHeader";
import { notificationData, type NotificationData } from "@/data/notificationData";

vi.mock("@/components/Sidebar/SidebarPlayer", () => ({ default: () => null }));
vi.mock("@/components/Socials", () => ({ default: () => null }));
vi.mock("@/components/MobileChromecast", () => ({ default: () => null }));
vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
vi.mock("@/data/notificationData", () => ({
  notificationData: {
    enabled: true,
    nudgeEnabled: true,
    startsAt: "2026-11-08T10:45:00+01:00",
    delay: 15000,
    title: "Test ticket promotion",
    message: "Test event details",
    buttonText: "Koop nu je tickets",
    buttonLink: "https://entrii.shop/carnaval-radio#",
    openInNewTab: true,
    showAgainAfterDays: 5,
  } satisfies NotificationData,
}));

const startTime = Date.parse("2026-11-08T10:45:00+01:00");
const themeData = {
  attributes: {
    Logo: { data: { attributes: { url: "https://res.cloudinary.com/test/image/upload/logo.png" } } },
  },
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(startTime - 1000);
  notificationData.nudgeEnabled = true;
});

describe("mobile promotion integration", () => {
  it("mounts the ticket icon only when the schedule activates", () => {
    render(<MobileHeader themeData={themeData} menu={[]} />);
    expect(screen.queryByRole("link", { name: /Koop nu je tickets/ })).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(999));
    expect(screen.queryByRole("link", { name: /Koop nu je tickets/ })).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole("link", { name: /Koop nu je tickets/ }))
      .toHaveAttribute("href", notificationData.buttonLink);
    expect(screen.getByAltText("Logo").parentElement).toHaveClass("shrink-0");
    expect(screen.getByAltText("Logo")).toHaveStyle({ width: "120px" });
  });

  it("leaves the disabled nudge hidden after the schedule activates", () => {
    notificationData.nudgeEnabled = false;
    render(<MobileHeader themeData={themeData} menu={[]} />);
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.queryByRole("link", { name: /Koop nu je tickets/ })).not.toBeInTheDocument();
  });
});
