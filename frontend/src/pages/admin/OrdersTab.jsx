import { useEffect, useMemo, useState } from "react";
import { listOrders, updateOrderStatus, listUsers, listAdminProducts } from "../../services/adminService";
import { SearchBox } from "../../components/SearchBox";
import { EmptyState } from "../../components/EmptyState";
import { StatusBadge } from "../../components/admin/StatusBadge";
import { I } from "../../components/Icons";
import { fmtMoney, fmtDate, highlight } from "../../lib/format";
import { OrderDetailModal } from "../../components/admin/OrderDetailModal";

const STATUSES = ["all", "Processing", "Shipped", "Delivered"];
const NEXT = { Processing: "Shipped", Shipped: "Delivered" };

export default function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const reload = async () => {
    try {
      const [o, u, p] = await Promise.all([
        listOrders(status === "all" ? {} : { status }),
        listUsers(""),
        listAdminProducts(""),
      ]);
      setOrders(o || []);
      setUsers(u || []);
      setProducts(p || []);
      setErr(null);
    } catch (e) {
      setErr(e.message);
    }
  };

  useEffect(() => { reload(); }, [status]);

  const userIndex = useMemo(() => {
    const m = {};
    users.forEach((u) => { m[u._id] = u; });
    return m;
  }, [users]);

  const productIndex = useMemo(() => {
    const m = {};
    products.forEach((p) => { m[p._id] = p; });
    return m;
  }, [products]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return orders;
    return orders.filter((o) => {
      if (o._id.toLowerCase().includes(qq)) return true;
      const u = userIndex[o.user_id];
      return u && (u.email.toLowerCase().includes(qq) || u.name.toLowerCase().includes(qq));
    });
  }, [orders, q, userIndex]);

  const advance = async (o) => {
    const next = NEXT[o.status];
    if (!next) return;
    setBusy(true);
    try {
      const updated = await updateOrderStatus(o._id, next);
      await reload();
      // Keep modal open with the freshly-advanced order if it's the one we're viewing.
      if (selectedOrder?._id === o._id && updated) setSelectedOrder(updated);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="page-head">
        <div>
          <div className="mono muted">ORDERS</div>
          <h2 style={{ marginTop: 4 }}>Orders</h2>
          <div className="sub">All placed orders. Advance status as shipments progress.</div>
        </div>
      </div>

      {err && <p className="err">{err}</p>}

      <div className="row wrap" style={{ gap: 10 }}>
        <div style={{ flex: 1, minWidth: 280, maxWidth: 420 }}>
          <SearchBox value={q} onChange={setQ} placeholder="Search orders or customer email…" />
        </div>
        <div className="row wrap" style={{ gap: 6 }}>
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              className={`chip ${status === s ? "active" : ""}`}
              onClick={() => setStatus(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <OrderDetailModal
        open={!!selectedOrder}
        order={selectedOrder}
        customer={selectedOrder ? userIndex[selectedOrder.user_id] : null}
        productIndex={productIndex}
        nextStatus={selectedOrder ? NEXT[selectedOrder.status] : null}
        busy={busy}
        onAdvance={() => selectedOrder && advance(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
      />

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Placed</th>
                <th className="num">Items</th>
                <th className="num">Total</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: 40 }}>
                    <EmptyState icon={<I.bag />} title="No orders" body="No orders match the current filter." />
                  </td>
                </tr>
              ) : (
                filtered.map((o) => {
                  const u = userIndex[o.user_id];
                  const itemCount = (o.items || []).reduce((s, i) => s + (i.qty || 0), 0);
                  return (
                    <tr
                      key={o._id}
                      onClick={() => setSelectedOrder(o)}
                      style={{ cursor: "pointer" }}
                    >
                      <td className="mono">{highlight(o._id, q)}</td>
                      <td>
                        <div>{u?.name ? highlight(u.name, q) : "—"}</div>
                        <div className="mono muted" style={{ fontSize: 11 }}>
                          {u?.email ? highlight(u.email, q) : o.user_id}
                        </div>
                      </td>
                      <td>{fmtDate(o.placed_at)}</td>
                      <td className="num">{itemCount}</td>
                      <td className="num">{fmtMoney(o.total)}</td>
                      <td><StatusBadge status={o.status} /></td>
                      <td style={{ textAlign: "right" }}>
                        {NEXT[o.status] && (
                          <button
                            className="btn ghost xs"
                            disabled={busy}
                            onClick={(e) => { e.stopPropagation(); advance(o); }}
                          >
                            → {NEXT[o.status]}
                          </button>
                        )}
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
