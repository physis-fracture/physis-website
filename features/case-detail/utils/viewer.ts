export type DetectionBox = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  confidence: number;
};

/**
 * Parse backend detection boxes near the UI boundary.
 *
 * Boxes arrive as `[x0, y0, x1, y1, confidence]` in the original image pixel
 * coordinate system. The value crosses a JSON trust boundary and the inference
 * schema only validates `number[][]`, so validate defensively here:
 * exactly five finite numbers and non-inverted geometry.
 *
 * Returns `null` when localization is unavailable, otherwise the parsed boxes
 * with malformed entries dropped.
 */
export function parseDetectionBoxes(raw: unknown): DetectionBox[] | null {
  if (!Array.isArray(raw)) return null;

  const boxes: DetectionBox[] = [];
  for (const entry of raw) {
    if (!Array.isArray(entry) || entry.length !== 5) continue;

    const [x0, y0, x1, y1, confidence] = entry;
    const values = [x0, y0, x1, y1, confidence];
    if (!values.every((value) => typeof value === "number" && Number.isFinite(value))) {
      continue;
    }
    if (x1 <= x0 || y1 <= y0) continue;

    boxes.push({ x0, y0, x1, y1, confidence });
  }
  return boxes;
}

export type ContainRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

/**
 * Compute the CSS `object-fit: contain` rectangle for an image with the given
 * natural dimensions inside a container. The image and its SVG overlay share
 * exactly this rectangle, so backend pixel coordinates map 1:1 through the
 * SVG viewBox.
 */
export function computeContainRect(
  containerWidth: number,
  containerHeight: number,
  naturalWidth: number,
  naturalHeight: number,
): ContainRect {
  if (
    containerWidth <= 0 ||
    containerHeight <= 0 ||
    naturalWidth <= 0 ||
    naturalHeight <= 0
  ) {
    return { left: 0, top: 0, width: 0, height: 0 };
  }

  const scale = Math.min(
    containerWidth / naturalWidth,
    containerHeight / naturalHeight,
  );
  const width = naturalWidth * scale;
  const height = naturalHeight * scale;

  return {
    left: (containerWidth - width) / 2,
    top: (containerHeight - height) / 2,
    width,
    height,
  };
}

export type BoxScreenPosition = {
  x: number;
  y: number;
  confidence: number;
};

/**
 * Map each box's top-left corner from original image pixel coordinates into
 * container pixels, replicating the viewer's CSS transform
 * `translate(pan) scale(scale)` about the wrapper center. The SVG rects live
 * inside the transformed wrapper, so they stay glued to the image; confidence
 * labels live outside it and must be repositioned manually to match. Font
 * sizes on labels stay fixed, so the label keeps a constant screen size under
 * zoom.
 */
export function computeBoxScreenPositions({
  boxes,
  rect,
  naturalWidth,
  naturalHeight,
  scale,
  pan,
}: {
  boxes: DetectionBox[];
  rect: ContainRect;
  naturalWidth: number;
  naturalHeight: number;
  scale: number;
  pan: { x: number; y: number };
}): BoxScreenPosition[] {
  const sx = rect.width / naturalWidth;
  const sy = rect.height / naturalHeight;
  const cx = rect.width / 2;
  const cy = rect.height / 2;

  return boxes.map((box) => {
    const wx = box.x0 * sx;
    const wy = box.y0 * sy;
    return {
      x: rect.left + pan.x + cx + (wx - cx) * scale,
      y: rect.top + pan.y + cy + (wy - cy) * scale,
      confidence: box.confidence,
    };
  });
}
