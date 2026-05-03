# Fernwood — IP A2 (v2)

> UTS 32516 Internet Programming · Assignment 2 · E-commerce SPA

A warm-organic furniture e-commerce built as a **Vite + React** SPA with a **FastAPI + MongoDB (Beanie)** backend.

## Stack


| Layer    | Tech                                                                           |
| -------- | ------------------------------------------------------------------------------ |
| Frontend | Vite 5, React 18, React Router 6 (SPA, BrowserRouter), pure CSS (oklch tokens) |
| Backend  | FastAPI, Motor, Beanie ODM, Argon2id, JWT (access + refresh rotation)          |
| Database | MongoDB Atlas                                                                  |
| Fonts    | Instrument Serif (display), Geist (body), JetBrains Mono (data)                |


## Onboarding for Team Members

The Atlas cluster (`ip-a2-e-commerce`) is **already provisioned and seeded** by the project owner — you do **not** need to create your own MongoDB account or run the seed script. You only need three things to start coding.

### Step 0 — Get your personal database credentials

The project owner has created a dedicated Atlas database user for each teammate (so your access can be revoked individually if a laptop is lost). The owner will DM you privately with:

- a **username** (e.g. `person3`)
- a **password**

Paste these into the URI template below to get your personal `MONGODB_URI`:

```
mongodb+srv://<username>:<password>@ip-a2-e-commerce.xw9dcew.mongodb.net/?appName=ip-a2-e-commerce
```

> URL-encode any special characters in the password (`@` → `%40`, `#` → `%23`, `:` → `%3A`, `/` → `%2F`).

The cluster's IP whitelist is open to `0.0.0.0/0`, so you can connect from anywhere — no firewall setup needed.

**Never** paste your URI into a public channel, GitHub issue, or commit.

### Step 1 — Clone & configure env

```bash
git clone https://github.com/zephyrhuang1004/Internet-Programming-A2-Fernwood.git
cd Internet-Programming-A2-Fernwood
cp .env.example backend/.env
```

Open `backend/.env` and fill in **two** values — leave everything else alone:

```bash
# 1. Paste your personal URI (built in Step 0 with your own username/password)
MONGODB_URI=mongodb+srv://<your_username>:<your_password>@ip-a2-e-commerce.xw9dcew.mongodb.net/?appName=ip-a2-e-commerce

# 2. Generate a personal JWT secret:  openssl rand -hex 32
JWT_SECRET=<paste-the-64-hex-string>
```

> Tip: each developer should generate their own `JWT_SECRET`. It only needs to be consistent within your local environment.

### Step 2 — Run the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate           # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

- Health check: [http://localhost:8000/api/health](http://localhost:8000/api/health)
- Swagger UI (try every endpoint live): [http://localhost:8000/docs](http://localhost:8000/docs)
- **Do not run `python seed.py`** — the database is already populated. Running it again is idempotent (safe), but unnecessary.

### Step 3 — Run the frontend (new terminal)

```bash
cd frontend
npm install
npm run dev     # http://localhost:5173
```

Vite proxies `/api` → `http://localhost:8000` so the SPA can call the backend with same-origin cookies.

Open [http://localhost:5173](http://localhost:5173) and sign in with the demo credentials below to confirm everything works.

### Step 4 — Start your slice

1. Create a feature branch:
  ```bash
   git checkout -b slice/<your-slice>     # e.g. slice/cart, slice/admin
  ```
2. Find your `controllers/<slice>_controller.py` — replace each `raise NotImplementedError(...)` with real Beanie queries. Docstrings inside each stub explain the expected behaviour.
3. Save → uvicorn auto-reloads → test via Swagger or the running frontend.
4. While your backend is incomplete, the frontend automatically falls back to mock data (HTTP 501 → mock). You will not block your teammates.
5. When your acceptance criteria pass, push and open a Pull Request:
  ```bash
   git push -u origin slice/<your-slice>
   gh pr create --base main
  ```

---

## Environment Variables

All backend env vars live in `backend/.env` (gitignored). Copy from `.env.example` at the project root.


| Variable           | Required | Default                 | What it does                                                                                                                                                                                    |
| ------------------ | -------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MONGODB_URI`      | ✅ yes    | —                       | MongoDB Atlas connection string. Build from the URI template using the personal username/password the project owner DMs you (see Step 0). URL-encode any special characters in the password (`@` → `%40`, etc). |
| `DB_NAME`          | no       | `fernwood`              | Database name inside the Atlas cluster. The cluster hostname is `ip-a2-e-commerce.xw9dcew.mongodb.net`, but the seeded data lives in the `fernwood` database — don't confuse the two. Beanie creates all collections under this DB.                                              |
| `JWT_SECRET`       | ✅ yes    | —                       | HMAC secret used to sign access tokens. **Treat as a password — leak = full account takeover.** Generate with `openssl rand -hex 32`. Use a different value per environment (dev / production). |
| `JWT_ALG`          | no       | `HS256`                 | JWT signing algorithm. Don't change unless you know what you're doing.                                                                                                                          |
| `ACCESS_TTL_MIN`   | no       | `30`                    | Access token lifetime in minutes. Frontend auto-refreshes via the refresh cookie when it expires. 30 min is a sensible default.                                                                 |
| `REFRESH_TTL_DAYS` | no       | `30`                    | Refresh token (httpOnly cookie) lifetime in days. After this, the user has to re-enter their credentials.                                                                                       |
| `ENV`              | no       | `dev`                   | Environment marker. When `dev`, the refresh cookie is sent without `Secure` so it works on `http://localhost`. Set to `production` when deploying behind HTTPS.                                 |
| `CORS_ORIGINS`     | no       | `http://localhost:5173` | Comma-separated whitelist of front-end origins allowed to call the API. Add your deployment URL here when shipping.                                                                             |


## Demo Credentials

The Atlas database is already seeded.

- **Admin** — `admin@fernwood.co` / `admin123`
- **Customer** — `ivy@example.com` / `password`

## API Contract — `frontend/src/mock/seed.js`

**Read this before you write a single line of backend code.**

`frontend/src/mock/seed.js` documents the exact response shape every backend endpoint must return — field names, types, nesting, enum values, everything. Auth uses Pydantic schemas (`backend/schemas/auth.py`) for the same purpose. **If your backend response diverges from these shapes, the UI breaks.**

| Slice    | Contract source                                        | What to read                                                |
| -------- | ------------------------------------------------------ | ----------------------------------------------------------- |
| Auth     | `backend/schemas/auth.py`                              | Pydantic models (input/output)                              |
| Products | `frontend/src/mock/seed.js` → `MOCK_PRODUCTS`          | One product object's fields                                 |
| Cart     | `frontend/src/mock/seed.js` → `MOCK_CART`              | Cart envelope (`_id`, `items[]`, `updated_at`)              |
| Orders   | `frontend/src/mock/seed.js` → `MOCK_ORDERS`            | Order with `items[]`, totals, `shipping`, `payment`         |
| Admin    | `frontend/src/mock/seed.js` → `MOCK_KPI`, `MOCK_ADMIN_USERS`, `MOCK_ADMIN_ORDERS`, `MOCK_ACTIVITY`, `MOCK_ANALYTICS` | One mock per endpoint; the file header explains conventions |

Workflow: open the contract → look at the shape → write your Beanie query that returns the same shape. Done.

---

## Hand-off Map (Group of 5)

The scaffold ships with **Auth foundation fully wired**, every page UI built, and every frontend service set up with a mock fallback (HTTP 501 → mock from `seed.js`). All five slices can be developed in parallel — nobody is blocked.


| Person | Slice                       | Frontend files                                                                                          | Backend files                                                                  |
| ------ | --------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 1      | Account Recovery & Sessions | `pages/{ForgotPassword,ResetPassword,Account}Page.jsx`, `services/authService.js`                       | `routes/auth.py`, `controllers/auth_controller.py` (4 stubs at the bottom)     |
| 2      | Catalogue                   | `pages/{Products,ProductDetail,Home}Page.jsx`, `services/productService.js`                             | `routes/products.py`, `controllers/product_controller.py`, `models/product.py` |
| 3      | Cart                        | `pages/CartPage.jsx`, `components/CartDrawer.jsx`, `context/CartContext.jsx`, `services/cartService.js` | `routes/cart.py`, `controllers/cart_controller.py`, `models/cart.py`           |
| 4      | Checkout & Orders           | `pages/{Checkout,Orders,OrderDetail}Page.jsx`, `services/orderService.js`                               | `routes/orders.py`, `controllers/order_controller.py`, `models/order.py`       |
| 5      | Admin                       | `pages/AdminDashboard.jsx`                                                                              | `routes/admin.py`, `controllers/admin_controller.py`, `models/activity_log.py` |


> **Auth foundation (login / register / logout / refresh / me / update profile / list sessions) is already wired** so every other slice can develop end-to-end without waiting on Person 1. Person 1's task is the four account-recovery features bolted on top.

### Person 1 — Account Recovery & Sessions


| Endpoint                                 | Controller stub                         | Frontend page / UI                    |
| ---------------------------------------- | --------------------------------------- | ------------------------------------- |
| `POST /api/auth/forgot-password`         | `request_password_reset(email)`         | `ForgotPasswordPage.jsx`              |
| `POST /api/auth/reset-password`          | `reset_password(token, new_password)`   | `ResetPasswordPage.jsx`               |
| `POST /api/auth/change-password`         | `change_password(user, old_pw, new_pw)` | `AccountPage` → Password tab          |
| `DELETE /api/auth/sessions/{session_id}` | `revoke_session(user, session_id)`      | `AccountPage` → Sessions tab (revoke) |


Suggested model additions on `User`: `reset_token_hash: str | None`, `reset_token_expires_at: datetime | None`. See docstrings in `auth_controller.py` for hints.

**Acceptance criteria**
- Forgot-password issues a token, reset-password consumes it once and rejects expired/invalid tokens.
- Reset revokes **all** refresh tokens; change-password revokes only **other** sessions.
- Revoke-session blocks revoking another user's session (403).


### Person 2 — Catalogue


| Endpoint                                | Controller stub                                    | Frontend / UI                            |
| --------------------------------------- | -------------------------------------------------- | ---------------------------------------- |
| `GET /api/products?q=&category=&limit=` | `list_products(query, category, limit, offset)`   | `ProductsPage.jsx`, `HomePage.jsx`       |
| `GET /api/products/{id}`                | `get_product(product_id)`                          | `ProductDetailPage.jsx`                  |
| `POST /api/admin/products`              | `admin_create_product(payload)`                    | `AdminDashboard` → Products tab          |
| `PATCH /api/admin/products/{id}`        | `admin_update_product(product_id, payload)`        | `AdminDashboard` → Products tab          |
| `DELETE /api/admin/products/{id}`       | `admin_delete_product(product_id)`                 | `AdminDashboard` → Products tab          |


**Notes**
- Public list/get must hide soft-deleted products (`deleted_at` is set). Admin sees them.
- Update uses **optimistic lock** on the `version` field: increment on success, return `409 Conflict` on mismatch.
- Delete is **soft**: set `deleted_at = utcnow()`, do not remove from DB.

**Acceptance criteria**
- Search "oak" returns at least 3 products; category filter works for all 6 categories.
- Soft-deleted products invisible to customers, visible to admin.
- Stale `version` returns 409.


### Person 3 — Cart


| Endpoint                                  | Controller stub                          | Frontend / UI                          |
| ----------------------------------------- | ---------------------------------------- | -------------------------------------- |
| `GET /api/cart`                           | `get_cart(user_id)`                      | `CartPage.jsx`, `CartDrawer.jsx`       |
| `POST /api/cart/items`                    | `add_item(user_id, product_id, qty)`     | "Add to bag" buttons                   |
| `PATCH /api/cart/items/{product_id}`      | `update_qty(user_id, product_id, qty)`   | qty stepper in cart                    |
| `DELETE /api/cart/items/{product_id}`     | `remove_item(user_id, product_id)`       | "Remove" button                        |
| `DELETE /api/cart`                        | `clear(user_id)`                         | called on successful order placement   |


**Notes**
- `get_cart` must auto-create an empty cart on first call (no 404).
- `add_item` **merges** quantity if a line for the same product already exists.
- `update_qty(qty <= 0)` removes the line entirely.

**Acceptance criteria**
- Adding the same product twice merges into one line with summed quantity.
- Setting quantity to 0 removes the line.
- Cart persists across logins.


### Person 4 — Checkout & Orders


| Endpoint                              | Controller stub                                    | Frontend / UI                              |
| ------------------------------------- | -------------------------------------------------- | ------------------------------------------ |
| `GET /api/orders`                     | `list_my_orders(user_id)`                          | `OrdersPage.jsx`                           |
| `GET /api/orders/{id}`                | `get_order(order_id, user)`                        | `OrderDetailPage.jsx`                      |
| `POST /api/orders`                    | `place_order(user, shipping_payload, card_raw)`    | `CheckoutPage.jsx` → `OrderConfirmPage`    |
| `PATCH /api/admin/orders/{id}/status` | `admin_update_status(order_id, new_status)`        | `AdminDashboard` → Orders tab              |


**`place_order` breakdown**
1. Strip card to `{ brand, last4, masked }` — never store raw PAN.
2. Compute totals using `constants.py`: subtotal, tax (`TAX_RATE`), shipping (`FLAT_SHIP` unless subtotal ≥ `FREE_SHIP_AT`), grand total.
3. **Atomically decrement stock** via Mongo `$inc` filtered by `stock >= qty`. Roll back on failure.
4. Snapshot each line (name, price, qty at order time) into the Order document.
5. Clear the user's cart.
6. Return the new order id for redirect.

**Notes**
- `get_order` must allow owner OR admin; everyone else gets 403/404.
- Status transitions enforce the state machine: `Processing → Shipped → Delivered`. Reject jumps.

**Acceptance criteria**
- Out-of-stock at checkout returns 409 and leaves the cart untouched.
- Shipping is free when subtotal ≥ `FREE_SHIP_AT`.
- Card raw value never appears in DB or logs.


### Person 5 — Admin Console (heaviest slice — backend + frontend)

#### Backend stubs


| Endpoint                            | Controller stub                       | What it returns                                                                            |
| ----------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------ |
| `GET /api/admin/dashboard`          | `kpi_dashboard()`                     | Today's order count, this week's revenue, low-stock count (`stock < 5`), 30-day active users. |
| `GET /api/admin/users?q=`           | `list_users(query)`                   | Paginated users with optional name/email search.                                           |
| `PATCH /api/admin/users/{id}/role`  | `update_user_role(user_id, role)`     | Set role to `"admin"` or `"customer"`. Reject any other value.                             |
| `DELETE /api/admin/users/{id}`      | `delete_user(user_id)`                | Soft-delete (`deleted_at`). **Cannot delete admins** (403). Cascade-delete the user's cart. |
| `GET /api/admin/orders?...`         | `list_orders(filters)`                | Filter by status / date range; newest first.                                               |
| `GET /api/admin/activity?action=`   | `list_activity(filters)`              | Audit log with optional action filter.                                                     |
| `GET /api/admin/analytics`          | `analytics_overview()`                | 30-day revenue per day; breakdowns by status / category / country (Mongo aggregation).     |


> `admin_update_status` for orders lives in `order_controller.py` and is shared with Person 4.

#### Frontend — split `AdminDashboard.jsx` into 6 tab components

The current `AdminDashboard.jsx` is a 52-line tab shell with `{tab} — TODO` placeholders. Build out 6 sections — recommended layout (one component per tab, target < 300 lines each):

```
src/pages/admin/
  AdminDashboardLayout.jsx     ← refactor of existing shell, owns tab routing
  DashboardTab.jsx             ← KPI cards (today / week / low stock / active users)
  ProductsTab.jsx              ← product list + create/edit modal + image upload + soft delete
  UsersTab.jsx                 ← user list + role toggle + delete (block admins)
  OrdersTab.jsx                ← order list + status filter + status transition button
  ActivityTab.jsx              ← audit log table with action filter
  AnalyticsTab.jsx             ← revenue chart + breakdowns
```


| Tab           | UI elements                                                                                              | API used                                     |
| ------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| **Dashboard** | 4 KPI cards (today / week / low stock / active users), each with number + label + icon. Optional sparkline. | `GET /api/admin/dashboard`                  |
| **Products**  | Table: img / name / category / price / stock / version / actions. "New product" button → modal form. Edit modal pre-fills. Delete with confirm. | `GET /api/products`, `POST/PATCH/DELETE /api/admin/products[/:id]` |
| **Users**     | Table: name / email / role / joined / actions. Role dropdown. Delete button disabled for admins. Search box. | `GET /api/admin/users?q=`, `PATCH .../role`, `DELETE .../{id}` |
| **Orders**    | Table: order id / customer / total / status pill / date / action. Filter chips: All / Processing / Shipped / Delivered. Status transition cycles to next state. | `GET /api/admin/orders?status=&date_from=&date_to=`, `PATCH .../status` |
| **Activity**  | Audit log table: timestamp / actor / action / target. Action filter dropdown.                            | `GET /api/admin/activity?action=`           |
| **Analytics** | Line chart: revenue per day (30 days). Stacked bar: orders by status. Pie/bar: orders by category. Country breakdown. | `GET /api/admin/analytics`                  |


**Reusable components to extract**
- `<KpiCard label icon value sub />` — used 4× in Dashboard.
- `<DataTable columns rows />` — used in Products / Users / Orders / Activity.
- `<StatusPill status />` — order status with color (Processing=amber, Shipped=blue, Delivered=green).
- `<ConfirmDialog />` — for destructive actions.

**`services/adminService.js`** is already wired for every endpoint. Add mock fallback the same way `productService.js` does — wrap each call in `try { real } catch (e) { if (e.isStub) return MOCK_X }`.

**Acceptance criteria**
- Dashboard renders without errors when backend is fully implemented.
- Cannot delete an admin user (UI disabled + backend 403).
- Order status transitions enforce the state machine.
- All tables paginate or virtualize gracefully past 100 rows.
- Analytics renders even when backend is stubbed (mock data).


---

## Coordination Rules

1. **`frontend/src/mock/seed.js` is the API contract.** Your backend response must match the shape of the corresponding `MOCK_*` export. Open the file, copy the field names/types, return the same. (Auth uses `backend/schemas/auth.py` instead.) If the shape diverges, the UI breaks.
2. **Stay inside your slice.** Don't touch other people's controllers. If you need a new endpoint, add it under your own route file.
3. **Run uvicorn and `npm run dev` simultaneously.** Hit endpoints via Swagger (<http://localhost:8000/docs>) or the running frontend.
4. **Branch naming:** `slice/<name>` — e.g. `slice/cart`, `slice/admin`. Open a PR against `main` when your acceptance criteria pass.
5. **Bugs in another slice → file an issue, don't fix it yourself.** Keeps blame and ownership clean.

## Notes

- **Auth model:** Argon2id with per-user random salt. Access JWT (30 min, in-memory in React Context). Refresh JWT (30 days, httpOnly Secure SameSite=Strict cookie). Auto-rotation on every refresh.
- **Stub mechanism:** `middleware/error_handler.py` catches `NotImplementedError` and returns HTTP 501 with `{success:false, error:"NotImplementedError: ..."}`
- **TLS on macOS:** `database.py` passes `tlsCAFile=certifi.where()` to Motor so Atlas TLS verification works without `Install Certificates.command`
- **No TypeScript** — assignment uses JSX only

