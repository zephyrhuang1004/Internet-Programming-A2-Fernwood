import { useEffect, useMemo, useState } from "react";
import { listUsers, setUserRole, deleteUser, getUserCart } from "../../services/adminService";
import { SearchBox } from "../../components/SearchBox";
import { Modal } from "../../components/admin/Modal";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { EmptyState } from "../../components/EmptyState";
import { I } from "../../components/Icons";
import { fmtDate, fmtDateTime, fmtMoney, initials, highlight } from "../../lib/format";

function imgUrl(id, size = 120) {
  if (!id) return "";
  if (id.startsWith("http")) return id;
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${size}&q=70`;
}

export default function UsersTab() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [editing, setEditing] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const reload = async () => {
    try {
      const rows = await listUsers("");
      setUsers(rows || []);
      setErr(null);
    } catch (e) {
      setErr(e.message);
    }
  };

  useEffect(() => { reload(); }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return users;
    return users.filter(
      (u) => u.name.toLowerCase().includes(qq) || u.email.toLowerCase().includes(qq),
    );
  }, [users, q]);

  const handleSave = async (form) => {
    if (!editing) return;
    setBusy(true);
    try {
      if (form.role !== editing.role) {
        await setUserRole(editing._id, form.role);
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
      await deleteUser(confirmDel._id);
      setConfirmDel(null);
      await reload();
    } catch (e) {
      setErr(e.message);
      setConfirmDel(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="page-head">
        <div>
          <div className="mono muted">USERS</div>
          <h2 style={{ marginTop: 4 }}>Users &amp; carts</h2>
          <div className="sub">Inspect any customer, edit role, remove accounts.</div>
        </div>
      </div>

      {err && <p className="err">{err}</p>}

      <div style={{ maxWidth: 420 }}>
        <SearchBox value={q} onChange={setQ} placeholder="Search users by name or email…" />
      </div>

      <div className="stack" style={{ gap: 10 }}>
        {filtered.length === 0 ? (
          <p className="muted" style={{ fontSize: 13.5 }}>No users match.</p>
        ) : (
          filtered.map((u) => {
            const isOpen = expanded === u._id;
            return (
              <div key={u._id} className="card" style={{ padding: 0 }}>
                <button
                  className="user-row"
                  onClick={() => setExpanded(isOpen ? null : u._id)}
                  type="button"
                >
                  <div className="avatar" style={{ pointerEvents: "none" }}>{initials(u.name)}</div>
                  <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
                    <div className="row" style={{ gap: 10 }}>
                      <span>{highlight(u.name, q)}</span>
                      {u.role === "admin" && <span className="badge clay">Admin</span>}
                    </div>
                    <div className="mono muted" style={{ fontSize: 11.5 }}>
                      {highlight(u.email, q)} · joined {fmtDate(u.joined_at)}
                    </div>
                  </div>
                  <I.arrow style={{ transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
                </button>
                {isOpen && (
                  <div style={{ borderTop: "1px solid var(--line)", padding: 18 }}>
                    <div className="row between" style={{ marginBottom: 4 }}>
                      <div>
                        <div className="mono muted" style={{ fontSize: 11 }}>USER ID</div>
                        <div className="mono">{u._id}</div>
                      </div>
                      <div className="row" style={{ gap: 6 }}>
                        <button className="btn ghost xs" onClick={() => setEditing(u)} disabled={busy}>
                          <I.edit /> Edit role
                        </button>
                        {u.role !== "admin" && (
                          <button className="btn ghost xs danger" onClick={() => setConfirmDel(u)} disabled={busy}>
                            <I.trash /> Delete
                          </button>
                        )}
                      </div>
                    </div>
                    <UserCartPanel userId={u._id} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {editing && (
        <UserEditor user={editing} onClose={() => setEditing(null)} onSave={handleSave} busy={busy} />
      )}

      <ConfirmDialog
        open={!!confirmDel}
        title="Delete this user?"
        message={
          confirmDel
            ? `${confirmDel.email} will be removed along with their active cart. Past orders stay in history.`
            : ""
        }
        confirmLabel="Delete user"
        destructive
        onCancel={() => setConfirmDel(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function UserCartPanel({ userId }) {
  const [cart, setCart] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErr(null);
    getUserCart(userId)
      .then((data) => { if (!cancelled) setCart(data); })
      .catch((e) => { if (!cancelled) setErr(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [userId]);

  if (loading) return <p className="muted" style={{ fontSize: 12.5, marginTop: 14 }}>Loading cart…</p>;
  if (err) return <p className="err" style={{ marginTop: 14 }}>{err}</p>;
  if (!cart) return null;

  const items = cart.items || [];
  const isEmpty = items.length === 0;

  return (
    <div style={{ marginTop: 14 }}>
      <div className="row between" style={{ marginBottom: 8 }}>
        <div className="mono muted" style={{ fontSize: 11 }}>SHOPPING CART</div>
        {cart.updated_at && (
          <div className="mono muted" style={{ fontSize: 11 }}>
            Updated {fmtDateTime(cart.updated_at)}
          </div>
        )}
      </div>

      {isEmpty ? (
        <div className="panel" style={{ padding: 18 }}>
          <EmptyState
            icon={<I.bag />}
            title="Empty cart"
            body="This customer hasn't added anything yet."
          />
        </div>
      ) : (
        <>
          <div className="stack" style={{ gap: 0 }}>
            {items.map((line) => (
              <div
                key={line.product_id}
                className="row"
                style={{
                  gap: 14,
                  padding: "12px 0",
                  borderBottom: "1px dashed var(--line)",
                  opacity: line.product_deleted ? 0.5 : 1,
                }}
              >
                {line.img ? (
                  <img
                    src={imgUrl(line.img, 120)}
                    alt=""
                    style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover", flex: "none" }}
                  />
                ) : (
                  <div style={{ width: 56, height: 56, borderRadius: 10, background: "var(--bone-2)", flex: "none" }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14 }}>
                    {line.name}
                    {line.product_deleted && (
                      <span className="badge rose" style={{ marginLeft: 6 }}>removed</span>
                    )}
                  </div>
                  <div className="mono muted" style={{ fontSize: 11 }}>
                    {line.category} · {fmtMoney(line.unit_price)} × {line.qty}
                  </div>
                </div>
                <div className="num" style={{ fontFamily: "var(--f-display)", fontSize: 18, flex: "none" }}>
                  {fmtMoney(line.line_total)}
                </div>
              </div>
            ))}
          </div>
          <div className="row between" style={{ marginTop: 10 }}>
            <div className="mono muted" style={{ fontSize: 11 }}>
              {items.length} line{items.length === 1 ? "" : "s"}
            </div>
            <div style={{ fontFamily: "var(--f-display)", fontSize: 22 }}>
              {fmtMoney(cart.subtotal)}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function UserEditor({ user, onClose, onSave, busy }) {
  const [role, setRole] = useState(user.role);

  const submit = (e) => {
    e.preventDefault();
    onSave({ role });
  };

  return (
    <Modal open onClose={onClose}>
      <h3 style={{ fontFamily: "var(--f-display)", fontSize: 24 }}>Edit user</h3>
      <div className="sub mono muted">{user._id}</div>
      <form onSubmit={submit} className="stack" style={{ marginTop: 14, gap: 14 }}>
        <div className="field">
          <label>Name</label>
          <input className="input" value={user.name} disabled />
        </div>
        <div className="field">
          <label>Email</label>
          <input className="input" value={user.email} disabled />
        </div>
        <div className="field">
          <label>Role</label>
          <select className="select" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="row" style={{ justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
          <button type="button" className="btn ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="submit" className="btn clay" disabled={busy || role === user.role}>
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
