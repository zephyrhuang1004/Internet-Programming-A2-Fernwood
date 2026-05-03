/**
 * Fetch wrapper:
 *  - injects Bearer access token
 *  - on 401, calls /api/auth/refresh once and retries
 *  - throws ApiError(message, status, isStub) on failure
 *  - includes credentials so refresh cookie travels with same-origin requests
 */

export class ApiError extends Error {
  constructor(message, status, isStub = false) {
    super(message);
    this.status = status;
    this.isStub = isStub;
  }
}

let _accessToken = null;
const _listeners = new Set();
export const setAccessToken = (t) => {
  _accessToken = t;
  _listeners.forEach((fn) => fn(t));
};
export const getAccessToken = () => _accessToken;
export const onAccessTokenChange = (fn) => {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
};

let _refreshPromise = null;
async function refreshAccess() {
  if (_refreshPromise) return _refreshPromise;
  _refreshPromise = (async () => {
    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) return null;
      const body = await res.json();
      if (!body.success) return null;
      setAccessToken(body.data.access_token);
      return body.data;
    } catch {
      return null;
    } finally {
      _refreshPromise = null;
    }
  })();
  return _refreshPromise;
}

async function request(method, path, body, { retried = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (_accessToken) headers.Authorization = `Bearer ${_accessToken}`;

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body == null ? undefined : JSON.stringify(body),
    credentials: "include",
  });

  if (res.status === 401 && !retried && path !== "/auth/refresh" && path !== "/auth/login" && path !== "/auth/register") {
    const refreshed = await refreshAccess();
    if (refreshed) return request(method, path, body, { retried: true });
  }

  let payload;
  try { payload = await res.json(); } catch { payload = null; }

  if (!res.ok) {
    const errMsg = payload?.error || res.statusText || "Request failed";
    throw new ApiError(errMsg, res.status, res.status === 501);
  }
  return payload?.data ?? payload;
}

export const apiGet    = (path)        => request("GET", path);
export const apiPost   = (path, body)  => request("POST", path, body);
export const apiPatch  = (path, body)  => request("PATCH", path, body);
export const apiDelete = (path, body)  => request("DELETE", path, body);
