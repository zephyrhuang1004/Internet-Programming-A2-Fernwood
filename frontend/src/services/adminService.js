/**
 * Person 5 (Admin) — backend stubs throw 501.
 * Each call falls back to mock fixtures from `mock/seed.js` so the admin
 * console is fully clickable before the controllers are implemented.
 */
import { apiGet, apiPatch, apiPost, apiDelete, ApiError } from "./apiClient";
import {
  MOCK_KPI,
  MOCK_ADMIN_USERS,
  MOCK_ADMIN_ORDERS,
  MOCK_ACTIVITY,
  MOCK_ANALYTICS,
  MOCK_PRODUCTS,
} from "../mock/seed";

const stub = (e) => e instanceof ApiError && e.isStub;

async function tryRemote(fn, fallback) {
  try { return await fn(); }
  catch (e) { if (stub(e)) return typeof fallback === "function" ? fallback() : fallback; throw e; }
}

// ----- Dashboard -----
export const dashboard = () => tryRemote(() => apiGet("/admin/dashboard"), MOCK_KPI);

// ----- Users -----
export const listUsers = (q) =>
  tryRemote(
    () => apiGet(`/admin/users${q ? `?q=${encodeURIComponent(q)}` : ""}`),
    () => {
      if (!q) return MOCK_ADMIN_USERS;
      const ql = q.toLowerCase();
      return MOCK_ADMIN_USERS.filter(
        (u) => u.name.toLowerCase().includes(ql) || u.email.toLowerCase().includes(ql),
      );
    },
  );

export const setUserRole = (id, role) =>
  tryRemote(
    () => apiPatch(`/admin/users/${id}/role`, { role }),
    () => {
      const u = MOCK_ADMIN_USERS.find((x) => x._id === id);
      return u ? { ...u, role } : null;
    },
  );

export const deleteUser = (id) =>
  tryRemote(
    () => apiDelete(`/admin/users/${id}`),
    () => {
      const u = MOCK_ADMIN_USERS.find((x) => x._id === id);
      if (u && u.role === "admin") {
        throw new ApiError("Cannot delete an admin user.", 403);
      }
      return { ok: true };
    },
  );

// ----- Products (admin CRUD) -----
export const createProduct = (p) =>
  tryRemote(
    () => apiPost("/admin/products", p),
    () => ({ _id: `p_mock_${Date.now()}`, version: 0, deleted_at: null, ...p }),
  );

export const updateProduct = (id, p) =>
  tryRemote(
    () => apiPatch(`/admin/products/${id}`, p),
    () => {
      const existing = MOCK_PRODUCTS.find((x) => x._id === id);
      return existing ? { ...existing, ...p, version: (existing.version ?? 0) + 1 } : null;
    },
  );

export const deleteProduct = (id) =>
  tryRemote(
    () => apiDelete(`/admin/products/${id}`),
    () => ({ ok: true, _id: id, deleted_at: new Date().toISOString() }),
  );

// ----- Orders -----
export const listOrders = (filt = {}) =>
  tryRemote(
    () => apiGet(`/admin/orders?${new URLSearchParams(filt).toString()}`),
    () => {
      let rows = MOCK_ADMIN_ORDERS;
      if (filt.status) rows = rows.filter((o) => o.status === filt.status);
      return rows;
    },
  );

export const updateOrderStatus = (id, status) =>
  tryRemote(
    () => apiPatch(`/admin/orders/${id}/status`, { status }),
    () => {
      const o = MOCK_ADMIN_ORDERS.find((x) => x._id === id);
      return o ? { ...o, status } : null;
    },
  );

// ----- Activity log -----
export const listActivity = (filt = {}) =>
  tryRemote(
    () => apiGet(`/admin/activity?${new URLSearchParams(filt).toString()}`),
    () => (filt.action ? MOCK_ACTIVITY.filter((a) => a.action === filt.action) : MOCK_ACTIVITY),
  );

// ----- Analytics -----
export const analytics = () => tryRemote(() => apiGet("/admin/analytics"), MOCK_ANALYTICS);
