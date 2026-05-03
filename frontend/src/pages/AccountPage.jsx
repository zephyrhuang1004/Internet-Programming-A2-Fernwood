import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { I } from "../components/Icons";
import { StubBanner } from "../components/StubBanner";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { fmtDate } from "../lib/format";
import {
  changePassword as changePasswordSvc,
  listSessions,
  revokeSession as revokeSessionSvc,
} from "../services/authService";

export default function AccountPage() {
  const { user, logout, updateProfile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState("details");

  if (!user) return null;

  const onLogout = async () => {
    await logout();
    toast("Signed out", "warn");
    navigate("/");
  };

  return (
    <div className="page narrow">
      <div className="page-head">
        <div>
          <div className="mono muted">ACCOUNT</div>
          <h2 style={{ marginTop: 4 }}>Hello, {user.name.split(" ")[0]}.</h2>
          <div className="sub">Member since {fmtDate(user.joined_at)} · {user.email}</div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn ghost sm" onClick={() => navigate("/orders")}><I.box /> My orders</button>
          <button className="btn ghost sm" onClick={onLogout}><I.logout /> Sign out</button>
        </div>
      </div>

      <div className="row" style={{ gap: 8, marginBottom: 22 }}>
        {[["details", "Details"], ["password", "Password"], ["sessions", "Sessions"]].map(([k, l]) => (
          <button key={k} className={`chip ${tab === k ? "active" : ""}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === "details" && <DetailsForm user={user} onSave={updateProfile} />}
      {tab === "password" && <ChangePasswordForm />}
      {tab === "sessions" && <SessionsList />}
    </div>
  );
}

function DetailsForm({ user, onSave }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const toast = useToast();

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ name, email });
      setSaved(true);
      toast("Details saved", "good");
      setTimeout(() => setSaved(false), 2000);
    } catch (err) { toast(err.message, "error"); }
    finally { setSaving(false); }
  };

  return (
    <form className="card" onSubmit={save} style={{ maxWidth: 520 }}>
      <div className="stack">
        <div className="field">
          <label>Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label>Email</label>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="row" style={{ marginTop: 8 }}>
          <button className="btn" type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
          {saved && <span className="ok"><I.check /> Saved</span>}
        </div>
      </div>
    </form>
  );
}

function ChangePasswordForm() {
  const toast = useToast();
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (newPw.length < 4) { setErr("New password must be at least 4 characters."); return; }
    if (newPw !== confirmPw) { setErr("Passwords do not match."); return; }
    setBusy(true);
    try {
      await changePasswordSvc({ old_password: oldPw, new_password: newPw });
      toast("Password updated", "good");
      setOldPw(""); setNewPw(""); setConfirmPw("");
    } catch (ex) { setErr(ex.message); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ maxWidth: 520 }}>
      <StubBanner person="Person 1" slice="Change Password" />
      <form className="card" onSubmit={submit}>
        <div className="stack">
          <div className="field">
            <label>Current password</label>
            <input type="password" className="input" value={oldPw} onChange={(e) => setOldPw(e.target.value)} required />
          </div>
          <div className="field">
            <label>New password</label>
            <input type="password" className="input" value={newPw} onChange={(e) => setNewPw(e.target.value)} required />
          </div>
          <div className="field">
            <label>Confirm new password</label>
            <input type="password" className="input" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required />
          </div>
          {err && <div className="err">{err}</div>}
          <div className="row" style={{ marginTop: 8 }}>
            <button className="btn" type="submit" disabled={busy}>{busy ? "Updating…" : "Update password"}</button>
          </div>
          <div className="muted" style={{ fontSize: 12 }}>
            Updating your password signs out every other device.
          </div>
        </div>
      </form>
    </div>
  );
}

function SessionsList() {
  const toast = useToast();
  const [sessions, setSessions] = useState(null);
  const [err, setErr] = useState("");
  const [revokingId, setRevokingId] = useState(null);

  const load = async () => {
    setErr("");
    try {
      const items = await listSessions();
      setSessions(items);
    } catch (ex) { setErr(ex.message); setSessions([]); }
  };

  useEffect(() => { load(); }, []);

  const onRevoke = async (id) => {
    setRevokingId(id);
    try {
      await revokeSessionSvc(id);
      toast("Session revoked", "good");
      // optimistic UI: drop locally even if backend is stubbed
      setSessions((prev) => (prev || []).filter((s) => s.id !== id));
    } catch (ex) { toast(ex.message, "error"); }
    finally { setRevokingId(null); }
  };

  return (
    <div>
      <StubBanner person="Person 1" slice="Revoke Session" />
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <div className="mono muted">ACTIVE DEVICES</div>
            <h3 style={{ marginTop: 4 }}>Where you're signed in</h3>
          </div>
          <button className="btn ghost sm" onClick={load}>Refresh</button>
        </div>

        {err && <div className="err">{err}</div>}
        {!sessions && !err && <div className="muted">Loading…</div>}
        {sessions && sessions.length === 0 && <div className="muted">No active sessions.</div>}

        {sessions && sessions.length > 0 && (
          <div className="stack" style={{ gap: 10 }}>
            {sessions.map((s) => (
              <div key={s.id} className="row" style={{
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 14px",
                border: "1px solid var(--line-2)",
                borderRadius: 12,
                background: s.is_current ? "var(--bone-2)" : "transparent",
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <strong style={{ fontSize: 14 }}>
                      {parseDeviceLabel(s.user_agent)}
                    </strong>
                    {s.is_current && <span className="chip active" style={{ fontSize: 11 }}>This device</span>}
                  </div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    Signed in {fmtDate(s.created_at)} · expires {fmtDate(s.expires_at)}
                  </div>
                </div>
                {!s.is_current && (
                  <button
                    className="btn ghost xs"
                    onClick={() => onRevoke(s.id)}
                    disabled={revokingId === s.id}
                  >
                    {revokingId === s.id ? "Revoking…" : "Revoke"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function parseDeviceLabel(ua) {
  if (!ua) return "Unknown device";
  const s = ua.toLowerCase();
  if (s.includes("iphone")) return "iPhone";
  if (s.includes("ipad")) return "iPad";
  if (s.includes("android")) return "Android";
  if (s.includes("mac os") || s.includes("macintosh")) return "Mac";
  if (s.includes("windows")) return "Windows";
  if (s.includes("linux")) return "Linux";
  return ua.split(" ")[0] || "Unknown device";
}
