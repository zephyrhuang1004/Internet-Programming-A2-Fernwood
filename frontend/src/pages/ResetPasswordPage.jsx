import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { I } from "../components/Icons";
import { StubBanner } from "../components/StubBanner";
import { useToast } from "../context/ToastContext";
import { resetPassword } from "../services/authService";

export default function ResetPasswordPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [token, setToken] = useState(params.get("token") || "");
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (pw1.length < 4) { setErr("Password must be at least 4 characters."); return; }
    if (pw1 !== pw2) { setErr("Passwords do not match."); return; }
    setBusy(true);
    try {
      await resetPassword({ token, new_password: pw1 });
      toast("Password updated. Please sign in.", "good");
      navigate("/login", { replace: true });
    } catch (ex) { setErr(ex.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="page auth">
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div className="brand-mark" style={{ margin: "0 auto 14px", width: 34, height: 34 }} />
        <h2 style={{ fontSize: 40 }}>Choose a new password.</h2>
        <div className="muted" style={{ marginTop: 6, fontSize: 14 }}>
          You'll be signed out everywhere after the reset.
        </div>
      </div>

      <StubBanner person="Person 1" slice="Reset Password" />

      <form className="card" onSubmit={submit}>
        <div className="stack">
          <div className="field">
            <label>Reset token</label>
            <input className="input" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste the token from your email" required />
          </div>
          <div className="field">
            <label>New password</label>
            <input type="password" className="input" value={pw1} onChange={(e) => setPw1(e.target.value)} required />
          </div>
          <div className="field">
            <label>Confirm new password</label>
            <input type="password" className="input" value={pw2} onChange={(e) => setPw2(e.target.value)} required />
          </div>
          {err && <div className="err">{err}</div>}
          <button className="btn clay" type="submit" disabled={busy}>
            {busy ? "Updating…" : "Update password"} <I.arrow />
          </button>
        </div>
      </form>

      <div className="row" style={{ justifyContent: "center", marginTop: 18, fontSize: 13.5 }}>
        <Link className="btn ghost xs" to="/login">Back to sign in</Link>
      </div>
    </div>
  );
}
