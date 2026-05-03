import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { I } from "../components/Icons";
import { EmptyState } from "../components/EmptyState";
import { StubBanner } from "../components/StubBanner";
import { ProductCard } from "../components/ProductCard";
import { getProduct, listProducts, isBackendStubbed } from "../services/productService";
import { fmtMoney } from "../lib/format";
import { IMG, IMG_FALLBACK } from "../constants";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { add } = useCart();
  const toast = useToast();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [stub, setStub] = useState(false);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const [p, all, stubbed] = await Promise.all([getProduct(id), listProducts(), isBackendStubbed()]);
      if (cancelled) return;
      setProduct(p);
      setStub(stubbed);
      if (p) setRelated(all.filter((x) => x.category === p.category && x._id !== p._id).slice(0, 4));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [id]);

  const onAdd = async () => {
    if (!user) { toast("Sign in to add items", "warn"); navigate("/login"); return; }
    try {
      await add(product._id, qty);
      toast(`Added ${qty} × ${product.name}`, "good");
    } catch (e) { toast(e.message, "error"); }
  };

  if (loading) return <div className="page"><p className="muted">Loading…</p></div>;
  if (!product) return (
    <div className="page">
      <Link to="/products" className="btn ghost sm"><I.arrowLeft /> Back</Link>
      <EmptyState icon={<I.box />} title="Product not found" body="It may have been removed." />
    </div>
  );

  return (
    <div className="page">
      {stub && <StubBanner person="Person 2" slice="Catalogue" />}
      <Link to="/products" className="btn ghost sm" style={{ marginBottom: 18 }}>
        <I.arrowLeft /> Back to collection
      </Link>
      <div className="pd">
        <div className="pd-gallery">
          <img src={IMG(product.img, 1400)} alt="" onError={(e) => { e.currentTarget.src = IMG_FALLBACK; }} />
          <div className="pd-thumbs">
            {[product.img, product.img, product.img].map((x, i) => (
              <img key={i} src={IMG(x, 300)} alt="" style={{ opacity: i === 0 ? 1 : 0.5 }}
                   onError={(e) => { e.currentTarget.src = IMG_FALLBACK; }} />
            ))}
          </div>
        </div>
        <div>
          <div className="mono muted">{product.category}</div>
          <h2 style={{ marginTop: 6, marginBottom: 8 }}>{product.name}</h2>
          <div style={{ fontSize: 16, color: "var(--ink-2)", marginBottom: 20 }}>{product.tagline}</div>
          <div className="num" style={{ fontSize: 28, fontFamily: "var(--f-display)" }}>{fmtMoney(product.price)}</div>
          <div className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>Free shipping · 30-day returns · 10-year warranty</div>

          <hr className="hr" />

          <div className="pd-specs">
            <div><span className="mono muted">Material</span><div>{product.material}</div></div>
            <div><span className="mono muted">Palette</span><div>{product.palette}</div></div>
            <div><span className="mono muted">In stock</span><div className="num">{product.stock} units</div></div>
            <div><span className="mono muted">Ships in</span><div>5–7 days</div></div>
          </div>

          <hr className="hr" />

          <div className="row" style={{ gap: 10 }}>
            <div className="qty" style={{ background: "var(--bone-2)" }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))}><I.minus /></button>
              <span>{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock || 99, qty + 1))}><I.plus /></button>
            </div>
            <button className="btn clay" onClick={onAdd} disabled={product.stock === 0} style={{ flex: 1 }}>
              <I.bag /> {product.stock === 0 ? "Sold out" : `Add to bag — ${fmtMoney(product.price * qty)}`}
            </button>
          </div>

          <div className="pd-notes">
            <div><strong>Care.</strong> Wipe with a dry cloth. Re-oil the wood once a year.</div>
            <div><strong>Dimensions.</strong> W 82 × D 86 × H 74 cm.</div>
            <div><strong>Origin.</strong> Handmade in Porto, Portugal.</div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section style={{ marginTop: 60 }}>
          <h3 style={{ fontFamily: "var(--f-display)", fontSize: 28, marginBottom: 20 }}>
            Also in {product.category.toLowerCase()}
          </h3>
          <div className="grid">
            {related.map((r) => <ProductCard key={r._id} product={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}
