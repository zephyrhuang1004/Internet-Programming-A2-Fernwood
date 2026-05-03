import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { I } from "../components/Icons";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      if (!name.trim()) throw new Error("Please enter your name.");
      if (password.length < 4) throw new Error("Password must be at least 4 characters.");
      await register({ name, email, password });
      toast("Welcome to Fernwood", "good");
      navigate("/account", { replace: true });
    } catch (ex) { setErr(ex.message); } finally { setBusy(false); }
  };

  return (
    <div className="page auth">
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div className="brand-mark" style={{ margin: "0 auto 14px", width: 34, height: 34 }} />
        <h2 style={{ fontSize: 40 }}>Make yourself at home.</h2>
        <div className="muted" style={{ marginTop: 6, fontSize: 14 }}>Create an account — it takes a moment.</div>
      </div>
      <form className="card" onSubmit={submit}>
        <div className="stack">
          <div className="field">
            <label>Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {err && <div className="err">{err}</div>}
          <button className="btn clay" type="submit" disabled={busy}>
            {busy ? "One moment…" : "Create account"} <I.arrow />
          </button>
        </div>
      </form>
      <div className="row" style={{ justifyContent: "center", marginTop: 18, fontSize: 13.5 }}>
        <span className="muted">Have an account? <Link className="btn ghost xs" to="/login">Sign in</Link></span>
      </div>
    </div>
  );
}
