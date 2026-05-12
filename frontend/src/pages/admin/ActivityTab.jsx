import { useEffect, useMemo, useState } from "react";
import { listActivity, listUsers } from "../../services/adminService";
import { SearchBox } from "../../components/SearchBox";
import { EmptyState } from "../../components/EmptyState";
import { I } from "../../components/Icons";
import { fmtDateTime, highlight } from "../../lib/format";

const ACTIONS = [
  "all",
  "user.role_changed",
  "user.deleted",
  "product.created",
  "product.updated",
  "product.deleted",
  "order.placed",
  "order.status_changed",
  "auth.login",
];

const BADGE = {
  "user.role_changed": "clay",
  "user.deleted": "rose",
  "product.created": "moss",
  "product.updated": "clay",
  "product.deleted": "rose",
  "order.placed": "clay",
  "order.status_changed": "clay",
  "auth.login": "moss",
};

export default function ActivityTab() {
  const [rows, setRows] = useState([]);
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [action, setAction] = useState("all");
  const [err, setErr] = useState(null);

  const reload = async () => {
    try {
      const [r, u] = await Promise.all([
        listActivity(action === "all" ? {} : { action }),
        listUsers(""),
      ]);
      setRows(r || []);
      setUsers(u || []);
      setErr(null);
    } catch (e) {
      setErr(e.message);
    }
  };

  useEffect(() => { reload(); }, [action]);

  const userIndex = useMemo(() => {
    const m = {};
    users.forEach((u) => { m[u._id] = u; });
    return m;
  }, [users]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return rows;
    return rows.filter((a) => {
      if ((a.detail || "").toLowerCase().includes(qq)) return true;
      const u = userIndex[a.user_id];
      return u && u.email.toLowerCase().includes(qq);
    });
  }, [rows, q, userIndex]);

  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="page-head">
        <div>
          <div className="mono muted">AUDIT</div>
          <h2 style={{ marginTop: 4 }}>Activity log</h2>
          <div className="sub">Every admin mutation. Last 200 events.</div>
        </div>
      </div>

      {err && <p className="err">{err}</p>}

      <div className="row wrap" style={{ gap: 10 }}>
        <div style={{ flex: 1, minWidth: 280, maxWidth: 420 }}>
          <SearchBox value={q} onChange={setQ} placeholder="Filter log…" />
        </div>
        <div className="row wrap" style={{ gap: 6 }}>
          {ACTIONS.map((k) => (
            <button
              key={k}
              type="button"
              className={`chip ${action === k ? "active" : ""}`}
              onClick={() => setAction(k)}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 180 }}>When</th>
                <th style={{ width: 180 }}>Action</th>
                <th>Detail</th>
                <th style={{ width: 200 }}>Actor</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: 40 }}>
                    <EmptyState icon={<I.activity />} title="Nothing logged here" body="Try a different filter, or perform an admin action." />
                  </td>
                </tr>
              ) : (
                filtered.map((a) => {
                  const u = userIndex[a.user_id];
                  return (
                    <tr key={a._id}>
                      <td className="mono muted">{fmtDateTime(a.at)}</td>
                      <td><span className={`badge ${BADGE[a.action] || ""}`}>{a.action}</span></td>
                      <td>{highlight(a.detail || "", q)}</td>
                      <td className="mono muted">
                        {u?.email ? highlight(u.email, q) : (a.user_id || "—")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
