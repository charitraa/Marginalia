import { useId } from "react";
import type { DailyCount } from "../types";

/**
 * Views per day, drawn as an inline SVG area chart.
 *
 * Hand-rolled rather than pulled from a charting library: it is one series of
 * at most a year of points, and the whole thing is smaller than the library's
 * import would be. It inherits `currentColor`, so it themes for free.
 */
export default function ViewsChart({
  data,
  height = 160,
  label = "Views per day",
}: {
  data: DailyCount[];
  height?: number;
  label?: string;
}) {
  const gradientId = useId();

  if (data.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">No data yet.</p>
    );
  }

  const width = 600;
  const peak = Math.max(...data.map((entry) => entry.count), 1);
  const step = data.length > 1 ? width / (data.length - 1) : width;

  const points = data.map((entry, index) => {
    const x = index * step;
    // Leave a little headroom so the peak does not touch the top edge.
    const y = height - (entry.count / peak) * (height - 8);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const line = `M ${points.join(" L ")}`;
  const area = `${line} L ${width},${height} L 0,${height} Z`;
  const total = data.reduce((sum, entry) => sum + entry.count, 0);

  return (
    <figure className="text-primary">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="h-40 w-full"
        role="img"
        aria-label={`${label}: ${total} in the last ${data.length} days, peaking at ${peak}.`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${gradientId})`} />
        <path
          d={line}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <figcaption className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{data[0]?.date}</span>
        <span>peak {peak}</span>
        <span>{data[data.length - 1]?.date}</span>
      </figcaption>
    </figure>
  );
}
