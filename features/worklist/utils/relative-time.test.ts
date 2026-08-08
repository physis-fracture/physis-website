import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { formatRelativeTime } from "./relative-time";

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-08T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders minutes below one hour", () => {
    expect(formatRelativeTime("2026-08-08T11:50:00.000Z")).toBe("10m");
  });

  it("renders hours and minutes (17h 51m)", () => {
    expect(formatRelativeTime("2026-08-07T18:09:00.000Z")).toBe("17h 51m");
  });

  it("renders days and hours above 24h", () => {
    expect(formatRelativeTime("2026-08-06T10:00:00.000Z")).toBe("2d 2h");
  });

  it("is meant to be displayed with an explicit 'ago' suffix", () => {
    expect(`${formatRelativeTime("2026-08-07T18:09:00.000Z")} ago`).toBe(
      "17h 51m ago",
    );
  });
});
