import { useEffect, useMemo, useState } from "react";
import { analytics } from "../../services/adminService";
import { KpiCard } from "../../components/admin/KpiCard";
import { AreaChart } from "../../components/charts/AreaChart";
import { HBar } from "../../components/charts/HBar";
import { Sparkline } from "../../components/charts/Sparkline";
import { WorldMap } from "../../components/charts/WorldMap";
import { fmtMoneyShort } from "../../lib/format";

export default function AnalyticsTab() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancelled = false;
    analytics()
      .then((d) => { if (!cancelled) setData(d); })
      .catch((e) => { if (!cancelled) setErr(e.message); });
    return () => { cancelled = true; };
  }, []);

  const derived = useMemo(() => {
    if (!data) return null;
    const series = data.revenue_by_day || [];
    const total30 = series.reduce((s, d) => s + (d.revenue || 0), 0);
    const last7 = series.slice(-7).reduce((s, d) => s + (d.revenue || 0), 0);
    const prev7 = series.slice(-14, -7).reduce((s, d) => s + (d.revenue || 0), 0);
    const delta = prev7 === 0 ? 0 : ((last7 - prev7) / prev7) * 100;

    const totalOrders = (data.by_status || []).reduce((s, r) => s + (r.count || 0), 0);
    const aov = totalOrders > 0
      ? Math.round((data.by_status || []).reduce((s, r) => s + (r.revenue || 0), 0) / totalOrders)
      : 0;

    const ordersByDay = series.map((d) => ({ ...d, orders: 0 })); // backend doesn't expose count/day yet
    return { total30, last7, delta, aov, ordersByDay, totalOrders };
  }, [data]);

  if (err) return <p className="err">Failed to load analytics: {err}</p>;
  if (!data || !derived) return <p className="muted">Loading analytics…</p>;

  const statusRows = (data.by_status || []).map((r) => ({
    label: r.status,
    value: r.count,
    display: `${r.count} · ${fmtMoneyShort(r.revenue)}`,
    key: r.status,
  }));

  const catRows = (data.by_category || []).map((r) => ({
    label: r.category,
    value: r.revenue,
    display: fmtMoneyShort(r.revenue),
  }));

  const bubbles = (data.by_country || []).map((r) => ({
    code: r.country_code,
    name: r.country,
    value: r.count,
    revenue: r.revenue,
  }));

  const statusColor = (r) =>
    r.key === "Processing" ? "var(--amber)" : r.key === "Shipped" ? "var(--clay)" : "var(--moss)";

  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="page-head">
        <div>
          <div className="mono muted">INSIGHTS · LAST 30 DAYS</div>
          <h2 style={{ marginTop: 4 }}>Analytics</h2>
          <div className="sub">Revenue, orders, customers and where they're shipping.</div>
        </div>
      </div>

      <div className="grid-kpi">
        <KpiCard label="Revenue (30d)" value={fmtMoneyShort(derived.total30)} hint={`${derived.totalOrders} orders`} />
        <KpiCard
          label="Last 7 days"
          value={fmtMoneyShort(derived.last7)}
          hint={
            <span style={{ color: derived.delta >= 0 ? "var(--moss)" : "var(--rose)" }}>
              {derived.delta >= 0 ? "▲" : "▼"} {Math.abs(derived.delta).toFixed(0)}% vs prior week
            </span>
          }
        />
        <KpiCard label="Avg order" value={fmtMoneyShort(derived.aov)} hint="Across all statuses" />
        <div className="card kpi">
          <div className="kpi-label mono muted">Daily revenue</div>
          <div className="kpi-value" style={{ fontSize: 26 }}>{fmtMoneyShort(derived.total30 / 30)}</div>
          <div style={{ marginTop: 6 }}>
            <Sparkline values={(data.revenue_by_day || []).map((d) => d.revenue || 0)} />
          </div>
        </div>
      </div>

      <section className="card chart-card">
        <header style={{ marginBottom: 8 }}>
          <h3 style={{ fontFamily: "var(--f-display)", fontSize: 20 }}>Revenue trend</h3>
          <div className="mono muted" style={{ fontSize: 11.5 }}>Daily, last 30 days</div>
        </header>
        <AreaChart data={data.revenue_by_day || []} height={260} />
      </section>

      <div className="grid-2-equal">
        <section className="card chart-card">
          <header style={{ marginBottom: 12 }}>
            <h3 style={{ fontFamily: "var(--f-display)", fontSize: 20 }}>Orders by status</h3>
            <div className="mono muted" style={{ fontSize: 11.5 }}>Current fulfilment pipeline</div>
          </header>
          <HBar rows={statusRows} total={derived.totalOrders} colorFor={statusColor} />
        </section>

        <section className="card chart-card">
          <header style={{ marginBottom: 12 }}>
            <h3 style={{ fontFamily: "var(--f-display)", fontSize: 20 }}>Top categories</h3>
            <div className="mono muted" style={{ fontSize: 11.5 }}>By revenue</div>
          </header>
          <HBar rows={catRows} colorFor={() => "var(--clay)"} />
        </section>
      </div>

      <section className="card chart-card">
        <header className="row between" style={{ marginBottom: 12 }}>
          <div>
            <h3 style={{ fontFamily: "var(--f-display)", fontSize: 20 }}>Orders by country</h3>
            <div className="mono muted" style={{ fontSize: 11.5 }}>{bubbles.length} countries · hover for details</div>
          </div>
          <div className="map-legend mono muted">
            <span className="map-dot" /> Order count
          </div>
        </header>
        <WorldMap bubbles={bubbles} />
      </section>
    </div>
  );
}
