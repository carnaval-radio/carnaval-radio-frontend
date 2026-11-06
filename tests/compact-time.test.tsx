// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DateAndTime from "@/components/DateAndTime";

beforeEach(() => vi.useFakeTimers());

describe("compact played-song time", () => {
  it("shows only the time for today's songs", () => {
    vi.setSystemTime(new Date(2026, 10, 8, 12));
    render(<DateAndTime timestamp={new Date(2026, 10, 8, 10, 11).getTime()} compact />);
    expect(screen.getByText("10:11")).toBeInTheDocument();
    expect(screen.queryByText(/Vandaag/)).not.toBeInTheDocument();
  });

  it.each([
    [new Date(2026, 11, 1, 12), new Date(2026, 10, 30, 23, 59)],
    [new Date(2027, 0, 1, 12), new Date(2026, 11, 31, 23, 59)],
  ])("keeps yesterday distinguishable across month/year boundaries", (now, songTime) => {
    vi.setSystemTime(now);
    render(<DateAndTime timestamp={songTime.getTime()} compact />);
    expect(screen.getByText("Gisteren 23:59")).toBeInTheDocument();
  });

  it("retains a short date for older songs", () => {
    vi.setSystemTime(new Date(2026, 10, 8, 12));
    const songTime = new Date(2026, 10, 3, 10, 11);
    render(<DateAndTime timestamp={songTime.getTime()} compact />);
    expect(screen.getByText(songTime.toLocaleString("nl-NL", {
      hour: "numeric", minute: "numeric", day: "numeric", month: "short",
    }))).toBeInTheDocument();
  });

  it("preserves time-only output for the dense homepage mode", () => {
    vi.setSystemTime(new Date(2026, 10, 8, 12));
    render(<DateAndTime timestamp={new Date(2026, 10, 3, 10, 11).getTime()} compact dense />);
    expect(screen.getByText("10:11")).toBeInTheDocument();
  });

  it("preserves the noncompact label used by other surfaces", () => {
    vi.setSystemTime(new Date(2026, 10, 8, 12));
    render(<DateAndTime timestamp={new Date(2026, 10, 8, 10, 11).getTime()} />);
    expect(screen.getByText("Vandaag om")).toBeInTheDocument();
  });
});
