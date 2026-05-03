import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { I } from "../components/Icons";
import { EmptyState } from "../components/EmptyState";
import { StubBanner } from "../components/StubBanner";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { listProducts, isBackendStubbed } from "../services/productService";
import { fmtMoney } from "../lib/format";
import { IMG, IMG_FALLBACK, FREE_SHIP_AT, FLAT_SHIP, TAX_RATE } from "../constants";

export default function CartPage() {
  const { user } = useAuth();
  const { items, update, remove } = useCart();
  const navigate = useNavigate();
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [stub, setStub] = useState(false);

  useEffect(() => {
    (async () => {
      const [items, stubbed] = await Promise.all([listProducts(), isBackendStubbed()]);
      setProducts(items);
      setStub(stubbed);
    })();
  }, []);

  if (!user) {
    return (
      <div className="page narrow">
        <EmptyState icon={<I.user />} title="Sign in to see your bag"
                    body={<><Link className="btn clay sm" to="/login">Sign in</Link></>} />
      </div>
    );
  }

  const lines = items.map((i) => ({ ...i, product: products.find((p) => p._id === i.product_id) })).filter((l) => l.product);
  const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const shipping = subtotal > FREE_SHIP_AT ? 0 : (subtotal > 0 ? FLAT_SHIP : 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + shipping + tax;

  return (
    <div className="page narrow">
      {stub && <StubBanner person="Person 3" slice="Cart" />}
      <div className="page-head">
        <div>
          <div className="mono muted">YOUR BAG</div>
          <h2 style={{ marginTop: 4 }}>Bag</h2>
        </div>
      </div>

      {lines.length === 0 ? (
        <EmptyState icon={<I.bag />} title="Your bag is empty"
                    body={<><Link className="btn clay sm" to="/products">Browse the collection</Link></>} />
      ) : (
        <div className="checkout">
          <div className="card">
            {lines.map((l) => (
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
            ))}
          </div>
          <aside className="checkout-summary">
            <h3 style={{ fontFamily: "var(--f-display)", fontSize: 22, marginBottom: 14 }}>Summary</h3>
            <div className="stack" style={{ gap: 6, fontSize: 13.5 }}>
              <div className="row between"><span className="muted">Subtotal</span><span className="num">{fmtMoney(subtotal)}</span></div>
              <div className="row between"><span className="muted">Shipping</span><span className="num">{shipping === 0 ? "Free" : fmtMoney(shipping)}</span></div>
              <div className="row between"><span className="muted">Tax</span><span className="num">{fmtMoney(tax)}</span></div>
            </div>
            <hr className="hr" />
            <div className="row between" style={{ marginBottom: 14 }}>
              <span style={{ fontFamily: "var(--f-display)", fontSize: 22 }}>Total</span>
              <span className="num" style={{ fontFamily: "var(--f-display)", fontSize: 26 }}>{fmtMoney(total)}</span>
            </div>
            <button className="btn clay" style={{ width: "100%" }} onClick={() => navigate("/checkout")}>
              Checkout <I.arrow />
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
