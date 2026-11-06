import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

vi.mock("client-only", () => ({}));

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(() => {
    throw new Error("Unexpected network request: mock fetch in this test.");
  }));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  if (typeof localStorage !== "undefined") {
    localStorage.clear();
  }
});
