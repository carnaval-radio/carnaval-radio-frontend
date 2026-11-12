// @vitest-environment jsdom

import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TicketNudge from "@/components/TicketNudge";
import { notificationData } from "@/data/notificationData";

beforeEach(() => vi.useFakeTimers());

describe("mobile ticket nudge", () => {
  it("uses the configured event and shop link", () => {
    render(<TicketNudge />);
    const link = screen.getByRole("link", {
      name: `${notificationData.buttonText}: ${notificationData.title}`,
    });
    expect(link).toHaveAttribute("href", notificationData.buttonLink);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveAttribute("title", notificationData.title);
    expect(screen.getByRole("img").parentElement).toHaveStyle({
      width: "64px",
      height: "32px",
    });
  });

  it("bounces after seven seconds for two seconds, then every five minutes", () => {
    render(<TicketNudge />);
    const icon = screen.getByRole("img").parentElement;
    expect(icon).not.toHaveClass("animate-bounce");
    act(() => vi.advanceTimersByTime(6999));
    expect(icon).not.toHaveClass("animate-bounce");
    act(() => vi.advanceTimersByTime(1));
    expect(icon).toHaveClass("animate-bounce");
    act(() => vi.advanceTimersByTime(2000));
    expect(icon).not.toHaveClass("animate-bounce");
    act(() => vi.advanceTimersByTime(298000));
    expect(icon).toHaveClass("animate-bounce");
  });

  it("cancels the initial timer on unmount", () => {
    const { unmount } = render(<TicketNudge />);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("cancels all timers when unmounted during a bounce", () => {
    const { unmount } = render(<TicketNudge />);
    act(() => vi.advanceTimersByTime(7000));
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
