import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function RequireAuth({ children }) {
  const { isAuthed, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <div className="page"><p className="muted">Loading…</p></div>;
  if (!isAuthed) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  return children;
}
