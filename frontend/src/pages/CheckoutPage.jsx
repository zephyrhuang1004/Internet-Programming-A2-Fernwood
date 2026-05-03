import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { I } from "../components/Icons";
import { EmptyState } from "../components/EmptyState";
import { StubBanner } from "../components/StubBanner";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { listProducts } from "../services/productService";
import { placeOrder } from "../services/orderService";
import { fmtMoney } from "../lib/format";
import { IMG, IMG_FALLBACK, TAX_RATE, FREE_SHIP_AT, FLAT_SHIP } from "../constants";
import { ApiError } from "../services/apiClient";

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, clear } = useCart();
  const navigate = useNavigate();
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: user?.name || "", address: "", city: "", postal: "", country: "Australia", card: "" });
  const [placing, setPlacing] = useState(false);
  const [stub, setStub] = useState(false);

  useEffect(() => { listProducts().then(setProducts); }, []);

  const lines = items.map((i) => ({ ...i, product: products.find((p) => p._id === i.product_id) })).filter((l) => l.product);
  const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const shipping = subtotal > FREE_SHIP_AT ? 0 : (subtotal > 0 ? FLAT_SHIP : 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + shipping + tax;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const place = async (e) => {
    e.preventDefault();
    if (!form.address.trim() || !form.city.trim() || !form.card.trim()) {
      toast("Please complete your details", "warn"); return;
    }
    setPlacing(true);
    try {
      const { card, ...shipping } = form;
      const order = await placeOrder({ shipping, card });
      await clear();
      toast(`Order ${order._id} placed`, "good");
      navigate(`/order-confirm/${order._id}`);
    } catch (ex) {
      if (ex instanceof ApiError && ex.isStub) {
        setStub(true);
        toast("Backend stub — Person 4 to implement", "warn");
      } else { toast(ex.message, "error"); }
    } finally { setPlacing(false); }
  };

  if (lines.length === 0) {
    return (
      <div className="page narrow">
        <Link className="btn ghost sm" to="/products"><I.arrowLeft /> Back</Link>
        <EmptyState icon={<I.bag />} title="Nothing to check out" body="Your bag is empty." />
      </div>
    );
  }

  return (
    <div className="page narrow">
      {stub && <StubBanner person="Person 4" slice="Checkout & Orders" />}
      <Link className="btn ghost sm" to="/cart"><I.arrowLeft /> Back to bag</Link>
      <div className="page-head" style={{ marginTop: 14 }}>
        <div><div className="mono muted">STEP 2 OF 2</div><h2 style={{ marginTop: 4 }}>Checkout</h2></div>
      </div>

      <form className="checkout" onSubmit={place}>
        <div className="stack" style={{ gap: 22 }}>
          <section className="card">
            <h3 style={{ fontFamily: "var(--f-display)", fontSize: 22, marginBottom: 12 }}>Shipping address</h3>
            <div className="stack">
              <div className="field"><label>Full name</label><input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} required /></div>
              <div className="field"><label>Street address</label><input className="input" value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="e.g. 14 Grove Lane" required /></div>
              <div className="row" style={{ gap: 10 }}>
                <div className="field" style={{ flex: 2 }}><label>City</label><input className="input" value={form.city} onChange={(e) => set("city", e.target.value)} required /></div>
                <div className="field" style={{ flex: 1 }}><label>Postal</label><input className="input" value={form.postal} onChange={(e) => set("postal", e.target.value)} required /></div>
              </div>
              <div className="field"><label>Country</label>
                <select className="select" value={form.country} onChange={(e) => set("country", e.target.value)}>
                  <option>Australia</option><option>New Zealand</option><option>Japan</option>
                  <option>Portugal</option><option>United States</option>
                </select>
              </div>
            </div>
          </section>

          <section className="card">
            <h3 style={{ fontFamily: "var(--f-display)", fontSize: 22, marginBottom: 12 }}>Payment</h3>
            <div className="field">
              <label>Card number</label>
              <input className="input num" value={form.card}
                     onChange={(e) => set("card", e.target.value.replace(/[^\d ]/g, "").slice(0, 19))}
                     placeholder="•••• •••• •••• ••••" required />
            </div>
            <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>Demo checkout — no payment is actually processed.</div>
          </section>
        </div>

        <aside className="checkout-summary">
          <h3 style={{ fontFamily: "var(--f-display)", fontSize: 22, marginBottom: 14 }}>Your order</h3>
          <div className="stack" style={{ gap: 10, marginBottom: 16 }}>
            {lines.map((l) => (
              <div key={l.product_id} className="row" style={{ gap: 12 }}>
                <img src={IMG(l.product.img, 200)} alt="" style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover" }}
                     onError={(e) => { e.currentTarget.src = IMG_FALLBACK; }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5 }}>{l.product.name}</div>
                  <div className="mono muted" style={{ fontSize: 11.5 }}>× {l.qty}</div>
                </div>
                <div className="num">{fmtMoney(l.product.price * l.qty)}</div>
              </div>
            ))}
          </div>
          <hr className="hr" />
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
          <button className="btn clay" type="submit" style={{ width: "100%" }} disabled={placing}>
            {placing ? "Placing order…" : `Place order — ${fmtMoney(total)}`}
          </button>
        </aside>
      </form>
    </div>
  );
}
