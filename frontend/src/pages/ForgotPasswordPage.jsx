import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { I } from "../components/Icons";
import { StubBanner } from "../components/StubBanner";
import { useToast } from "../context/ToastContext";
import { forgotPassword } from "../services/authService";

export default function ForgotPasswordPage() {
  const toast = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [issued, setIssued] = useState(null); // { reset_token?, mock? }
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      const data = await forgotPassword({ email });
      setIssued(data);
      toast("If that email exists, a reset link has been sent.", "good");
    } catch (ex) { setErr(ex.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="page auth">
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div className="brand-mark" style={{ margin: "0 auto 14px", width: 34, height: 34 }} />
        <h2 style={{ fontSize: 40 }}>Reset your password.</h2>
        <div className="muted" style={{ marginTop: 6, fontSize: 14 }}>
          We'll send a single-use reset link to your email.
        </div>
      </div>

      <StubBanner person="Person 1" slice="Forgot Password" />

      {!issued ? (
        <form className="card" onSubmit={submit}>
          <div className="stack">
            <div className="field">
              <label>Email</label>
              <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus required />
            </div>
            {err && <div className="err">{err}</div>}
            <button className="btn clay" type="submit" disabled={busy}>
              {busy ? "Sending…" : "Send reset link"} <I.arrow />
            </button>
          </div>
        </form>
      ) : (
        <div className="card">
          <div className="mono muted" style={{ marginBottom: 8 }}>CHECK YOUR INBOX</div>
          <p style={{ marginBottom: 12 }}>
            If an account exists for <b>{email}</b>, a password reset link has been sent.
          </p>
          {issued.mock && issued.reset_token && (
            <div className="card" style={{ background: "var(--bone-2)", border: "1px dashed var(--line-2)", marginBottom: 12 }}>
              <div className="mono muted" style={{ marginBottom: 6 }}>DEV MOCK TOKEN</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 13, wordBreak: "break-all" }}>{issued.reset_token}</div>
              <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
                Person 1 has not implemented the real flow yet — paste this into the next step to continue.
              </div>
            </div>
          )}
          <div className="row" style={{ gap: 8 }}>
            <button className="btn" onClick={() => navigate(`/reset-password${issued.reset_token ? `?token=${encodeURIComponent(issued.reset_token)}` : ""}`)}>
              Continue to reset <I.arrow />
            </button>
            <Link className="btn ghost" to="/login">Back to sign in</Link>
          </div>
        </div>
      )}

      <div className="row" style={{ justifyContent: "center", marginTop: 18, fontSize: 13.5 }}>
        <Link className="btn ghost xs" to="/login">Remembered it? Sign in</Link>
      </div>
    </div>
  );
}
