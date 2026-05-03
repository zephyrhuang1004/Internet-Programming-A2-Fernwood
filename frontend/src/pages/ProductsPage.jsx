import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "../components/ProductCard";
import { SearchBox } from "../components/SearchBox";
import { EmptyState } from "../components/EmptyState";
import { StubBanner } from "../components/StubBanner";
import { I } from "../components/Icons";
import { listProducts, isBackendStubbed } from "../services/productService";
import { CATEGORIES } from "../constants";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [stub, setStub] = useState(false);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");

  useEffect(() => {
    (async () => {
      const [items, stubbed] = await Promise.all([listProducts(), isBackendStubbed()]);
      setProducts(items);
      setStub(stubbed);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (cat !== "All" && p.category !== cat) return false;
      if (!q) return true;
      return [p.name, p.category, p.material, p.tagline].some((s) => (s || "").toLowerCase().includes(q));
    });
  }, [products, query, cat]);

  return (
    <div className="page">
      {stub && <StubBanner person="Person 2" slice="Catalogue" />}
      <div className="page-head">
        <div>
          <div className="mono muted">SPRING 26</div>
          <h2 style={{ marginTop: 4 }}>The full collection.</h2>
          <div className="sub">{products.length} pieces in stock.</div>
        </div>
        <div style={{ width: 320 }}>
          <SearchBox value={query} onChange={setQuery} />
        </div>
      </div>

      <div className="filter-bar">
        <div className="row wrap" style={{ gap: 6 }}>
          {["All", ...CATEGORIES].map((c) => (
            <button key={c} className={`chip ${cat === c ? "active" : ""}`} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
      </div>

      <div style={{ height: 24 }} />

      {filtered.length === 0 ? (
        <EmptyState icon={<I.search />} title="Nothing matches that yet." body="Try a different word." />
      ) : (
        <div className="grid">
          {filtered.map((p) => <ProductCard key={p._id} product={p} query={query} />)}
        </div>
      )}
    </div>
  );
}
