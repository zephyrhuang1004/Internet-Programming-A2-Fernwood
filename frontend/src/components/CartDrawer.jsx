import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { I } from "./Icons";
import { EmptyState } from "./EmptyState";
import { IMG, IMG_FALLBACK } from "../constants";
import { fmtMoney } from "../lib/format";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { listProducts } from "../services/productService";

export function CartDrawer({ open, onClose }) {
  const { user } = useAuth();
  const { items, update, remove } = useCart();
  const navigate = useNavigate();
  const toast = useToast();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!open) return;
    listProducts().then(setProducts).catch(() => setProducts([]));
  }, [open]);

  if (!open) return null;
  const lines = items.map((i) => ({ ...i, product: products.find((p) => p._id === i.product_id) })).filter((l) => l.product);
  const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);

  return (
    <>
      <div className="drawer-scrim" onClick={onClose} />
      <aside className="drawer">
        <div className="drawer-head">
          <h3>Your bag</h3>
          <button className="icon-btn" onClick={onClose}><I.close /></button>
        </div>
        <div className="drawer-body">
          {!user ? (
            <EmptyState icon={<I.user />} title="Sign in to shop" body="Your bag, orders and saved items live with your account." />
          ) : lines.length === 0 ? (
            <EmptyState icon={<I.bag />} title="Your bag is empty" body="Browse the collection — your favourites will land here." />
          ) : (
            lines.map((l) => (
              <div key={l.product_id} className="cart-line">
                <img src={IMG(l.product.img, 300)} alt="" onError={(e) => { e.currentTarget.src = IMG_FALLBACK; }} />
                <div>
                  <div className="t-name">{l.product.name}</div>
                  <div className="t-meta mono">{l.product.material} · {fmtMoney(l.product.price)}</div>
                  <div className="row" style={{ marginTop: 8, gap: 10 }}>
                    <div className="qty">
                      <button onClick={() => update(l.product_id, l.qty - 1)}><I.minus /></button>
                      <span>{l.qty}</span>
                      <button onClick={() => update(l.product_id, l.qty + 1)}><I.plus /></button>
                    </div>
                    <button className="btn ghost xs" onClick={() => { remove(l.product_id); toast("Removed", "warn"); }}>
                      <I.trash />
                    </button>
                  </div>
                </div>
                <div className="num" style={{ fontFamily: "var(--f-display)", fontSize: 18 }}>
                  {fmtMoney(l.product.price * l.qty)}
                </div>
              </div>
            ))
          )}
        </div>
        {user && lines.length > 0 && (
          <div className="drawer-foot">
            <div className="row between" style={{ marginBottom: 4 }}>
              <span className="muted">Subtotal</span>
              <span className="num" style={{ fontSize: 18, fontFamily: "var(--f-display)" }}>{fmtMoney(subtotal)}</span>
            </div>
            <div className="muted" style={{ fontSize: 12, marginBottom: 14 }}>Shipping & taxes calculated at checkout.</div>
            <button className="btn clay" style={{ width: "100%" }} onClick={() => { onClose(); navigate("/checkout"); }}>
              Checkout <I.arrow />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
