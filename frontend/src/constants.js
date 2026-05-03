export const CATEGORIES = ["Seating", "Tables", "Storage", "Lighting", "Bedroom", "Rugs & Textiles"];
export const MATERIALS = [
  "Solid oak", "Walnut", "Ash", "Linen", "Bouclé",
  "Travertine", "Cane", "Brass", "Wool", "Leather",
];
export const TAX_RATE = 0.08;
export const FREE_SHIP_AT = 2000;
export const FLAT_SHIP = 80;

export const IMG = (id, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;
export const IMG_FALLBACK =
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=70";
