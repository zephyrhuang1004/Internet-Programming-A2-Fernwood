"""Person 5 (Admin) — implementations.

Each method returns the exact shape documented in
`frontend/src/mock/seed.js` so the UI does not need to translate fields.
"""
import asyncio
import re
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import HTTPException

from models.activity_log import ActivityLog
from models.cart import Cart
from models.order import Order
from models.product import Product
from models.user import User


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _serialize_user(u: User) -> dict[str, Any]:
    """Public user shape (no secrets). Matches MOCK_ADMIN_USERS in seed.js."""
    return {
        "_id": u.id,
        "name": u.name,
        "email": u.email,
        "role": u.role,
        "joined_at": u.joined_at.isoformat() if u.joined_at else None,
        "deleted_at": u.deleted_at.isoformat() if u.deleted_at else None,
    }


def _serialize_product(p: Product) -> dict[str, Any]:
    return {
        "_id": p.id,
        "name": p.name,
        "category": p.category,
        "material": p.material,
        "price": p.price,
        "stock": p.stock,
        "img": p.img,
        "tagline": p.tagline,
        "palette": p.palette,
        "version": p.version,
        "deleted_at": p.deleted_at.isoformat() if p.deleted_at else None,
        "created_at": p.created_at.isoformat() if p.created_at else None,
    }


def _serialize_order(o: Order) -> dict[str, Any]:
    return {
        "_id": o.id,
        "user_id": o.user_id,
        "items": [
            {"product_id": it.product_id, "qty": it.qty, "unit_price": it.unit_price}
            for it in o.items
        ],
        "subtotal": o.subtotal,
        "shipping_fee": o.shipping_fee,
        "tax": o.tax,
        "total": o.total,
        "status": o.status,
        "placed_at": o.placed_at.isoformat() if o.placed_at else None,
        "shipping": o.shipping.model_dump(),
        "payment": o.payment.model_dump(),
    }


def _serialize_activity(a: ActivityLog) -> dict[str, Any]:
    return {
        "_id": a.id,
        "at": a.at.isoformat() if a.at else None,
        "user_id": a.user_id,
        "action": a.action,
        "detail": a.detail,
    }


async def _log(actor_id: str | None, action: str, detail: str) -> None:
    await ActivityLog(user_id=actor_id, action=action, detail=detail).insert()


# ---------------------------------------------------------------------------
# Dashboard KPIs
# ---------------------------------------------------------------------------

async def kpi_dashboard() -> dict[str, Any]:
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = now - timedelta(days=7)
    month_start = now - timedelta(days=30)

    today_orders, week_revenue_rows, low_stock_count, active_users = await asyncio.gather(
        Order.find(Order.placed_at >= today_start).count(),
        Order.aggregate([
            {"$match": {"placed_at": {"$gte": week_start}}},
            {"$group": {"_id": None, "revenue": {"$sum": "$total"}}},
        ]).to_list(),
        Product.find({"stock": {"$lt": 5}, "deleted_at": None}).count(),
        Order.aggregate([
            {"$match": {"placed_at": {"$gte": month_start}}},
            {"$group": {"_id": "$user_id"}},
            {"$count": "n"},
        ]).to_list(),
    )

    week_revenue = week_revenue_rows[0]["revenue"] if week_revenue_rows else 0
    active_users_30d = active_users[0]["n"] if active_users else 0

    return {
        "today_orders": today_orders,
        "week_revenue": int(week_revenue),
        "low_stock_count": low_stock_count,
        "active_users_30d": active_users_30d,
    }


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------

async def list_users(query: str | None) -> list[dict[str, Any]]:
    filt: dict[str, Any] = {"deleted_at": None}
    if query:
        rx = re.compile(re.escape(query), re.IGNORECASE)
        filt["$or"] = [{"name": rx}, {"email": rx}]
    users = await User.find(filt).sort("-joined_at").to_list()
    return [_serialize_user(u) for u in users]


async def update_user_role(user_id: str, role: str, actor: User | None = None) -> dict[str, Any]:
    if role not in ("admin", "customer"):
        raise HTTPException(status_code=400, detail="role must be 'admin' or 'customer'")
    user = await User.get(user_id)
    if not user or user.deleted_at is not None:
        raise HTTPException(status_code=404, detail="User not found")
    old_role = user.role
    user.role = role
    user.updated_at = datetime.now(timezone.utc)
    await user.save()
    await _log(
        actor.id if actor else None,
        "user.role_changed",
        f"{user.email}: {old_role} → {role}",
    )
    return _serialize_user(user)


async def delete_user(user_id: str, actor: User | None = None) -> dict[str, Any]:
    user = await User.get(user_id)
    if not user or user.deleted_at is not None:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == "admin":
        raise HTTPException(status_code=403, detail="Cannot delete an admin user")
    user.deleted_at = datetime.now(timezone.utc)
    user.updated_at = datetime.now(timezone.utc)
    await user.save()
    cart = await Cart.get(user_id)
    if cart:
        await cart.delete()
    await _log(actor.id if actor else None, "user.deleted", f"Removed {user.email}")
    return {"ok": True, "_id": user_id}


# ---------------------------------------------------------------------------
# Orders (admin view)
# ---------------------------------------------------------------------------

async def list_orders(filters: dict[str, Any]) -> list[dict[str, Any]]:
    filt: dict[str, Any] = {}
    if filters.get("status"):
        filt["status"] = filters["status"]
    date_range: dict[str, Any] = {}
    if filters.get("from"):
        try:
            date_range["$gte"] = datetime.fromisoformat(filters["from"].replace("Z", "+00:00"))
        except ValueError:
            pass
    if filters.get("to"):
        try:
            date_range["$lte"] = datetime.fromisoformat(filters["to"].replace("Z", "+00:00"))
        except ValueError:
            pass
    if date_range:
        filt["placed_at"] = date_range

    orders = await Order.find(filt).sort("-placed_at").limit(200).to_list()
    return [_serialize_order(o) for o in orders]


# ---------------------------------------------------------------------------
# Activity log
# ---------------------------------------------------------------------------

async def list_activity(filters: dict[str, Any]) -> list[dict[str, Any]]:
    filt: dict[str, Any] = {}
    if filters.get("action"):
        filt["action"] = filters["action"]
    rows = await ActivityLog.find(filt).sort("-at").limit(200).to_list()
    return [_serialize_activity(r) for r in rows]


# ---------------------------------------------------------------------------
# Analytics overview
# ---------------------------------------------------------------------------

async def analytics_overview() -> dict[str, Any]:
    now = datetime.now(timezone.utc)
    start = (now - timedelta(days=29)).replace(hour=0, minute=0, second=0, microsecond=0)

    rev_rows, status_rows, cat_rows, country_rows = await asyncio.gather(
        Order.aggregate([
            {"$match": {"placed_at": {"$gte": start}}},
            {"$group": {
                "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$placed_at"}},
                "revenue": {"$sum": "$total"},
            }},
            {"$sort": {"_id": 1}},
        ]).to_list(),
        Order.aggregate([
            {"$group": {
                "_id": "$status",
                "count": {"$sum": 1},
                "revenue": {"$sum": "$total"},
            }},
        ]).to_list(),
        Order.aggregate([
            {"$unwind": "$items"},
            {"$lookup": {
                "from": "products",
                "localField": "items.product_id",
                "foreignField": "_id",
                "as": "p",
            }},
            {"$unwind": "$p"},
            {"$group": {
                "_id": "$p.category",
                "count": {"$sum": "$items.qty"},
                "revenue": {"$sum": {"$multiply": ["$items.qty", "$items.unit_price"]}},
            }},
            {"$sort": {"revenue": -1}},
        ]).to_list(),
        Order.aggregate([
            {"$match": {"shipping.country": {"$exists": True, "$ne": None}}},
            {"$group": {
                "_id": "$shipping.country",
                "country_code": {"$max": "$shipping.country_code"},
                "count": {"$sum": 1},
                "revenue": {"$sum": "$total"},
            }},
            {"$sort": {"count": -1}},
        ]).to_list(),
    )

    # Zero-fill last 30 days
    rev_map = {r["_id"]: int(r["revenue"]) for r in rev_rows}
    revenue_by_day = []
    for i in range(30):
        d = (start + timedelta(days=i)).strftime("%Y-%m-%d")
        revenue_by_day.append({"date": d, "revenue": rev_map.get(d, 0)})

    status_order = ["Processing", "Shipped", "Delivered"]
    status_map = {r["_id"]: r for r in status_rows}
    by_status = [
        {
            "status": s,
            "count": int(status_map.get(s, {}).get("count", 0)),
            "revenue": int(status_map.get(s, {}).get("revenue", 0)),
        }
        for s in status_order
    ]

    by_category = [
        {"category": r["_id"], "count": int(r["count"]), "revenue": int(r["revenue"])}
        for r in cat_rows
    ]

    by_country = [
        {
            "country": r["_id"],
            "country_code": r.get("country_code") or "??",
            "count": int(r["count"]),
            "revenue": int(r["revenue"]),
        }
        for r in country_rows
    ]

    return {
        "revenue_by_day": revenue_by_day,
        "by_status": by_status,
        "by_category": by_category,
        "by_country": by_country,
    }


# ---------------------------------------------------------------------------
# Admin product list (admin sees soft-deleted too)
# ---------------------------------------------------------------------------

async def list_admin_products(query: str | None) -> list[dict[str, Any]]:
    filt: dict[str, Any] = {}
    if query:
        rx = re.compile(re.escape(query), re.IGNORECASE)
        filt["$or"] = [{"name": rx}, {"category": rx}, {"material": rx}]
    products = await Product.find(filt).sort("-created_at").limit(500).to_list()
    return [_serialize_product(p) for p in products]


# ---------------------------------------------------------------------------
# User cart inspection (admin requirement from the spec)
# ---------------------------------------------------------------------------

async def get_user_cart(user_id: str) -> dict[str, Any]:
    """Hydrate a user's cart with product details for the admin UI.

    Each line includes name / img / category / unit_price so the front end
    can render a rich cart card with one round trip. Empty cart returns the
    same envelope with items: [] so the UI never has to handle 404 separately.
    """
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    cart = await Cart.get(user_id)

    items_out: list[dict[str, Any]] = []
    subtotal = 0

    if cart and cart.items:
        # Pre-fetch every product referenced by the cart in one query.
        product_ids = [it.product_id for it in cart.items]
        products = await Product.find({"_id": {"$in": product_ids}}).to_list()
        by_id = {p.id: p for p in products}

        for it in cart.items:
            p = by_id.get(it.product_id)
            # Some cart-slice implementations snapshot a unit_price on the
            # cart item; if it's not there, fall back to current product price.
            snap = getattr(it, "unit_price", None)
            unit_price = int(snap) if snap is not None else (int(p.price) if p else 0)
            line_total = unit_price * int(it.qty)
            items_out.append({
                "product_id": it.product_id,
                "qty": int(it.qty),
                "unit_price": unit_price,
                "line_total": line_total,
                "name": p.name if p else "(product removed)",
                "img": p.img if p else "",
                "category": p.category if p else "",
                "product_deleted": bool(p and p.deleted_at),
            })
            subtotal += line_total

    return {
        "_id": user_id,
        "user_name": user.name,
        "user_email": user.email,
        "items": items_out,
        "subtotal": subtotal,
        "updated_at": cart.updated_at.isoformat() if cart and cart.updated_at else None,
    }
