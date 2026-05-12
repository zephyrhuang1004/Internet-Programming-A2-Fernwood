import { useEffect, useRef, useState } from "react";

export function Sparkline({ values = [], height = 56, color = "var(--moss)" }) {
  const ref = useRef(null);
  const [w, setW] = useState(240);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      setW(Math.floor(entries[0].contentRect.width));
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  const safe = values.length > 0 ? values : [0];
  const max = Math.max(...safe, 1);
  const step = w / Math.max(1, safe.length - 1);
  const pts = safe.map((v, i) => [
    i * step,
    height - 6 - ((v || 0) / max) * (height - 14),
  ]);
  const line = pts
    .map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1))
    .join(" ");
  const area = line + ` L${w},${height} L0,${height} Z`;
  return (
    <div ref={ref} style={{ width: "100%" }}>
      <svg width={w} height={height} style={{ display: "block" }}>
        <defs>
          <linearGradient id="sparkMoss" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#sparkMoss)" />
        <path d={line} stroke={color} strokeWidth="1.6" fill="none" strokeLinejoin="round" strokeLinecap="round" />
        {pts.length > 0 && (
          <circle
            cx={pts[pts.length - 1][0]}
            cy={pts[pts.length - 1][1]}
            r="3"
            fill={color}
          />
        )}
      </svg>
    </div>
  );
}
