import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dashboard, listActivity, listAdminProducts } from "../../services/adminService";
import { fmtMoneyShort, fmtDateTime } from "../../lib/format";
import { imgUrl } from "../../lib/img";
import { KpiCard } from "../../components/admin/KpiCard";
import { I } from "../../components/Icons";

const ACTION_BADGE = {
  "user.role_changed": "clay",
  "user.deleted": "rose",
  "product.created": "moss",
  "product.updated": "clay",
  "product.deleted": "rose",
  "order.placed": "clay",
  "order.status_changed": "clay",
  "auth.login": "moss",
};

export default function DashboardTab() {
  const [kpi, setKpi] = useState(null);
  const [activity, setActivity] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([dashboard(), listActivity({}), listAdminProducts("")])
      .then(([k, a, p]) => {
        if (cancelled) return;
        setKpi(k);
        setActivity((a || []).slice(0, 6));
        const sorted = [...(p || [])]
          .filter((x) => !x.deleted_at)
          .sort((x, y) => (y.price || 0) - (x.price || 0))
          .slice(0, 4);
        setTopProducts(sorted);
      })
      .catch((e) => !cancelled && setErr(e.message));
    return () => { cancelled = true; };
  }, []);

  if (err) return <p className="err">Failed to load dashboard: {err}</p>;
  if (!kpi) return <p className="muted">Loading dashboard…</p>;

  const stats = [
    { label: "Today's orders",   value: kpi.today_orders ?? 0, hint: "Placed since midnight UTC" },
    { label: "Week revenue",     value: fmtMoneyShort(kpi.week_revenue ?? 0), hint: "Past 7 days" },
    { label: "Low-stock SKUs",   value: kpi.low_stock_count ?? 0, hint: "Stock < 5" },
    { label: "Active customers", value: kpi.active_users_30d ?? 0, hint: "Past 30 days" },
  ];

  return (
    <div className="stack" style={{ gap: 22 }}>
      <div className="page-head">
        <div>
          <div className="mono muted">OVERVIEW</div>
          <h2 style={{ marginTop: 4 }}>Operations</h2>
          <div className="sub">Here's what's happening across the shop.</div>
        </div>
      </div>

      <div className="stat-grid">
        {stats.map((s) => (
          <KpiCard key={s.label} label={s.label} value={s.value} hint={s.hint} large />
        ))}
      </div>

      <div className="dash-2col">
        <div className="card">
          <div className="row between" style={{ marginBottom: 14 }}>
            <h3 style={{ fontFamily: "var(--f-display)", fontSize: 22 }}>Recent activity</h3>
            <Link to="/admin/activity" className="btn ghost xs">See all <I.arrow /></Link>
          </div>
          {activity.length === 0 ? (
            <p className="muted" style={{ fontSize: 13.5 }}>No activity yet — try editing a product or user.</p>
          ) : (
            activity.map((a) => (
              <div key={a._id} className="row between" style={{ padding: "10px 0", borderBottom: "1px dashed var(--line)" }}>
                <div>
                  <span className={`badge ${ACTION_BADGE[a.action] || ""}`}>{a.action}</span>
                  <span style={{ marginLeft: 10, fontSize: 13.5 }}>{a.detail}</span>
                </div>
                <span className="mono muted">{fmtDateTime(a.at)}</span>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <div className="row between" style={{ marginBottom: 14 }}>
            <h3 style={{ fontFamily: "var(--f-display)", fontSize: 22 }}>Premium pieces</h3>
            <Link to="/admin/products" className="btn ghost xs">Manage <I.arrow /></Link>
          </div>
          <div className="stack" style={{ gap: 10 }}>
            {topProducts.map((p) => (
              <div key={p._id} className="row" style={{ gap: 12 }}>
                {p.img && (
                  <img
                    src={imgUrl(p.img, 200)}
                    alt=""
                    style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover" }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                  <div className="mono muted" style={{ fontSize: 11.5 }}>{p.category}</div>
                </div>
                <div className="num" style={{ fontFamily: "var(--f-display)", fontSize: 18 }}>
                  {fmtMoneyShort(p.price)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
