import { useState } from "react";
import { Link } from "react-router-dom";
import { I } from "./Icons";
import { IMG, IMG_FALLBACK } from "../constants";
import { fmtMoney, highlight } from "../lib/format";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export function ProductCard({ product, query = "" }) {
  const [hover, setHover] = useState(false);
  const { add } = useCart();
  const { user } = useAuth();
  const toast = useToast();

  const onQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast("Sign in to add items", "warn"); return; }
    try {
      await add(product._id, 1);
      toast(`Added ${product.name}`, "good");
    } catch (err) { toast(err.message, "error"); }
  };

  return (
    <Link to={`/products/${product._id}`} className="pc"
          onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className="pc-img">
        <img loading="lazy" alt=""
             src={IMG(product.img, 800)}
             style={{ transform: hover ? "scale(1.04)" : "scale(1)" }}
             onError={(e) => { e.currentTarget.src = IMG_FALLBACK; }} />
        {product.stock > 0 && product.stock <= 5 && <span className="badge amber pc-badge">Low stock</span>}
        {product.stock === 0 && <span className="badge rose pc-badge">Sold out</span>}
        {product.stock > 0 && (
          <button className="pc-quick" onClick={onQuickAdd} style={{ opacity: hover ? 1 : 0 }}>
            <I.bag /> Quick add
          </button>
        )}
      </div>
      <div>
        <div className="row between" style={{ alignItems: "baseline" }}>
          <h3 className="pc-name">{highlight(product.name, query)}</h3>
          <div className="num pc-price">{fmtMoney(product.price)}</div>
        </div>
        <div className="pc-meta mono muted">{product.category} · {product.material}</div>
      </div>
    </Link>
  );
}
