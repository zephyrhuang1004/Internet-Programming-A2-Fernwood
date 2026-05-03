import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { I } from "../components/Icons";
import { ProductCard } from "../components/ProductCard";
import { SearchBox } from "../components/SearchBox";
import { EmptyState } from "../components/EmptyState";
import { StubBanner } from "../components/StubBanner";
import { listProducts, isBackendStubbed } from "../services/productService";
import { fmtMoney } from "../lib/format";
import { CATEGORIES, IMG, IMG_FALLBACK } from "../constants";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [stub, setStub] = useState(false);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(4000);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [items, stubbed] = await Promise.all([listProducts(), isBackendStubbed()]);
      if (cancelled) return;
      setProducts(items);
      setStub(stubbed);
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) => {
      if (cat !== "All" && p.category !== cat) return false;
      if (p.price > maxPrice) return false;
      if (!q) return true;
      return [p.name, p.category, p.material, p.tagline].some((s) => (s || "").toLowerCase().includes(q));
    });
    if (sort === "price-asc")  list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "name")       list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, query, cat, sort, maxPrice]);

  const cats = ["All", ...CATEGORIES];

  return (
    <div className="page">
      {stub && <StubBanner person="Person 2" slice="Catalogue" />}

      <section className="hero">
        <div className="hero-text">
          <div className="mono muted">COLLECTION / SPRING 26</div>
          <h1>Furniture that<br/>ages kindly.</h1>
          <p className="lede">
            Honest materials, soft edges, slow design. Built by small workshops in Oaxaca,
            Porto and Kyoto — shipped to your door with a story and a warranty.
          </p>
          <div className="row" style={{ marginTop: 24, gap: 10 }}>
            <a className="btn clay" href="#grid-anchor">Shop the collection <I.arrow /></a>
            <button className="btn ghost" onClick={() => setCat("Seating")}>Seating →</button>
          </div>
        </div>
        <div className="hero-art">
          <img alt="" src={IMG("1567016432779-094069958ea5", 1200)}
               onError={(e) => { e.currentTarget.src = IMG_FALLBACK; }} />
          <div className="hero-tag">
            <span className="mono muted">No. 023</span>
            <div style={{ fontFamily: "var(--f-display)", fontSize: 22, marginTop: 4 }}>Marlow Sofa</div>
            <div className="muted" style={{ fontSize: 12 }}>Linen · $3,450</div>
          </div>
        </div>
      </section>

      <div id="grid-anchor" />
      <div className="filter-bar">
        <div className="row wrap" style={{ gap: 6 }}>
          {cats.map((c) => (
            <button key={c} className={`chip ${cat === c ? "active" : ""}`} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
        <div className="row" style={{ gap: 14 }}>
          <div style={{ width: 240 }}>
            <SearchBox value={query} onChange={setQuery} placeholder="Search sofas, lamps, linen…" />
          </div>
          <label className="row" style={{ gap: 8, fontSize: 12.5, color: "var(--ink-mute)" }}>
            <span>Under {fmtMoney(maxPrice)}</span>
            <input type="range" min="100" max="4000" step="50" value={maxPrice}
                   onChange={(e) => setMaxPrice(+e.target.value)}
                   style={{ accentColor: "var(--clay)", width: 120 }} />
          </label>
          <select className="select" style={{ width: "auto", padding: "8px 12px" }}
                  value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low → high</option>
            <option value="price-desc">Price: high → low</option>
            <option value="name">Name A → Z</option>
          </select>
        </div>
      </div>

      <div className="row between" style={{ marginTop: 18, marginBottom: 20 }}>
        <div className="mono muted">
          {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
          {query && <> · matching “{query}”</>}
          {cat !== "All" && <> · {cat}</>}
        </div>
        {(query || cat !== "All" || maxPrice < 4000) && (
          <button className="btn ghost sm" onClick={() => { setQuery(""); setCat("All"); setMaxPrice(4000); }}>
            Reset filters
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<I.search />} title="Nothing matches that yet."
                    body={<>Try a different word, or <Link to="/products">reset your filters</Link>.</>} />
      ) : (
        <div className="grid">
          {filtered.map((p) => <ProductCard key={p._id} product={p} query={query} />)}
        </div>
      )}
    </div>
  );
}
