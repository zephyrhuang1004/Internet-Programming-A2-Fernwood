/**
 * Person 3 (Cart) — backend stubs throw 501.
 * Frontend keeps a local-cart fallback in localStorage until backend lands.
 *
 * The shape returned here mirrors `MOCK_CART` in `mock/seed.js` — that file
 * is the authoritative contract. Backend response MUST match it.
 */
import { apiGet, apiPost, apiPatch, apiDelete, ApiError } from "./apiClient";

const LS_KEY = "fernwood::cart::v1";
const LOCAL_USER_ID = "u_demo_customer";

const loadLocal = () => {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}").items || []; }
  catch { return []; }
};
const saveLocal = (items) => {
  try { localStorage.setItem(LS_KEY, JSON.stringify({ items })); } catch {/* ignore */}
};
const cartOf = (items) => ({
  _id: LOCAL_USER_ID,
  items,
  updated_at: new Date().toISOString(),
});

async function tryRemote(fn, fallback) {
  try { return await fn(); }
  catch (e) { if (e instanceof ApiError && e.isStub) return fallback(); throw e; }
}

export async function getCart() {
  return tryRemote(
    () => apiGet("/cart"),
    () => cartOf(loadLocal()),
  );
}

export async function addItem(productId, qty = 1) {
  return tryRemote(
    () => apiPost("/cart/items", { product_id: productId, qty }),
    () => {
      const items = loadLocal();
      const line = items.find((i) => i.product_id === productId);
      if (line) line.qty += qty;
      else items.push({ product_id: productId, qty });
      saveLocal(items);
      return cartOf(items);
    },
  );
}

export async function updateQty(productId, qty) {
  return tryRemote(
    () => apiPatch(`/cart/items/${productId}`, { qty }),
    () => {
      let items = loadLocal();
      if (qty <= 0) items = items.filter((i) => i.product_id !== productId);
      else {
        const line = items.find((i) => i.product_id === productId);
        if (line) line.qty = qty;
      }
      saveLocal(items);
      return cartOf(items);
    },
  );
}

export async function removeItem(productId) {
  return tryRemote(
    () => apiDelete(`/cart/items/${productId}`),
    () => {
      const items = loadLocal().filter((i) => i.product_id !== productId);
      saveLocal(items);
      return cartOf(items);
    },
  );
}

export async function clearCart() {
  return tryRemote(
    () => apiDelete("/cart"),
    () => { saveLocal([]); return cartOf([]); },
  );
}
