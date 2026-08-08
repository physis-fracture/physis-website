import { DetectionBox } from "../utils/viewer";

const BOX_COLOR = "#22d3ee";

export function BoundingBoxOverlay({
  boxes,
  naturalWidth,
  naturalHeight,
  imageId,
}: {
  boxes: DetectionBox[];
  naturalWidth: number;
  naturalHeight: number;
  imageId: string;
}) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox={`0 0 ${naturalWidth} ${naturalHeight}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {boxes.map((box, index) => (
        <g key={`${imageId}-${index}`}>
          <rect
            x={box.x0}
            y={box.y0}
            width={box.x1 - box.x0}
            height={box.y1 - box.y0}
            fill="none"
            stroke={BOX_COLOR}
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
        </g>
      ))}
    </svg>
  );
}
