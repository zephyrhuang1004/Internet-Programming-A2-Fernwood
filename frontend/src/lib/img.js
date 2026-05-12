/**
 * Resolve a product's `img` field into a renderable URL.
 *
 * Three legal sources:
 *   1. Full HTTP(S) URL — return as-is.
 *   2. Backend-served path starting with /api/ — return as-is
 *      (admin-uploaded images, served via FastAPI's FileResponse).
 *   3. Bare Unsplash photo ID — compose the Unsplash CDN URL with the
 *      requested width.
 *
 * Empty / nullish input returns "" so callers can short-circuit with a
 * placeholder block.
 */
export function imgUrl(id, size = 240) {
  if (!id) return "";
  if (id.startsWith("http://") || id.startsWith("https://")) return id;
  if (id.startsWith("/api/") || id.startsWith("/uploads/")) return id;
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${size}&q=70`;
}
