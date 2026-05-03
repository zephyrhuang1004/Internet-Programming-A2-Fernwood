import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { I } from "../components/Icons";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      await login({ email, password });
      toast("Signed in", "good");
      navigate(next, { replace: true });
    } catch (ex) { setErr(ex.message); } finally { setBusy(false); }
  };

  const fillAdmin = () => { setEmail("admin@fernwood.co"); setPassword("admin123"); };
  const fillCustomer = () => { setEmail("ivy@example.com"); setPassword("password"); };

  return (
    <div className="page auth">
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div className="brand-mark" style={{ margin: "0 auto 14px", width: 34, height: 34 }} />
        <h2 style={{ fontSize: 40 }}>Welcome back.</h2>
        <div className="muted" style={{ marginTop: 6, fontSize: 14 }}>Sign in to see your bag and orders.</div>
      </div>
      <form className="card" onSubmit={submit}>
        <div className="stack">
          <div className="field">
            <label>Email</label>
            <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {err && <div className="err">{err}</div>}
          <button className="btn clay" type="submit" disabled={busy}>
            {busy ? "One moment…" : "Sign in"} <I.arrow />
          </button>
        </div>
      </form>
      <div className="row" style={{ justifyContent: "center", marginTop: 18, fontSize: 13.5, gap: 14, flexWrap: "wrap" }}>
        <span className="muted">New here? <Link className="btn ghost xs" to="/register">Create an account</Link></span>
        <Link className="btn ghost xs" to="/forgot-password">Forgot password?</Link>
      </div>

      <div className="card" style={{ marginTop: 22, background: "var(--bone-2)", border: "1px dashed var(--line-2)" }}>
        <div className="mono muted" style={{ marginBottom: 8 }}>DEMO CREDENTIALS</div>
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <button type="button" className="btn ghost xs" onClick={fillAdmin}>Admin · admin@fernwood.co</button>
          <button type="button" className="btn ghost xs" onClick={fillCustomer}>Customer · ivy@example.com</button>
        </div>
        <div className="muted" style={{ fontSize: 11.5, marginTop: 8 }}>
          Argon2id hash + per-user salt on the server. Refresh token in httpOnly cookie. 30-min access JWT in memory.
        </div>
      </div>
    </div>
  );
}
