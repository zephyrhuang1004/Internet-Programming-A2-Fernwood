import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { EmptyState } from "./EmptyState";
import { I } from "./Icons";

export function RequireAdmin({ children }) {
  const { isAuthed, isAdmin, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <div className="page"><p className="muted">Loading…</p></div>;
  if (!isAuthed) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  if (!isAdmin) {
    return (
      <div className="page narrow">
        <EmptyState icon={<I.lock />} title="Admin only" body="You need an admin account to view this page." />
      </div>
    );
  }
  return children;
}
