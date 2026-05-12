import { useEffect, useRef, useState } from "react";

/**
 * rows: [{ label, value, display? }]
 * total (optional): if provided, % is shown next to each bar
 * colorFor: function (row, i) → color (defaults to var(--clay))
 */
export function HBar({ rows = [], total, colorFor }) {
  const rowH = 34, gap = 10;
  const ref = useRef(null);
  const [w, setW] = useState(480);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      setW(Math.floor(entries[0].contentRect.width));
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  // Tight padL on narrow cards (Top categories label "Rugs & Textiles" = ~13ch ≈ 95px).
  // Reserve right gutter for the value label.
  const padL = w < 380 ? 96 : 110;
  const padR = w < 380 ? 90 : 110;
  const innerW = Math.max(40, w - padL - padR);
  const svgH = Math.max(1, rows.length) * (rowH + gap);
  const max = Math.max(...rows.map((r) => r.value || 0), 1);

  return (
    <div ref={ref} style={{ width: "100%" }}>
      <svg width={w} height={svgH} style={{ display: "block" }}>
        {rows.map((r, i) => {
          const y = i * (rowH + gap);
          const barW = ((r.value || 0) / max) * innerW;
          const color = colorFor ? colorFor(r, i) : "var(--clay)";
          const pct = total ? Math.round(((r.value || 0) / total) * 100) : 0;
          return (
            <g key={r.label || i}>
              <text
                x={padL - 12}
                y={y + rowH / 2 + 4}
                textAnchor="end"
                fontSize="13"
                fill="var(--ink)"
                fontFamily="var(--f-body)"
              >
                {r.label}
              </text>
              <rect x={padL} y={y + 6} width={innerW} height={rowH - 12} rx="6" fill="var(--sand)" opacity="0.6" />
              <rect x={padL} y={y + 6} width={barW} height={rowH - 12} rx="6" fill={color} />
              <text
                x={padL + Math.max(barW, 0) + 10}
                y={y + rowH / 2 + 4}
                fontSize="12"
                fill="var(--ink-2)"
                fontFamily="var(--f-mono)"
              >
                {r.display ?? r.value}
                {total ? ` · ${pct}%` : ""}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
