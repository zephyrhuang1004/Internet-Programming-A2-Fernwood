# Fernwood — IP A2 (v2)

> UTS 32516 Internet Programming · Assignment 2 · E-commerce SPA

A warm-organic furniture e-commerce built as a **Vite + React** SPA with a **FastAPI + MongoDB (Beanie)** backend.

## Stack

| Layer    | Tech |
|----------|------|
| Frontend | Vite 5, React 18, React Router 6 (SPA, BrowserRouter), pure CSS (oklch tokens) |
| Backend  | FastAPI, Motor, Beanie ODM, Argon2id, JWT (access + refresh rotation) |
| Database | MongoDB Atlas |
| Fonts    | Instrument Serif (display), Geist (body), JetBrains Mono (data) |

## Local Development

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Health check: <http://localhost:8000/api/health>

### Frontend

```bash
cd frontend
npm install
npm run dev     # http://localhost:5173
```

Vite proxies `/api` → `http://localhost:8000` so the SPA can call the backend with same-origin cookies.

## Demo Credentials

The Atlas database is already seeded.

- **Admin** — `admin@fernwood.co` / `admin123`
- **Customer** — `ivy@example.com` / `password`

## Hand-off Map (Group of 5)

This scaffold ships **Auth fully wired** (Person 1). The other four vertical slices have full UI but their backend endpoints throw `NotImplementedError` (returns HTTP 501 via `error_handler.py`). The frontend services catch 501 and fall back to inline mock data so the UI is browseable end-to-end before a teammate plugs in real data.

| Person | Slice                          | Frontend files                                               | Backend files                                                  |
|--------|--------------------------------|--------------------------------------------------------------|----------------------------------------------------------------|
| 1      | Account Recovery & Sessions    | `pages/{ForgotPassword,ResetPassword,Account}Page.jsx`, `services/authService.js` | `routes/auth.py`, `controllers/auth_controller.py` (4 stubs at the bottom) |
| 2      | Catalogue                      | `pages/{Products,ProductDetail,Home}Page.jsx`, `services/productService.js` | `routes/products.py`, `controllers/product_controller.py`, `models/product.py` |
| 3      | Cart                           | `pages/CartPage.jsx`, `components/CartDrawer.jsx`, `context/CartContext.jsx`, `services/cartService.js` | `routes/cart.py`, `controllers/cart_controller.py`, `models/cart.py` |
| 4      | Checkout & Orders              | `pages/{Checkout,Orders,OrderDetail}Page.jsx`, `services/orderService.js` | `routes/orders.py`, `controllers/order_controller.py`, `models/order.py` |
| 5      | Admin                          | `pages/AdminDashboard.jsx`                                   | `routes/admin.py`, `controllers/admin_controller.py`, `models/activity_log.py` |

> **Auth foundation (login / register / logout / refresh / me / update profile / list sessions) is already wired** so every other slice can develop end-to-end without waiting on Person 1. Person 1's task is the four account-recovery features bolted on top.

### Person 1 — work to do

| Endpoint | Controller stub | Frontend page / UI |
|----------|-----------------|---------------------|
| `POST /api/auth/forgot-password`           | `request_password_reset(email)`            | `ForgotPasswordPage.jsx`              |
| `POST /api/auth/reset-password`            | `reset_password(token, new_password)`      | `ResetPasswordPage.jsx`               |
| `POST /api/auth/change-password`           | `change_password(user, old_pw, new_pw)`    | `AccountPage` → Password tab          |
| `DELETE /api/auth/sessions/{session_id}`   | `revoke_session(user, session_id)`         | `AccountPage` → Sessions tab (revoke) |

Suggested model additions on `User`: `reset_token_hash: str | None`, `reset_token_expires_at: datetime | None`. See docstrings in `auth_controller.py` for hints.

### How to Implement Your Slice

1. Find your `controllers/<slice>_controller.py` — replace each `raise NotImplementedError(...)` with real Beanie queries
2. The Pydantic schema/route layer is already wired; you only touch the controller body
3. Run `uvicorn main:app --reload`, hit your endpoint with `curl` or via the running frontend
4. Once the backend returns real data, the frontend service auto-stops using mock data — no frontend changes needed

## Notes

- **Auth model:** Argon2id with per-user random salt. Access JWT (30 min, in-memory in React Context). Refresh JWT (30 days, httpOnly Secure SameSite=Strict cookie). Auto-rotation on every refresh.
- **Stub mechanism:** `middleware/error_handler.py` catches `NotImplementedError` and returns HTTP 501 with `{success:false, error:"NotImplementedError: ..."}`
- **TLS on macOS:** `database.py` passes `tlsCAFile=certifi.where()` to Motor so Atlas TLS verification works without `Install Certificates.command`
- **No TypeScript** — assignment uses JSX only
