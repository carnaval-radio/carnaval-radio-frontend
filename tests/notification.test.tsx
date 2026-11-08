// @vitest-environment jsdom

import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Notification from "@/components/Notification";
import { notificationData, type NotificationData } from "@/data/notificationData";

vi.mock("@/data/notificationData", () => ({
  notificationData: {
    enabled: true,
    nudgeEnabled: true,
    startsAt: "2026-11-08T11:00:00+01:00",
    delay: 15000,
    title: "Test ticket promotion",
    message: "Test event details",
    buttonText: "Koop nu je tickets",
    buttonLink: "https://entrii.shop/carnaval-radio#",
    openInNewTab: true,
    iconType: "success",
    showAgainAfterDays: 5,
  } satisfies NotificationData,
}));

const startTime = Date.parse("2026-11-08T11:00:00+01:00");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(startTime);
  Object.assign(notificationData, {
    enabled: true,
    startsAt: "2026-11-08T11:00:00+01:00",
    openInNewTab: true,
    iconType: "success",
    showAgainAfterDays: 5,
  });
});

function advance(milliseconds = 15000) {
  act(() => vi.advanceTimersByTime(milliseconds));
}

describe("ticket notification", () => {
  it("waits until activation, then observes the full popup delay", () => {
    vi.setSystemTime(startTime - 1000);
    render(<Notification />);
    advance(999);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(localStorage.getItem("notification_last_shown")).toBeNull();
    advance(1);
    advance(14999);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    advance(1);
    expect(screen.getByRole("heading")).toHaveTextContent(notificationData.title);
    expect(screen.getByText(notificationData.message)).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("notification_last_shown")!))
      .toBe(startTime + 15000);
  });

  it("starts the delay on arrival after the scheduled time", () => {
    vi.setSystemTime(startTime + 3600000);
    render(<Notification />);
    advance(14999);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    advance(1);
    expect(screen.getByRole("heading")).toBeInTheDocument();
  });

  it("does not schedule or mark a disabled notification as shown", () => {
    notificationData.enabled = false;
    render(<Notification />);
    advance();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(localStorage.getItem("notification_last_shown")).toBeNull();
  });

  it("opens the shop directly in a safe new tab and closes on click", () => {
    render(<Notification />);
    advance();
    const link = screen.getByRole("link", { name: notificationData.buttonText });
    expect(link).toHaveAttribute("href", notificationData.buttonLink);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    fireEvent.click(link);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it.each(["Sluit", "Sluiten"])("closes with the %s button", (name) => {
    render(<Notification />);
    advance();
    fireEvent.click(screen.getByRole("button", { name }));
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("respects same-tab configuration", () => {
    notificationData.openInNewTab = false;
    render(<Notification />);
    advance();
    expect(screen.getByRole("link")).not.toHaveAttribute("target");
  });

  it.each([
    [5 * 86400000 - 1, false],
    [5 * 86400000, true],
  ])("checks the five-day repeat boundary at %i ms", (elapsed, visible) => {
    localStorage.setItem("notification_last_shown", JSON.stringify(startTime - elapsed));
    render(<Notification />);
    advance();
    expect(Boolean(screen.queryByRole("heading"))).toBe(visible);
  });

  it("never repeats when the repeat interval is null", () => {
    notificationData.showAgainAfterDays = null;
    localStorage.setItem("notification_last_shown", JSON.stringify(startTime - 30 * 86400000));
    render(<Notification />);
    advance();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("does not leave the popup timer running after unmount", () => {
    const { unmount } = render(<Notification />);
    unmount();
    advance();
    expect(localStorage.getItem("notification_last_shown")).toBeNull();
  });

  it.each(["success", "info", "warning", undefined] as const)(
    "renders with the %s icon setting",
    (iconType) => {
      notificationData.iconType = iconType;
      render(<Notification />);
      advance();
      expect(screen.getByRole("heading")).toBeInTheDocument();
    },
  );
});
