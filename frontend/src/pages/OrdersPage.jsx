import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { I } from "../components/Icons";
import { EmptyState } from "../components/EmptyState";
import { StubBanner } from "../components/StubBanner";
import { listMyOrders } from "../services/orderService";
import { listProducts } from "../services/productService";
import { fmtMoney, fmtDate } from "../lib/format";
import { IMG, IMG_FALLBACK } from "../constants";
import { ApiError } from "../services/apiClient";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [stub, setStub] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const o = await listMyOrders();
        setOrders(o);
      } catch (e) {
        if (e instanceof ApiError && e.isStub) setStub(true);
        else throw e;
      }
      try { setProducts(await listProducts()); } catch {/* mock */}
    })();
  }, []);

  return (
    <div className="page narrow">
      {stub && <StubBanner person="Person 4" slice="Checkout & Orders" />}
      <div className="page-head">
        <div>
          <div className="mono muted">ORDERS</div>
          <h2 style={{ marginTop: 4 }}>My orders</h2>
          <div className="sub">{orders.length} order{orders.length === 1 ? "" : "s"} on file.</div>
        </div>
      </div>

      {orders.length === 0 ? (
        <EmptyState icon={<I.box />} title="No orders yet" body="Your purchases will appear here." />
      ) : (
        <div className="stack" style={{ gap: 14 }}>
          {orders.map((o) => (
            <Link key={o._id} to={`/orders/${o._id}`} className="card" style={{ display: "block", textDecoration: "none", color: "inherit" }}>
              <div className="row between" style={{ marginBottom: 12 }}>
                <div>
                  <div className="mono muted">ORDER {o._id}</div>
                  <div style={{ fontFamily: "var(--f-display)", fontSize: 22, marginTop: 2 }}>{fmtDate(o.placed_at)}</div>
                </div>
                <div className="row" style={{ gap: 10 }}>
                  <span className={`badge ${o.status === "Delivered" ? "moss" : o.status === "Shipped" ? "clay" : "amber"}`}>{o.status}</span>
                  <div className="num" style={{ fontSize: 18, fontFamily: "var(--f-display)" }}>{fmtMoney(o.total)}</div>
                </div>
              </div>
              <div className="row wrap" style={{ gap: 10 }}>
                {o.items.slice(0, 4).map((i, idx) => {
                  const p = products.find((x) => x._id === i.product_id);
                  return (
                    <div key={idx} className="row" style={{ gap: 8 }}>
                      <img src={IMG(p?.img || "", 120)} alt="" onError={(e) => { e.currentTarget.src = IMG_FALLBACK; }}
                           style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", background: "var(--sand)" }} />
                      <div className="mono muted" style={{ fontSize: 11.5 }}>{p?.name || i.product_id} × {i.qty}</div>
                    </div>
                  );
                })}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
