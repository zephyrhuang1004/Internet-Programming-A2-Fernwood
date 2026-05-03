/**
 * Mock fallback data — used by services when a backend stub returns 501.
 *
 * IMPORTANT: this file is the API CONTRACT for every slice that does not
 * have a Pydantic schema yet. Each MOCK_* export below documents the exact
 * shape (field names, types, nesting) that the corresponding backend
 * endpoint MUST return. If your backend response diverges from the shape
 * here, the UI breaks — match the shape, then code.
 *
 * Conventions
 *  - `_id` is always a string (UUID for products/orders/users, user_id for cart)
 *  - timestamps are ISO 8601 strings in UTC (e.g. "2026-04-20T10:00:00Z")
 *  - prices / totals / fees are integers in dollars (no cents)
 *  - status enums are PascalCase ("Processing" | "Shipped" | "Delivered")
 */

// ============================================================
// PRODUCTS — Person 2
// GET /api/products             → MOCK_PRODUCTS
// GET /api/products/{id}        → one item from MOCK_PRODUCTS
// ============================================================

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

// ============================================================
// CART — Person 3
// GET    /api/cart                       → MOCK_CART  (auto-create if missing — never 404)
// POST   /api/cart/items                 → updated MOCK_CART (merge qty if line exists)
// PATCH  /api/cart/items/{product_id}    → updated MOCK_CART (qty<=0 removes line)
// DELETE /api/cart/items/{product_id}    → updated MOCK_CART (line removed)
// DELETE /api/cart                       → MOCK_CART with items: []
// ------------------------------------------------------------
// Cart._id IS the user's id — one cart per user.
// items[].unit_price is the snapshot at add-time (do NOT recompute on read).
// ============================================================

export const MOCK_CART = {
  _id: "u_demo_customer",                        // == user_id
  items: [
    { product_id: "p01", qty: 1, unit_price: 1280 },
    { product_id: "p17", qty: 2, unit_price: 540 },
  ],
  updated_at: "2026-05-01T10:00:00Z",
};

// ============================================================
// ORDERS — Person 4
// GET  /api/orders               → MOCK_ORDERS
// GET  /api/orders/{id}          → one item from MOCK_ORDERS
// POST /api/orders               → newly created order (same shape as below)
// ============================================================

export const MOCK_ORDERS = [
  {
    _id: "o-mock-1",
    user_id: "u_demo_customer",
    items: [
      { product_id: "p02", qty: 1, unit_price: 3450 },
      { product_id: "p17", qty: 2, unit_price: 540 },
    ],
    subtotal: 4530,
    shipping_fee: 0,
    tax: 362,
    total: 4892,
    status: "Shipped",                           // "Processing" | "Shipped" | "Delivered"
    placed_at: "2026-04-20T10:00:00Z",
    shipping: {
      name: "Demo User",
      address: "14 Grove Lane",
      city: "Melbourne",
      postal: "3000",
      country: "Australia",
      country_code: "AU",                        // ISO-3166-1 alpha-2 (optional)
    },
    payment: {
      brand: "Visa",                             // "Visa" | "Mastercard" | "Amex"
      last4: "4242",
      masked: "•••• •••• •••• 4242",
    },
  },
  {
    _id: "o-mock-2",
    user_id: "u_demo_customer",
    items: [{ product_id: "p07", qty: 1, unit_price: 2190 }],
    subtotal: 2190,
    shipping_fee: 0,
    tax: 175,
    total: 2365,
    status: "Delivered",
    placed_at: "2026-03-12T10:00:00Z",
    shipping: {
      name: "Demo User",
      address: "14 Grove Lane",
      city: "Melbourne",
      postal: "3000",
      country: "Australia",
      country_code: "AU",
    },
    payment: { brand: "Mastercard", last4: "8891", masked: "•••• •••• •••• 8891" },
  },
];

// ============================================================
// ADMIN — Person 5
// All endpoints below require an authenticated admin (handled by middleware).
// ============================================================

// ----- GET /api/admin/dashboard -----
export const MOCK_KPI = {
  today_orders: 12,
  week_revenue: 18430,                           // dollars
  low_stock_count: 3,                            // products where stock < 5
  active_users_30d: 87,                          // users with at least one order in 30 days
};

// ----- GET /api/admin/users?q= -----
export const MOCK_ADMIN_USERS = [
  { _id: "u01", name: "Admin",      email: "admin@fernwood.co", role: "admin",    joined_at: "2026-01-10T00:00:00Z", deleted_at: null },
  { _id: "u02", name: "Ivy Chen",   email: "ivy@example.com",   role: "customer", joined_at: "2026-01-15T00:00:00Z", deleted_at: null },
  { _id: "u03", name: "Noah Park",  email: "noah@example.com",  role: "customer", joined_at: "2026-02-02T00:00:00Z", deleted_at: null },
  { _id: "u04", name: "Maya Singh", email: "maya@example.com",  role: "customer", joined_at: "2026-02-20T00:00:00Z", deleted_at: null },
  { _id: "u05", name: "Leo Hart",   email: "leo@example.com",   role: "customer", joined_at: "2026-03-04T00:00:00Z", deleted_at: null },
];

// ----- PATCH /api/admin/users/{id}/role  → updated user (same shape as MOCK_ADMIN_USERS row)
// ----- DELETE /api/admin/users/{id}      → { ok: true }   (soft-delete sets deleted_at)

// ----- GET /api/admin/orders?status=&date_from=&date_to= -----
// Same shape as MOCK_ORDERS, but admins can see every user's orders.
export const MOCK_ADMIN_ORDERS = MOCK_ORDERS;

// ----- PATCH /api/admin/orders/{id}/status  → updated order (state machine: Processing → Shipped → Delivered)

// ----- GET /api/admin/activity?action= -----
export const MOCK_ACTIVITY = [
  { _id: "a01", at: "2026-05-02T09:14:00Z", user_id: "u02", action: "order.placed",     detail: "Order o-mock-2 totalling $2365" },
  { _id: "a02", at: "2026-05-01T18:22:00Z", user_id: "u01", action: "product.updated",  detail: "Updated stock for Aster Dining Table" },
  { _id: "a03", at: "2026-05-01T08:50:00Z", user_id: "u03", action: "auth.login",       detail: "Login from Chrome / Mac" },
  { _id: "a04", at: "2026-04-30T15:05:00Z", user_id: "u04", action: "user.role_changed",detail: "Role changed customer → customer (no-op)" },
  { _id: "a05", at: "2026-04-29T12:00:00Z", user_id: "u05", action: "order.placed",     detail: "Order o-mock-3 totalling $1180" },
];

// ----- GET /api/admin/analytics -----
export const MOCK_ANALYTICS = {
  // last 30 days, oldest first; date is YYYY-MM-DD; revenue in dollars
  revenue_by_day: [
    { date: "2026-04-04", revenue: 0 },     { date: "2026-04-05", revenue: 410 },
    { date: "2026-04-06", revenue: 1280 },  { date: "2026-04-07", revenue: 0 },
    { date: "2026-04-08", revenue: 2190 },  { date: "2026-04-09", revenue: 540 },
    { date: "2026-04-10", revenue: 890 },   { date: "2026-04-11", revenue: 0 },
    { date: "2026-04-12", revenue: 3450 },  { date: "2026-04-13", revenue: 720 },
    { date: "2026-04-14", revenue: 180 },   { date: "2026-04-15", revenue: 1180 },
    { date: "2026-04-16", revenue: 820 },   { date: "2026-04-17", revenue: 0 },
    { date: "2026-04-18", revenue: 2480 },  { date: "2026-04-19", revenue: 410 },
    { date: "2026-04-20", revenue: 4892 },  { date: "2026-04-21", revenue: 0 },
    { date: "2026-04-22", revenue: 320 },   { date: "2026-04-23", revenue: 1450 },
    { date: "2026-04-24", revenue: 540 },   { date: "2026-04-25", revenue: 2240 },
    { date: "2026-04-26", revenue: 890 },   { date: "2026-04-27", revenue: 0 },
    { date: "2026-04-28", revenue: 410 },   { date: "2026-04-29", revenue: 1180 },
    { date: "2026-04-30", revenue: 720 },   { date: "2026-05-01", revenue: 1280 },
    { date: "2026-05-02", revenue: 2365 },  { date: "2026-05-03", revenue: 0 },
  ],
  by_status: [
    { status: "Processing", count: 4, revenue: 5210 },
    { status: "Shipped",    count: 6, revenue: 9874 },
    { status: "Delivered",  count: 18, revenue: 22310 },
  ],
  by_category: [
    { category: "Seating",          count: 14, revenue: 12340 },
    { category: "Tables",           count:  6, revenue:  8210 },
    { category: "Storage",          count:  3, revenue:  3420 },
    { category: "Lighting",         count:  5, revenue:  3100 },
    { category: "Bedroom",          count:  2, revenue:  4960 },
    { category: "Rugs & Textiles",  count:  4, revenue:  2810 },
  ],
  by_country: [
    { country: "Australia", country_code: "AU", count: 22, revenue: 26840 },
    { country: "New Zealand", country_code: "NZ", count: 4, revenue: 5320 },
    { country: "Singapore", country_code: "SG", count: 2, revenue: 3150 },
  ],
};
