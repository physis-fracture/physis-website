import { describe, expect, it } from "vitest";
import { formatLatency, formatPercent } from "./format";

describe("formatLatency", () => {
  it("formats seconds with one decimal", () => {
    expect(formatLatency(6287)).toBe("6.3 s");
  });

  it("keeps sub-second values in milliseconds", () => {
    expect(formatLatency(850)).toBe("850 ms");
  });
});

describe("formatPercent", () => {
  it("keeps one decimal", () => {
    expect(formatPercent(98.44)).toBe("98.4%");
  });
});
