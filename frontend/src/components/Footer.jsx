import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="col">
          <div className="brand" style={{ cursor: "default" }}>
            <span className="brand-mark" /><span>Fernwood</span>
          </div>
          <span style={{ maxWidth: 280, display: "block", marginTop: 8, fontSize: 13 }}>
            Slow furniture, made by small workshops. Based in Naarm / Melbourne.
          </span>
        </div>
        <div className="col">
          <h4>Shop</h4>
          {["Seating", "Tables", "Storage", "Lighting", "Bedroom"].map((c) => (
            <Link key={c} to="/products">{c}</Link>
          ))}
        </div>
        <div className="col">
          <h4>Care</h4>
          <a>Shipping</a><a>Returns</a><a>Warranty</a><a>Trade program</a>
        </div>
        <div className="col">
          <h4>Studio</h4>
          <a>Journal</a><a>Our makers</a><a>Press</a><a>Contact</a>
        </div>
      </div>
      <div className="footer-inner legal">
        <span>© 2026 Fernwood Studio · Student prototype — no real transactions are processed.</span>
      </div>
    </footer>
  );
}
