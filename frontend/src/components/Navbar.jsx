import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { I } from "./Icons";
import { initials } from "../lib/format";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

export function Navbar({ onOpenCart }) {
  const { user, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [menu, setMenu] = useState(false);

  const showSearchSlot = location.pathname === "/" || location.pathname.startsWith("/products");

  const onLogout = async () => {
    await logout();
    toast("Signed out", "warn");
    setMenu(false);
    navigate("/");
  };

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark" />
          <span>Fernwood</span>
        </Link>

        <div className="topbar-mid">
          <nav className="nav">
            <NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>Shop</NavLink>
            <NavLink to="/products" className={({ isActive }) => isActive ? "active" : ""}>Catalog</NavLink>
            <NavLink to="/account" className={({ isActive }) => isActive ? "active" : ""}>Account</NavLink>
            {isAdmin && <NavLink to="/admin" className={({ isActive }) => isActive ? "active" : ""}>Admin</NavLink>}
          </nav>
          <div className="topbar-search-slot" style={{ visibility: showSearchSlot ? "visible" : "hidden" }} />
        </div>

        <div className="top-actions">
          {user ? (
            <div style={{ position: "relative" }}>
              <button className="avatar" onClick={(e) => { e.stopPropagation(); setMenu((m) => !m); }} title={user.email}>
                {initials(user.name)}
              </button>
              {menu && (
                <div onClick={(e) => e.stopPropagation()}
                     style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", minWidth: 220,
                              background: "var(--bone)", border: "1px solid var(--line)", borderRadius: "var(--r-md)",
                              padding: 6, boxShadow: "var(--shadow-md)", zIndex: 100 }}>
                  <div className="muted" style={{ padding: "10px 12px 4px", fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.06em" }}>SIGNED IN AS</div>
                  <div style={{ padding: "0 12px 8px", fontSize: 13 }}>
                    <div>{user.name}</div>
                    <div className="mono muted" style={{ fontSize: 11 }}>{user.email}</div>
                  </div>
                  <div style={{ height: 1, background: "var(--line)", margin: "4px 0" }} />
                  <MenuItem icon={<I.user />} label="My account" onClick={() => { setMenu(false); navigate("/account"); }} />
                  {isAdmin && <MenuItem icon={<I.bolt />} label="Admin console" onClick={() => { setMenu(false); navigate("/admin"); }} />}
                  <div style={{ height: 1, background: "var(--line)", margin: "4px 0" }} />
                  <MenuItem icon={<I.logout />} label="Sign out" onClick={onLogout} />
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn ghost sm">Sign in</Link>
          )}
          <button className="cart-pill" onClick={onOpenCart} aria-label={`Cart, ${count} items`}>
            <I.bag /> <span>Bag</span> <span className="count">{count}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function MenuItem({ icon, label, onClick }) {
  return (
    <button onClick={onClick}
            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px",
                     background: "transparent", border: "none", borderRadius: 8, textAlign: "left",
                     cursor: "pointer", fontSize: 13.5, color: "var(--ink)" }}>
      {icon} {label}
    </button>
  );
}
