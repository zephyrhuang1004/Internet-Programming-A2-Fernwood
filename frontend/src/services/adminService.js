import { apiGet, apiPatch, apiPost, apiDelete } from "./apiClient";

export const dashboard = ()           => apiGet("/admin/dashboard");
export const listUsers = (q)          => apiGet(`/admin/users${q ? `?q=${encodeURIComponent(q)}` : ""}`);
export const setUserRole = (id, role) => apiPatch(`/admin/users/${id}/role`, { role });
export const deleteUser = (id)        => apiDelete(`/admin/users/${id}`);
export const createProduct = (p)      => apiPost("/admin/products", p);
export const updateProduct = (id, p)  => apiPatch(`/admin/products/${id}`, p);
export const deleteProduct = (id)     => apiDelete(`/admin/products/${id}`);
export const listOrders = (filt = {}) => apiGet(`/admin/orders?${new URLSearchParams(filt).toString()}`);
export const updateOrderStatus = (id, status) => apiPatch(`/admin/orders/${id}/status`, { status });
export const listActivity = (filt = {}) => apiGet(`/admin/activity?${new URLSearchParams(filt).toString()}`);
export const analytics = ()           => apiGet("/admin/analytics");
