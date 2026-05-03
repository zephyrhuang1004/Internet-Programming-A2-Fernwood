import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { I } from "../components/Icons";
import { EmptyState } from "../components/EmptyState";
import { StubBanner } from "../components/StubBanner";
import { getOrder } from "../services/orderService";
import { listProducts } from "../services/productService";
import { fmtMoney, fmtDate } from "../lib/format";
import { IMG, IMG_FALLBACK } from "../constants";
import { ApiError } from "../services/apiClient";

const STAGES = ["Processing", "Shipped", "Delivered"];

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [stub, setStub] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const o = await getOrder(id);
        setOrder(o);
      } catch (e) {
        if (e instanceof ApiError && e.isStub) setStub(true);
        else throw e;
      }
      try { setProducts(await listProducts()); } catch {/* mock */}
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="page"><p className="muted">Loading…</p></div>;
  if (!order) return (
    <div className="page narrow">
      <Link className="btn ghost sm" to="/orders"><I.arrowLeft /> Back</Link>
      <EmptyState icon={<I.box />} title="Order not found" body="This order may have been removed." />
    </div>
  );

  const currentIdx = STAGES.indexOf(order.status);
  const shipping = order.shipping || {};
  const payment = order.payment || { brand: "Card", last4: "••••", masked: "•••• •••• •••• ••••" };

  return (
    <div className="page narrow">
      {stub && <StubBanner person="Person 4" slice="Checkout & Orders" />}
      <Link className="btn ghost sm" to="/orders"><I.arrowLeft /> Back</Link>

      <div className="page-head" style={{ marginTop: 14 }}>
        <div>
          <div className="mono muted">ORDER {order._id}</div>
          <h2 style={{ marginTop: 4 }}>Placed {fmtDate(order.placed_at)}</h2>
        </div>
        <div style={{ textAlign: "right" }}>
          <span className={`badge ${order.status === "Delivered" ? "moss" : order.status === "Shipped" ? "clay" : "amber"}`}>{order.status}</span>
          <div className="num" style={{ fontFamily: "var(--f-display)", fontSize: 28, marginTop: 8 }}>{fmtMoney(order.total)}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 22 }}>
        <div className="mono muted" style={{ marginBottom: 18 }}>STATUS</div>
        <div className="od-timeline">
          {STAGES.map((s, i) => (
            <span key={s} style={{ display: "contents" }}>
              <div className={`od-stage ${i <= currentIdx ? "done" : ""} ${i === currentIdx ? "current" : ""}`}>
                <div className="od-dot">{i <= currentIdx ? <I.check /> : <span>{i + 1}</span>}</div>
                <div className="od-label">{s}</div>
              </div>
              {i < STAGES.length - 1 && <div className={`od-bar ${i < currentIdx ? "done" : ""}`} />}
            </span>
          ))}
        </div>
      </div>

      <div className="od-2col">
        <section className="card">
          <div className="row between" style={{ marginBottom: 14 }}>
            <div className="mono muted">SHIPPING ADDRESS</div>
            <I.box />
          </div>
          <div className="stack" style={{ gap: 4, fontSize: 14, lineHeight: 1.5 }}>
            <div style={{ fontFamily: "var(--f-display)", fontSize: 18 }}>{shipping.name}</div>
            <div>{shipping.address}</div>
            <div>{[shipping.city, shipping.postal].filter(Boolean).join(", ")}</div>
            <div className="muted">{shipping.country}</div>
          </div>
        </section>

        <section className="card">
          <div className="row between" style={{ marginBottom: 14 }}>
            <div className="mono muted">PAYMENT</div>
            <span className="badge">{payment.brand}</span>
          </div>
          <div style={{ position: "relative", padding: "22px 22px 20px", borderRadius: 14, background: "linear-gradient(135deg, var(--ink) 0%, oklch(from var(--ink) calc(l + 0.08) c h) 100%)", color: "var(--bone)", overflow: "hidden", boxShadow: "var(--shadow-md)" }}>
            <div style={{ width: 40, height: 30, borderRadius: 6, background: "linear-gradient(135deg, #d4b581, #a8894f 60%, #d4b581)", marginBottom: 26 }} />
            <div className="mono" style={{ fontSize: 19, letterSpacing: "0.12em" }}>{payment.masked}</div>
            <div className="row between" style={{ marginTop: 18 }}>
              <div>
                <div className="mono" style={{ fontSize: 9.5, opacity: 0.55 }}>HOLDER</div>
                <div className="mono" style={{ fontSize: 12.5 }}>{(shipping.name || "—").toUpperCase()}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="mono" style={{ fontSize: 9.5, opacity: 0.55 }}>TYPE</div>
                <div className="mono" style={{ fontSize: 12.5 }}>{payment.brand}</div>
              </div>
            </div>
          </div>
          <div className="muted" style={{ fontSize: 11.5, marginTop: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <I.lock /> Full card number is never stored — only the last 4 digits are kept.
          </div>
        </section>
      </div>

      <section className="card" style={{ marginTop: 22 }}>
        <div className="mono muted" style={{ marginBottom: 14 }}>ITEMS · {order.items.length}</div>
        <div className="stack" style={{ gap: 14 }}>
          {order.items.map((i, idx) => {
            const p = products.find((x) => x._id === i.product_id);
            return (
              <div key={idx} className="row" style={{ gap: 14, alignItems: "center" }}>
                <img src={IMG(p?.img || "", 300)} alt="" onError={(e) => { e.currentTarget.src = IMG_FALLBACK; }}
                     style={{ width: 72, height: 72, borderRadius: 12, objectFit: "cover", background: "var(--sand)" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--f-display)", fontSize: 18 }}>{p?.name || i.product_id}</div>
                  <div className="mono muted" style={{ fontSize: 11.5 }}>× {i.qty}</div>
                </div>
                <div className="num" style={{ fontFamily: "var(--f-display)", fontSize: 18 }}>
                  {fmtMoney((i.unit_price ?? p?.price ?? 0) * i.qty)}
                </div>
              </div>
            );
          })}
        </div>
        <hr className="hr" style={{ margin: "22px 0 16px" }} />
        <div className="stack" style={{ gap: 8, fontSize: 14 }}>
          <div className="row between"><span className="muted">Subtotal</span><span className="num">{fmtMoney(order.subtotal)}</span></div>
          <div className="row between"><span className="muted">Shipping</span><span className="num">{order.shipping_fee === 0 ? "Free" : fmtMoney(order.shipping_fee)}</span></div>
          <div className="row between"><span className="muted">Tax</span><span className="num">{fmtMoney(order.tax)}</span></div>
        </div>
        <hr className="hr" />
        <div className="row between">
          <span style={{ fontFamily: "var(--f-display)", fontSize: 22 }}>Total paid</span>
          <span className="num" style={{ fontFamily: "var(--f-display)", fontSize: 26 }}>{fmtMoney(order.total)}</span>
        </div>
      </section>
    </div>
  );
}
