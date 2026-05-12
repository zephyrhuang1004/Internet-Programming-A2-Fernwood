import { useEffect, useRef, useState } from "react";
import { fmtMoneyShort, fmtDay } from "../../lib/format";

/**
 * data: [{ date: "YYYY-MM-DD", revenue: number }]
 */
export function AreaChart({ data = [], height = 240 }) {
  const ref = useRef(null);
  const [w, setW] = useState(600);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      setW(Math.floor(entries[0].contentRect.width));
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  const padL = 44, padR = 16, padT = 16, padB = 28;
  const innerW = Math.max(10, w - padL - padR);
  const innerH = height - padT - padB;
  const safe = data.length > 0 ? data : [{ date: "", revenue: 0 }];
  const max = Math.max(...safe.map((d) => d.revenue || 0), 1);
  const yMax = Math.max(1000, Math.ceil(max / 1000) * 1000);
  const step = innerW / Math.max(1, safe.length - 1);

  const pts = safe.map((d, i) => [
    padL + i * step,
    padT + innerH - ((d.revenue || 0) / yMax) * innerH,
  ]);
  const line = pts
    .map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1))
    .join(" ");
  const area = line + ` L${padL + innerW},${padT + innerH} L${padL},${padT + innerH} Z`;

  const [hover, setHover] = useState(null);
  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < padL || x > padL + innerW) return setHover(null);
    const i = Math.round((x - padL) / step);
    if (i >= 0 && i < safe.length) setHover(i);
  };

  const yTicks = [0, 0.5, 1].map((t) => ({
    y: padT + innerH - t * innerH,
    v: Math.round(yMax * t),
  }));
  const xIdx = [
    0,
    Math.floor(safe.length * 0.25),
    Math.floor(safe.length * 0.5),
    Math.floor(safe.length * 0.75),
    safe.length - 1,
  ].filter((v, i, arr) => arr.indexOf(v) === i);

  return (
    <div ref={ref} style={{ width: "100%" }}>
      <svg
        width={w}
        height={height}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        style={{ display: "block", cursor: "crosshair" }}
      >
        <defs>
          <linearGradient id="areaClay" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--clay)" stopOpacity="0.32" />
            <stop offset="100%" stopColor="var(--clay)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={padL} x2={padL + innerW} y1={t.y} y2={t.y} stroke="var(--line)" strokeDasharray="2 4" />
            <text
              x={padL - 8}
              y={t.y + 4}
              textAnchor="end"
              fontFamily="var(--f-mono)"
              fontSize="10"
              fill="var(--ink-mute)"
            >
              {fmtMoneyShort(t.v)}
            </text>
          </g>
        ))}
        {xIdx.map((i) => (
          <text
            key={i}
            x={padL + i * step}
            y={height - 8}
            textAnchor="middle"
            fontFamily="var(--f-mono)"
            fontSize="10"
            fill="var(--ink-mute)"
          >
            {safe[i]?.date ? fmtDay(safe[i].date) : ""}
          </text>
        ))}
        <path d={area} fill="url(#areaClay)" />
        <path
          d={line}
          stroke="var(--clay)"
          strokeWidth="1.8"
          fill="none"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {hover != null && pts[hover] && (
          <g>
            <line
              x1={pts[hover][0]}
              x2={pts[hover][0]}
              y1={padT}
              y2={padT + innerH}
              stroke="var(--ink)"
              strokeOpacity="0.15"
            />
            <circle
              cx={pts[hover][0]}
              cy={pts[hover][1]}
              r="4"
              fill="var(--bone)"
              stroke="var(--clay)"
              strokeWidth="2"
            />
          </g>
        )}
      </svg>
      {hover != null && safe[hover] && (
        <div className="chart-tip">
          <span className="mono muted">{fmtDay(safe[hover].date)}</span>
          <strong>{fmtMoneyShort(safe[hover].revenue)}</strong>
        </div>
      )}
    </div>
  );
}
