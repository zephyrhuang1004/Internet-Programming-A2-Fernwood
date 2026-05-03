import { useState } from "react";
import { I } from "../components/Icons";
import { StubBanner } from "../components/StubBanner";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: <I.grid /> },
  { id: "products",  label: "Products",  icon: <I.box /> },
  { id: "users",     label: "Users",     icon: <I.people /> },
  { id: "orders",    label: "Orders",    icon: <I.bag /> },
  { id: "activity",  label: "Activity",  icon: <I.activity /> },
  { id: "analytics", label: "Analytics", icon: <I.chart /> },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState("dashboard");

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="mono muted">ADMIN CONSOLE</div>
          <h2 style={{ marginTop: 4 }}>Operations</h2>
          <div className="sub">Person 5: implement the controllers under <code>backend/controllers/admin_controller.py</code> and the UI tables here.</div>
        </div>
      </div>

      <StubBanner person="Person 5" slice="Admin Console" />

      <div className="admin-shell">
        <aside className="admin-side">
          <div className="mono muted" style={{ marginBottom: 12 }}>SECTIONS</div>
          {TABS.map((t) => (
            <button key={t.id} className={`admin-tab ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}>
              {t.icon} {t.label}
            </button>
          ))}
        </aside>
        <div className="admin-main">
          <div className="card">
            <div className="mono muted" style={{ marginBottom: 8 }}>{tab.toUpperCase()}</div>
            <h3 style={{ marginBottom: 10 }}>{TABS.find((t) => t.id === tab)?.label} — TODO</h3>
            <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.6 }}>
              Hook up <code>services/adminService.js</code> to render this section. Endpoints already
              exist on the backend (returning 501 with a TODO message) so a clean error path exists
              today; replace the controller body in <code>admin_controller.py</code> to light it up.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
