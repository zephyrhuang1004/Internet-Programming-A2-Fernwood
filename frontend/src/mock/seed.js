/**
 * Mock fallback data — used by services when backend stub returns 501.
 * Once the backend slice is implemented, the service will return real data
 * and this fallback is silently skipped.
 *
 * Mirrors the schema returned by the FastAPI backend (snake_case fields,
 * UUID string IDs).
 */

export const MOCK_PRODUCTS = [
  { _id: "p01", name: "Hollis Lounge Chair",      category: "Seating", price: 1280, stock: 8,  material: "Bouclé",       img: "1555041469-a586c61ea9bc", tagline: "Cloud-soft bouclé, low and wide.",         palette: "Oat" },
  { _id: "p02", name: "Marlow Sofa 3-Seat",       category: "Seating", price: 3450, stock: 3,  material: "Linen",        img: "1567016432779-094069958ea5", tagline: "Deep seat, loose cushions, weekday naps.", palette: "Clay" },
  { _id: "p03", name: "Juno Armchair",            category: "Seating", price: 890,  stock: 14, material: "Wool",         img: "1506439773649-6e0eb8cfb237", tagline: "A reading chair that leans back with you.", palette: "Moss" },
  { _id: "p04", name: "Pebble Ottoman",           category: "Seating", price: 320,  stock: 22, material: "Bouclé",       img: "1540574163026-643ea20ade25", tagline: "Round, small, useful everywhere.",         palette: "Oat" },
  { _id: "p05", name: "Finn Dining Chair",        category: "Seating", price: 410,  stock: 40, material: "Solid oak",    img: "1503602642458-232111445657", tagline: "Woven cane back, oiled oak frame.",        palette: "Honey" },
  { _id: "p07", name: "Aster Dining Table",       category: "Tables",  price: 2190, stock: 5,  material: "Solid oak",    img: "1615529182904-14819c35db37", tagline: "Seats six. Has one perfect dent already.", palette: "Honey" },
  { _id: "p10", name: "Harbor Writing Desk",      category: "Tables",  price: 1450, stock: 6,  material: "Walnut",       img: "1518455027359-f3f8164ba6bd", tagline: "One drawer. No distractions.",             palette: "Clay" },
  { _id: "p12", name: "Alder Bookshelf",          category: "Storage", price: 1180, stock: 7,  material: "Solid oak",    img: "1594620302200-9a762244a156", tagline: "Five shelves. Adjustable. Infinite books.", palette: "Honey" },
  { _id: "p13", name: "Fen Sideboard",            category: "Storage", price: 2240, stock: 4,  material: "Walnut",       img: "1615873968403-89e068629265", tagline: "Cane doors, soft-close, brass pulls.",      palette: "Clay" },
  { _id: "p17", name: "Poppy Pendant",            category: "Lighting",price: 540,  stock: 12, material: "Brass",        img: "1513506003901-1e6a229e2d15", tagline: "A warm circle over the table.",            palette: "Brass" },
  { _id: "p18", name: "Dune Floor Lamp",          category: "Lighting",price: 720,  stock: 9,  material: "Linen",        img: "1507473885765-e6ed057f782c", tagline: "Linen shade, soft glow, 160cm.",           palette: "Bone" },
  { _id: "p22", name: "Linden Bed Frame Queen",   category: "Bedroom", price: 2480, stock: 4,  material: "Solid oak",    img: "1505693416388-ac5ce068fe85", tagline: "Low platform, rounded corners.",           palette: "Honey" },
  { _id: "p26", name: "Oat Wool Rug 200×300",     category: "Rugs & Textiles", price: 820, stock: 11, material: "Wool", img: "1600607687939-ce8a6c25118c", tagline: "Hand-loomed, barefoot-ready.",         palette: "Oat" },
  { _id: "p28", name: "Field Throw",              category: "Rugs & Textiles", price: 180, stock: 32, material: "Wool", img: "1586023492125-27b2c045efd7", tagline: "Heavy, fringed, perfect on couches.",   palette: "Moss" },
];

export const MOCK_ORDERS = [
  {
    _id: "o-mock-1",
    user_id: "current",
    items: [{ product_id: "p02", qty: 1, unit_price: 3450 }, { product_id: "p17", qty: 2, unit_price: 540 }],
    subtotal: 4530, shipping_fee: 0, tax: 362, total: 4892,
    status: "Shipped",
    placed_at: "2026-04-20T10:00:00Z",
    shipping: { name: "Demo User", address: "14 Grove Lane", city: "Melbourne", postal: "3000", country: "Australia" },
    payment: { brand: "Visa", last4: "4242", masked: "•••• •••• •••• 4242" },
  },
  {
    _id: "o-mock-2",
    user_id: "current",
    items: [{ product_id: "p07", qty: 1, unit_price: 2190 }],
    subtotal: 2190, shipping_fee: 0, tax: 175, total: 2365,
    status: "Delivered",
    placed_at: "2026-03-12T10:00:00Z",
    shipping: { name: "Demo User", address: "14 Grove Lane", city: "Melbourne", postal: "3000", country: "Australia" },
    payment: { brand: "Mastercard", last4: "8891", masked: "•••• •••• •••• 8891" },
  },
];
