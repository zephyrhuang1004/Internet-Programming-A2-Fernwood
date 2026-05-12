import { useLayoutEffect, useRef, useState } from "react";
import worldSvgRaw from "../../assets/world.svg?raw";
import { fmtMoneyShort } from "../../lib/format";

/**
 * WorldMap — order/revenue bubbles over a real world map.
 *
 * The map is a MapSVG-exported SVG (one <path> per country, ISO-2 id).
 * Imported as raw string at build time and inlined via dangerouslySetInnerHTML.
 *
 * Bubble positions are read directly from each country path's bounding box
 * via getBBox() — no manual lat/lng table to maintain and no projection math
 * to keep in sync with the map. Drop in any MapSVG world map and bubbles
 * still land on the right country.
 *
 * bubbles: [{ code, name, value, revenue }]
 */

// Parse viewBox dimensions from the raw SVG header once.
const _w = worldSvgRaw.match(/\swidth="([\d.]+)"/);
const _h = worldSvgRaw.match(/\sheight="([\d.]+)"/);
const SVG_W = _w ? parseFloat(_w[1]) : 1009.6727;
const SVG_H = _h ? parseFloat(_h[1]) : 665.96301;

// Strip XML decl, comments, outer <svg> wrapper — keep just the country paths.
const COUNTRY_PATHS = worldSvgRaw
  .replace(/<\?xml[\s\S]*?\?>/g, "")
  .replace(/<!--[\s\S]*?-->/g, "")
  .replace(/<svg[\s\S]*?>/, "")
  .replace(/<\/svg>\s*$/, "")
  .trim();

// A few countries have overseas territories that pull the path bbox far from
// where the country reads visually (Alaska for US, Guiana for FR, etc.).
// Override with a hand-picked SVG xy in those cases.
const BBOX_OVERRIDE = {
  US: [220, 350], // continental US, ignoring Alaska / Hawaii
  FR: [487, 295], // metropolitan France, ignoring overseas departments
  RU: [720, 200], // visual centre, ignoring far-east stretch
  NL: [497, 273], // metropolitan Netherlands
};

export function WorldMap({ bubbles = [] }) {
  const svgRef = useRef(null);
  const [positions, setPositions] = useState({});

  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg || !bubbles.length) return;
    const next = {};
    for (const b of bubbles) {
      if (!b.code || b.code === "??") continue;
      if (BBOX_OVERRIDE[b.code]) {
        next[b.code] = BBOX_OVERRIDE[b.code];
        continue;
      }
      const path = svg.querySelector(`#${CSS.escape(b.code)}`);
      if (!path) continue;
      try {
        const box = path.getBBox();
        if (box.width > 0 && box.height > 0) {
          next[b.code] = [box.x + box.width / 2, box.y + box.height / 2];
        }
      } catch {
        // ignore unlocatable path
      }
    }
    setPositions(next);
  }, [bubbles]);

  const placed = bubbles.filter((b) => positions[b.code]);
  const [hover, setHover] = useState(null);
  const maxVal = Math.max(...placed.map((b) => b.value || 0), 1);
  const rFor = (v) => 6 + Math.sqrt(v / maxVal) * 22;

  return (
    <div style={{ width: "100%", position: "relative" }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        style={{ display: "block", aspectRatio: `${SVG_W} / ${SVG_H}` }}
      >
        {/* Country shapes — paths inherit fill/stroke from this group */}
        <g
          fill="var(--sand)"
          stroke="var(--line-2)"
          strokeWidth="0.4"
          strokeLinejoin="round"
          dangerouslySetInnerHTML={{ __html: COUNTRY_PATHS }}
        />

        {/* Bubbles — only the dots; the hover tooltip is drawn separately
           below so it always renders on top of every other bubble. */}
        {placed.map((b, i) => {
          const [x, y] = positions[b.code];
          const r = rFor(b.value || 0);
          const isH = hover === i;
          return (
            <g
              key={b.code || i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: "pointer" }}
            >
              <circle cx={x} cy={y} r={r + 6} fill="var(--clay)" opacity={isH ? 0.18 : 0.1} />
              <circle
                cx={x}
                cy={y}
                r={r}
                fill="var(--clay)"
                opacity="0.82"
                stroke="var(--bone)"
                strokeWidth="1.5"
              />
              <text
                x={x}
                y={y + 4}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill="var(--bone)"
                fontFamily="var(--f-mono)"
                style={{ pointerEvents: "none" }}
              >
                {b.value}
              </text>
            </g>
          );
        })}

        {/* Hover tooltip — drawn last so it sits above every bubble.
           Flips to the opposite side / above when near the SVG edge. */}
        {hover != null && placed[hover] && (() => {
          const b = placed[hover];
          const [x, y] = positions[b.code];
          const r = rFor(b.value || 0);
          const tipW = Math.max(120, (b.name || "").length * 7 + 60);
          const tipH = 44;
          const gap = 6;
          const padX = 10;

          // Horizontal flip: if there is not enough room on the right, draw on the left.
          const placeRight = x + r + gap + tipW <= SVG_W - 4;
          const tipX = placeRight ? x + r + gap : x - r - gap - tipW;

          // Vertical flip: keep tooltip inside the SVG vertically.
          let tipY = y - tipH / 2 - 4;
          if (tipY < 4) tipY = y + r + gap;
          if (tipY + tipH > SVG_H - 4) tipY = SVG_H - tipH - 4;

          return (
            <g style={{ pointerEvents: "none" }}>
              <rect
                x={tipX}
                y={tipY}
                width={tipW}
                height={tipH}
                rx="8"
                fill="var(--ink)"
                opacity="0.96"
              />
              <text
                x={tipX + padX}
                y={tipY + 18}
                fontSize="12"
                fill="var(--bone)"
                fontFamily="var(--f-body)"
                fontWeight="600"
              >
                {b.name}
              </text>
              <text
                x={tipX + padX}
                y={tipY + 35}
                fontSize="11"
                fill="var(--bone)"
                opacity="0.75"
                fontFamily="var(--f-mono)"
              >
                {b.value} orders · {fmtMoneyShort(b.revenue)}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
