import { Modal } from "./Modal";
import { StatusBadge } from "./StatusBadge";
import { I } from "../Icons";
import { fmtMoney, fmtDate } from "../../lib/format";
import { imgUrl } from "../../lib/img";

/**
 * Read-only inspection of one order. Renders the full set of fields the
 * backend serializes (customer, shipping address, payment, item-level
 * snapshots, breakdown of subtotal + shipping + tax = total).
 *
 * Items only carry product_id + qty + unit_price, so we hydrate name/img
 * from the productIndex passed by the parent (OrdersTab loads it once
 * alongside users + orders).
 */
export function OrderDetailModal({
  open,
  order,
  customer,
  productIndex = {},
  nextStatus,
  busy,
  onAdvance,
  onClose,
}) {
  if (!open || !order) return null;
  const items = order.items || [];
  const shipping = order.shipping || {};
  const payment = order.payment || {};

  return (
    <Modal open={open} onClose={onClose} wide>
      <div className="row between" style={{ alignItems: "flex-start" }}>
        <div>
          <div className="mono muted">
            ORDER · {order._id}
            {order.placed_at && <span> · {fmtDate(order.placed_at)}</span>}
          </div>
          <div className="row" style={{ gap: 10, marginTop: 6, alignItems: "center" }}>
            <StatusBadge status={order.status} />
            {nextStatus && (
              <button className="btn ghost xs" disabled={busy} onClick={onAdvance}>
                → {nextStatus}
              </button>
            )}
          </div>
        </div>
        <button className="icon-btn" onClick={onClose} aria-label="Close"><I.close /></button>
      </div>

      <div className="od-grid" style={{ marginTop: 18 }}>
        <Block title="Customer">
          <div>{customer?.name || "—"}</div>
          <div className="mono muted" style={{ fontSize: 12 }}>
            {customer?.email || order.user_id}
          </div>
        </Block>

        <Block title="Shipping">
          {shipping.name && <div>{shipping.name}</div>}
          {shipping.address && <div>{shipping.address}</div>}
          <div>
            {[shipping.city, shipping.postal].filter(Boolean).join(", ")}
            {shipping.country && (shipping.city || shipping.postal) ? ", " : ""}
            {shipping.country || ""}
          </div>
          {!shipping.address && !shipping.city && !shipping.country && (
            <span className="muted" style={{ fontSize: 12 }}>No shipping info</span>
          )}
        </Block>

        <Block title="Payment">
          {payment.masked ? (
            <>
              <div className="mono">{payment.masked}</div>
              {payment.brand && (
                <div className="mono muted" style={{ fontSize: 12 }}>{payment.brand}</div>
              )}
            </>
          ) : (
            <span className="muted" style={{ fontSize: 12 }}>No payment info</span>
          )}
        </Block>
      </div>

      <div style={{ marginTop: 18 }}>
        <div className="mono muted" style={{ fontSize: 11, marginBottom: 6 }}>ITEMS</div>
        <div className="stack" style={{ gap: 0 }}>
          {items.map((it, idx) => {
            const p = productIndex[it.product_id];
            const lineTotal = (it.unit_price || 0) * (it.qty || 0);
            return (
              <div
                key={it.product_id || idx}
                className="row"
                style={{
                  gap: 14,
                  padding: "10px 0",
                  borderBottom: "1px dashed var(--line)",
                }}
              >
                {p?.img ? (
                  <img
                    src={imgUrl(p.img, 120)}
                    alt=""
                    style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover", flex: "none" }}
                  />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: 8, background: "var(--bone-2)", flex: "none" }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14 }}>{p?.name || "(product removed)"}</div>
                  <div className="mono muted" style={{ fontSize: 11 }}>
                    {(p?.category ?? "")} · {fmtMoney(it.unit_price)} × {it.qty}
                  </div>
                </div>
                <div className="num" style={{ fontFamily: "var(--f-display)", fontSize: 17, flex: "none" }}>
                  {fmtMoney(lineTotal)}
                </div>
              </div>
            );
          })}
        </div>

        <div className="stack" style={{ gap: 4, marginTop: 14, alignItems: "flex-end" }}>
          <Total label="Subtotal" value={order.subtotal} muted />
          <Total label="Shipping" value={order.shipping_fee} muted zeroAs="Free" />
          <Total label="Tax" value={order.tax} muted />
          <div style={{ width: 220, height: 1, background: "var(--line)" }} />
          <Total label="Total" value={order.total} large />
        </div>
      </div>
    </Modal>
  );
}

function Block({ title, children }) {
  return (
    <div>
      <div className="mono muted" style={{ fontSize: 11, marginBottom: 4 }}>{title.toUpperCase()}</div>
      <div style={{ fontSize: 14, lineHeight: 1.4 }}>{children}</div>
    </div>
  );
}

function Total({ label, value, muted, large, zeroAs }) {
  const isZero = (value || 0) === 0;
  const display = isZero && zeroAs ? zeroAs : fmtMoney(value);
  return (
    <div className="row" style={{ gap: 24, minWidth: 220, justifyContent: "space-between" }}>
      <span className={muted ? "muted" : ""} style={{ fontSize: large ? 14 : 12.5 }}>{label}</span>
      <span
        className="num"
        style={{
          fontFamily: large ? "var(--f-display)" : "var(--f-mono)",
          fontSize: large ? 22 : 13,
        }}
      >
        {display}
      </span>
    </div>
  );
}
