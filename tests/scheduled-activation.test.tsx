// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useScheduledActivation } from "@/helpers/useScheduledActivation";

const START = "2026-11-08T11:00:00+01:00";
const startTime = Date.parse(START);

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(startTime - 1000);
});

describe("scheduled activation", () => {
  it("uses the Netherlands offset independently of the visitor's timezone", () => {
    expect(new Date(startTime).toISOString()).toBe("2026-11-08T10:00:00.000Z");
  });

  it("activates at the exact boundary without a reload", () => {
    const { result } = renderHook(() => useScheduledActivation(START));
    expect(result.current).toBe(false);
    act(() => vi.advanceTimersByTime(999));
    expect(result.current).toBe(false);
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(true);
  });

  it.each([null, "2026-11-01T00:00:00Z"])("activates immediately for %s", (date) => {
    expect(renderHook(() => useScheduledActivation(date)).result.current).toBe(true);
  });

  it("handles schedules beyond the browser's maximum timer delay", () => {
    const maximumDelay = 2147483647;
    vi.setSystemTime(startTime - maximumDelay - 1000);
    const { result } = renderHook(() => useScheduledActivation(START));
    act(() => vi.advanceTimersByTime(maximumDelay));
    expect(result.current).toBe(false);
    act(() => vi.advanceTimersByTime(999));
    expect(result.current).toBe(false);
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(true);
  });

  it("cancels its timer on unmount", () => {
    const { unmount } = renderHook(() => useScheduledActivation(START));
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("reschedules when the start time changes", () => {
    const { result, rerender } = renderHook(
      ({ date }) => useScheduledActivation(date),
      { initialProps: { date: START } },
    );
    rerender({ date: "2026-11-08T11:00:01+01:00" });
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toBe(false);
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toBe(true);
  });

  it("reports an invalid schedule rather than silently activating", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const preventExpectedError = (event: ErrorEvent) => event.preventDefault();
    window.addEventListener("error", preventExpectedError);
    try {
      expect(() => renderHook(() => useScheduledActivation("not-a-date")))
        .toThrow("Invalid promotion start time");
    } finally {
      window.removeEventListener("error", preventExpectedError);
    }
  });
});
