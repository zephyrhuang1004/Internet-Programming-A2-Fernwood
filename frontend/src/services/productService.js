/**
 * Person 2 (Catalogue) — backend stubs throw 501.
 * Until backend lands, fall back to MOCK_PRODUCTS so the storefront stays browseable.
 */
import { apiGet, ApiError } from "./apiClient";
import { MOCK_PRODUCTS } from "../mock/seed";

export async function listProducts({ q, category } = {}) {
  try {
    return await apiGet(
      `/products?${new URLSearchParams({
        ...(q ? { q } : {}),
        ...(category && category !== "All" ? { category } : {}),
      }).toString()}`
    );
  } catch (e) {
    if (e instanceof ApiError && e.isStub) {
      // mock fallback
      return MOCK_PRODUCTS.filter((p) => {
        if (category && category !== "All" && p.category !== category) return false;
        if (q) {
          const ql = q.toLowerCase();
          return [p.name, p.category, p.material, p.tagline].some((s) => s.toLowerCase().includes(ql));
        }
        return true;
      });
    }
    throw e;
  }
}

export async function getProduct(id) {
  try {
    return await apiGet(`/products/${id}`);
  } catch (e) {
    if (e instanceof ApiError && e.isStub) {
      return MOCK_PRODUCTS.find((p) => p._id === id) || null;
    }
    throw e;
  }
}

/** True if the backend stub is currently active (so the page can show a banner). */
export async function isBackendStubbed() {
  try {
    await apiGet("/products?limit=1");
    return false;
  } catch (e) {
    return e instanceof ApiError && e.isStub;
  }
}
