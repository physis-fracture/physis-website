import { describe, expect, it } from "vitest";
import {
  computeBoxScreenPositions,
  computeContainRect,
  parseDetectionBoxes,
} from "./viewer";

describe("parseDetectionBoxes", () => {
  it("parses a single valid box", () => {
    expect(parseDetectionBoxes([[161.47, 237.12, 206.19, 275.29, 0.9999]])).toEqual([
      { x0: 161.47, y0: 237.12, x1: 206.19, y1: 275.29, confidence: 0.9999 },
    ]);
  });

  it("parses multiple boxes without mixing coordinates", () => {
    const raw = [
      [161.47, 237.12, 206.19, 275.29, 0.9999],
      [251.11, 177.21, 275.59, 198.71, 0.9999],
    ];
    expect(parseDetectionBoxes(raw)).toEqual([
      { x0: 161.47, y0: 237.12, x1: 206.19, y1: 275.29, confidence: 0.9999 },
      { x0: 251.11, y0: 177.21, x1: 275.59, y1: 198.71, confidence: 0.9999 },
    ]);
  })

  it("returns an empty array for an empty array", () => {
    expect(parseDetectionBoxes([])).toEqual([]);
  });

  it("returns null for null", () => {
    expect(parseDetectionBoxes(null)).toBeNull();
  });

  it("rejects boxes without exactly five values", () => {
    expect(parseDetectionBoxes([[1, 2, 3, 4]])).toEqual([]);
    expect(parseDetectionBoxes([[1, 2, 3, 4, 5, 6]])).toEqual([]);
  });

  it("rejects non-finite or non-number values", () => {
    expect(parseDetectionBoxes([["a", 2, 3, 4, 0.5]])).toEqual([]);
    expect(parseDetectionBoxes([[NaN, 2, 3, 4, 0.5]])).toEqual([]);
    expect(parseDetectionBoxes([[1, Infinity, 3, 4, 0.5]])).toEqual([]);
  });

  it("rejects inverted or degenerate geometry", () => {
    expect(parseDetectionBoxes([[20, 10, 10, 20, 0.5]])).toEqual([]);
    expect(parseDetectionBoxes([[10, 20, 20, 10, 0.5]])).toEqual([]);
    expect(parseDetectionBoxes([[10, 10, 10, 20, 0.5]])).toEqual([]);
  });

  it("keeps valid boxes and drops malformed ones", () => {
    expect(
      parseDetectionBoxes([
        [161.47, 237.12, 206.19, 275.29, 0.9999],
        [1, 2, 3],
        [20, 10, 10, 20, 0.5],
      ]),
    ).toEqual([
      { x0: 161.47, y0: 237.12, x1: 206.19, y1: 275.29, confidence: 0.9999 },
    ]);
  });
});

describe("computeContainRect", () => {
  it("fills the container when the aspect ratio matches", () => {
    expect(computeContainRect(600, 600, 512, 512)).toEqual({
      left: 0,
      top: 0,
      width: 600,
      height: 600,
    });
  });

  it("height-constrains a portrait image and centers horizontally", () => {
    const rect = computeContainRect(800, 600, 512, 1024);
    expect(rect.height).toBe(600);
    expect(rect.width).toBeCloseTo(300, 6);
    expect(rect.top).toBe(0);
    expect(rect.left).toBeCloseTo(250, 6);
  });

  it("width-constrains a landscape image and centers vertically", () => {
    const rect = computeContainRect(800, 300, 1024, 512);
    expect(rect.width).toBeCloseTo(600, 6);
    expect(rect.height).toBe(300);
    expect(rect.left).toBeCloseTo(100, 6);
    expect(rect.top).toBe(0);
  });

  it("derives the scale from the natural dimensions without hardcoding", () => {
    expect(computeContainRect(600, 600, 800, 400)).toEqual({
      left: 0,
      top: 150,
      width: 600,
      height: 300,
    });
    expect(computeContainRect(600, 600, 400, 800)).toEqual({
      left: 150,
      top: 0,
      width: 300,
      height: 600,
    });
  });

  it("returns a zeroed rect instead of NaN for degenerate inputs", () => {
    expect(computeContainRect(0, 600, 512, 512)).toEqual({
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    });
    expect(computeContainRect(600, 600, 0, 512)).toEqual({
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    });
  });
});

describe("computeBoxScreenPositions", () => {
  const box = { x0: 100, y0: 100, x1: 200, y1: 200, confidence: 0.99 };

  it("maps a box top-left into container coordinates at identity transform", () => {
    const rect = { left: 0, top: 0, width: 500, height: 500 };
    expect(
      computeBoxScreenPositions({
        boxes: [box],
        rect,
        naturalWidth: 1000,
        naturalHeight: 1000,
        scale: 1,
        pan: { x: 0, y: 0 },
      }),
    ).toEqual([{ x: 50, y: 50, confidence: 0.99 }]);
  });

  it("scales about the wrapper center on zoom", () => {
    const rect = { left: 0, top: 0, width: 500, height: 500 };
    expect(
      computeBoxScreenPositions({
        boxes: [box],
        rect,
        naturalWidth: 1000,
        naturalHeight: 1000,
        scale: 2,
        pan: { x: 0, y: 0 },
      }),
    ).toEqual([{ x: -150, y: -150, confidence: 0.99 }]);
  });

  it("applies pan after zoom", () => {
    const rect = { left: 0, top: 0, width: 500, height: 500 };
    expect(
      computeBoxScreenPositions({
        boxes: [box],
        rect,
        naturalWidth: 1000,
        naturalHeight: 1000,
        scale: 2,
        pan: { x: 30, y: 10 },
      }),
    ).toEqual([{ x: -120, y: -140, confidence: 0.99 }]);
  });

  it("accounts for letterboxing offsets in non-matching aspect ratios", () => {
    const rect = { left: 0, top: 125, width: 500, height: 250 };
    expect(
      computeBoxScreenPositions({
        boxes: [box],
        rect,
        naturalWidth: 1000,
        naturalHeight: 500,
        scale: 1,
        pan: { x: 0, y: 0 },
      }),
    ).toEqual([{ x: 50, y: 175, confidence: 0.99 }]);
  });

  it("keeps the wrapper center fixed under zoom", () => {
    const rect = { left: 0, top: 0, width: 500, height: 500 };
    const centered = { x0: 250, y0: 250, x1: 260, y1: 260, confidence: 0.5 };
    const base = computeBoxScreenPositions({
      boxes: [centered],
      rect,
      naturalWidth: 500,
      naturalHeight: 500,
      scale: 1,
      pan: { x: 0, y: 0 },
    });
    const zoomed = computeBoxScreenPositions({
      boxes: [centered],
      rect,
      naturalWidth: 500,
      naturalHeight: 500,
      scale: 3,
      pan: { x: 0, y: 0 },
    });
    expect(base[0]).toEqual({ x: 250, y: 250, confidence: 0.5 });
    expect(zoomed[0]).toEqual({ x: 250, y: 250, confidence: 0.5 });
  });
});
