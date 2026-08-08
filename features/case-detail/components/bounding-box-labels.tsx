import { BoxScreenPosition } from "../utils/viewer";

const LABEL_GAP = 4;

export function BoundingBoxLabels({
  positions,
  transition,
}: {
  positions: BoxScreenPosition[];
  transition: string;
}) {
  if (positions.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0">
      {positions.map((position, index) => (
        <span
          key={index}
          className="absolute left-0 top-0 whitespace-nowrap rounded-sm bg-black/55 px-1 py-0.5 text-xs font-medium leading-none text-white tabular-nums"
          style={{
            transform: `translate(${position.x}px, ${position.y - LABEL_GAP}px) translateY(-100%)`,
            transition,
          }}
        >
          {position.confidence.toFixed(3)}
        </span>
      ))}
    </div>
  );
}
