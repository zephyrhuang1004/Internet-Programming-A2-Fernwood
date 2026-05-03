import { apiPost, apiGet, apiPatch, apiDelete, setAccessToken, ApiError } from "./apiClient";

export async function register({ name, email, password }) {
  const data = await apiPost("/auth/register", { name, email, password });
  setAccessToken(data.access_token);
  return data.user;
}

export async function login({ email, password }) {
  const data = await apiPost("/auth/login", { email, password });
  setAccessToken(data.access_token);
  return data.user;
}

export async function logout() {
  try { await apiPost("/auth/logout"); } catch {/* ignore */}
  setAccessToken(null);
}

export async function fetchMe() {
  return apiGet("/auth/me");
}

export async function updateMe(patch) {
  return apiPatch("/auth/me", patch);
}

export async function listSessions() {
  return apiGet("/auth/sessions");
}

// ---------------------------------------------------------------
// Person 1 endpoints — backend stubs throw 501.
// Until Person 1 lands real logic, fall back to mock responses so
// the UI is fully clickable end-to-end.
// ---------------------------------------------------------------

const MOCK_RESET_TOKEN = "mock-reset-token-replace-me";

export async function forgotPassword({ email }) {
  try {
    return await apiPost("/auth/forgot-password", { email });
  } catch (e) {
    if (e instanceof ApiError && e.isStub) {
      return { reset_token: MOCK_RESET_TOKEN, mock: true, email };
    }
    throw e;
  }
}

export async function resetPassword({ token, new_password }) {
  try {
    return await apiPost("/auth/reset-password", { token, new_password });
  } catch (e) {
    if (e instanceof ApiError && e.isStub) {
      if (token !== MOCK_RESET_TOKEN) {
        throw new ApiError("Invalid or expired reset token (mock).", 400);
      }
      return { mock: true };
    }
    throw e;
  }
}

export async function changePassword({ old_password, new_password }) {
  try {
    return await apiPost("/auth/change-password", { old_password, new_password });
  } catch (e) {
    if (e instanceof ApiError && e.isStub) {
      // mock: accept anything, just simulate latency
      await new Promise((r) => setTimeout(r, 300));
      return { ok: true, mock: true };
    }
    throw e;
  }
}

export async function revokeSession(sessionId) {
  try {
    return await apiDelete(`/auth/sessions/${sessionId}`);
  } catch (e) {
    if (e instanceof ApiError && e.isStub) {
      return { ok: true, mock: true };
    }
    throw e;
  }
}

/** Try to silently restore a session via the refresh cookie. Returns user or null. */
export async function tryRestoreSession() {
  try {
    const res = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
    if (!res.ok) return null;
    const body = await res.json();
    if (!body.success) return null;
    setAccessToken(body.data.access_token);
    return body.data.user;
  } catch {
    return null;
  }
}
