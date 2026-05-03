/**
 * Person 4 (Checkout & Orders) — backend stubs throw 501.
 * Mock fallback shows the order list / detail UI with sample data.
 */
import { apiGet, apiPost, ApiError } from "./apiClient";
import { MOCK_ORDERS } from "../mock/seed";

export async function listMyOrders() {
  try { return await apiGet("/orders"); }
  catch (e) { if (e instanceof ApiError && e.isStub) return MOCK_ORDERS; throw e; }
}

export async function getOrder(id) {
  try { return await apiGet(`/orders/${id}`); }
  catch (e) {
    if (e instanceof ApiError && e.isStub) return MOCK_ORDERS.find((o) => o._id === id) || null;
    throw e;
  }
}

export async function placeOrder({ shipping, card }) {
  return apiPost("/orders", { shipping, card });
}
