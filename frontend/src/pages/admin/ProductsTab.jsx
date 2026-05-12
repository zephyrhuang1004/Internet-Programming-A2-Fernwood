import { useEffect, useMemo, useState } from "react";
import {
  listAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
  uploadProductImage,
} from "../../services/adminService";
import { SearchBox } from "../../components/SearchBox";
import { EmptyState } from "../../components/EmptyState";
import { Modal } from "../../components/admin/Modal";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { I } from "../../components/Icons";
import { fmtMoney, fmtDate, highlight } from "../../lib/format";
import { imgUrl } from "../../lib/img";

const CATEGORIES = ["Seating", "Tables", "Storage", "Lighting", "Bedroom", "Rugs & Textiles"];
const MATERIALS = ["Solid oak", "Walnut", "Linen", "Wool", "Bouclé", "Brass", "Leather"];
const PALETTES = ["Sand", "Oat", "Clay", "Honey", "Moss", "Brass", "Bone"];


const EMPTY_FORM = {
  name: "",
  category: "Seating",
  price: 500,
  stock: 10,
  material: "Solid oak",
  tagline: "",
  palette: "Sand",
  img: "1555041469-a586c61ea9bc",
};

export default function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState("");
  const [showRetired, setShowRetired] = useState(false);
  const [editing, setEditing] = useState(null); // null | "new" | productObj
  const [confirmDel, setConfirmDel] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const reload = async () => {
    try {
      const rows = await listAdminProducts("");
      setProducts(rows || []);
      setErr(null);
    } catch (e) {
      setErr(e.message);
    }
  };

  useEffect(() => { reload(); }, []);

  const retiredCount = useMemo(
    () => products.filter((p) => p.deleted_at).length,
    [products],
  );

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return products
      .filter((p) => (showRetired ? p.deleted_at : !p.deleted_at))
      .filter((p) => {
        if (!qq) return true;
        return (
          p.name.toLowerCase().includes(qq) ||
          (p.category || "").toLowerCase().includes(qq) ||
          (p.material || "").toLowerCase().includes(qq) ||
          (p._id || "").toLowerCase().includes(qq)
        );
      });
  }, [products, q, showRetired]);

  const handleSave = async (form) => {
    setBusy(true);
    try {
      if (editing === "new") {
        await createProduct(form);
      } else if (editing) {
        await updateProduct(editing._id, { ...form, version: editing.version });
      }
      setEditing(null);
      await reload();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDel) return;
    setBusy(true);
    try {
      await deleteProduct(confirmDel._id);
      setConfirmDel(null);
      await reload();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleRestore = async (product) => {
    setBusy(true);
    try {
      await restoreProduct(product._id);
      await reload();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="page-head">
        <div>
          <div className="mono muted">CRUD · PRODUCTS</div>
          <h2 style={{ marginTop: 4 }}>Products</h2>
          <div className="sub">
            {showRetired
              ? `${retiredCount} retired piece${retiredCount === 1 ? "" : "s"}.`
              : `Create, edit, retire pieces. ${products.length - retiredCount} active.`}
          </div>
        </div>
        {!showRetired && (
          <button className="btn clay" onClick={() => setEditing("new")} disabled={busy}>
            <I.plus /> New product
          </button>
        )}
      </div>

      {err && <p className="err">{err}</p>}

      <div className="row wrap" style={{ gap: 10 }}>
        <div style={{ flex: 1, minWidth: 280, maxWidth: 420 }}>
          <SearchBox value={q} onChange={setQ} placeholder="Search by name, material, id…" />
        </div>
        <div className="row" style={{ gap: 6 }}>
          <button
            type="button"
            className={`chip ${!showRetired ? "active" : ""}`}
            onClick={() => setShowRetired(false)}
          >
            Active
          </button>
          <button
            type="button"
            className={`chip ${showRetired ? "active" : ""}`}
            onClick={() => setShowRetired(true)}
          >
            Retired{retiredCount > 0 ? ` · ${retiredCount}` : ""}
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 60 }}></th>
                <th>Name</th>
                <th>Category</th>
                <th>Material</th>
                <th className="num">Price</th>
                <th className="num">Stock</th>
                <th style={{ width: 110 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: 40 }}>
                    <EmptyState
                      icon={<I.box />}
                      title={showRetired ? "Nothing retired" : "No products match"}
                      body={showRetired ? "Retired items will appear here." : "Try a different search term."}
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p._id}>
                    <td>
                      {p.img && (
                        <img
                          src={imgUrl(p.img, 120)}
                          alt=""
                          style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }}
                        />
                      )}
                    </td>
                    <td>
                      <div>
                        {highlight(p.name, q)}
                        {p.deleted_at && <span className="badge rose" style={{ marginLeft: 6 }}>retired</span>}
                      </div>
                      <div className="mono muted" style={{ fontSize: 11 }}>{highlight(p._id, q)}</div>
                    </td>
                    <td>{highlight(p.category, q)}</td>
                    <td>{highlight(p.material, q)}</td>
                    <td className="num">{fmtMoney(p.price)}</td>
                    <td className="num">
                      {p.stock === 0 ? (
                        <span className="stock-cell danger">Sold out</span>
                      ) : p.stock <= 5 ? (
                        <span className="stock-cell warn">{p.stock}</span>
                      ) : (
                        <span className="stock-cell">{p.stock}</span>
                      )}
                    </td>
                    <td>
                      <div className="row" style={{ gap: 4, justifyContent: "flex-end" }}>
                        {p.deleted_at ? (
                          <button
                            className="btn ghost xs"
                            onClick={() => handleRestore(p)}
                            disabled={busy}
                            title="Restore"
                          >
                            <I.arrowLeft /> Restore
                          </button>
                        ) : (
                          <>
                            <button
                              className="btn ghost xs"
                              onClick={() => setEditing(p)}
                              disabled={busy}
                              title="Edit"
                            >
                              <I.edit />
                            </button>
                            <button
                              className="btn ghost xs danger"
                              onClick={() => setConfirmDel(p)}
                              disabled={busy}
                              title="Delete"
                            >
                              <I.trash />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProductEditor
        open={editing !== null}
        product={editing === "new" ? null : editing}
        onClose={() => setEditing(null)}
        onSave={handleSave}
        busy={busy}
      />

      <ConfirmDialog
        open={!!confirmDel}
        title="Retire this product?"
        message={
          confirmDel
            ? `"${confirmDel.name}" will be removed from the catalogue. Existing orders keep their history.`
            : ""
        }
        confirmLabel="Retire"
        destructive
        onCancel={() => setConfirmDel(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function ProductEditor({ open, product, onClose, onSave, busy }) {
  const isNew = !product;
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const { url } = await uploadProductImage(file);
      setForm((f) => ({ ...f, img: url }));
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
      e.target.value = ""; // allow re-selecting same file
    }
  };

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (product) {
      setForm({
        name: product.name || "",
        category: product.category || "Seating",
        price: product.price ?? 500,
        stock: product.stock ?? 0,
        material: product.material || "Solid oak",
        tagline: product.tagline || "",
        palette: product.palette || "Sand",
        img: product.img || "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, product]);

  if (!open) return null;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Name is required");
    if (form.price < 0) return setError("Price must be ≥ 0");
    if (form.stock < 0) return setError("Stock must be ≥ 0");
    await onSave(form);
  };

  return (
    <Modal open={open} onClose={onClose} wide>
      <div className="row between" style={{ alignItems: "flex-start" }}>
        <div>
          <div className="mono muted">
            {isNew ? "CREATE" : "EDIT"}
            {!isNew && product && (
              <>
                <span title="Optimistic-lock version, bumps on every save"> · v{product.version ?? 0}</span>
                {product.created_at && (
                  <span> · Added {fmtDate(product.created_at)}</span>
                )}
              </>
            )}
          </div>
          <h3 style={{ fontFamily: "var(--f-display)", fontSize: 24, marginTop: 2 }}>
            {isNew ? "New product" : form.name || "Untitled"}
          </h3>
        </div>
        <button className="icon-btn" onClick={onClose} aria-label="Close"><I.close /></button>
      </div>

      <form onSubmit={submit} style={{ marginTop: 18 }}>
        <div className="pe-grid">
          <div className="pe-preview">
            {form.img && (
              <img src={imgUrl(form.img, 600)} alt="" style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", borderRadius: "var(--r-md)" }} />
            )}
            <div className="field" style={{ marginTop: 10 }}>
              <label>Image</label>
              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <label className="btn ghost xs" style={{ cursor: uploading ? "wait" : "pointer" }}>
                  <I.plus /> {uploading ? "Uploading…" : "Upload"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleUpload}
                    disabled={uploading}
                    style={{ display: "none" }}
                  />
                </label>
                {form.img && (
                  <button type="button" className="btn ghost xs danger" onClick={() => set("img", "")}>
                    Clear
                  </button>
                )}
              </div>
              {uploadError && <p className="err" style={{ marginTop: 6 }}>{uploadError}</p>}
            </div>
            <div className="field" style={{ marginTop: 10 }}>
              <label>Or paste a URL / Unsplash photo ID</label>
              <input className="input mono" value={form.img} onChange={(e) => set("img", e.target.value)} />
            </div>
          </div>

          <div className="stack">
            <div className="field">
              <label>Name</label>
              <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} autoFocus={isNew} required />
            </div>
            <div className="row" style={{ gap: 10 }}>
              <div className="field" style={{ flex: 1 }}>
                <label>Category</label>
                <select className="select" value={form.category} onChange={(e) => set("category", e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label>Material</label>
                <select className="select" value={form.material} onChange={(e) => set("material", e.target.value)}>
                  {MATERIALS.map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div className="row" style={{ gap: 10 }}>
              <div className="field" style={{ flex: 1 }}>
                <label>Price ($)</label>
                <input
                  type="number"
                  min="0"
                  className="input num"
                  value={form.price}
                  onChange={(e) => set("price", Number(e.target.value))}
                  required
                />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label>Stock</label>
                <input
                  type="number"
                  min="0"
                  className="input num"
                  value={form.stock}
                  onChange={(e) => set("stock", Number(e.target.value))}
                  required
                />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label>Palette</label>
                <select className="select" value={form.palette} onChange={(e) => set("palette", e.target.value)}>
                  {PALETTES.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="field">
              <label>Tagline</label>
              <textarea
                className="textarea"
                rows={2}
                value={form.tagline}
                onChange={(e) => set("tagline", e.target.value)}
                placeholder="One-line product story"
              />
            </div>
            {error && <p className="err">{error}</p>}
            <div className="row" style={{ justifyContent: "flex-end", gap: 8, marginTop: 6 }}>
              <button type="button" className="btn ghost" onClick={onClose} disabled={busy}>Cancel</button>
              <button type="submit" className="btn clay" disabled={busy}>
                {busy ? "Saving…" : isNew ? "Create product" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
