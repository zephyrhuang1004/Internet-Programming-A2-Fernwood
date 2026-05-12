"""Person 2 (Catalogue) — public endpoints + admin CRUD shared with Person 5."""
from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException

from controllers.admin_controller import _log, _serialize_product
from models.product import Product


# ---------------------------------------------------------------------------
# Public (Person 2 stubs — left raising NotImplementedError on purpose so the
# slice owner can implement them; admin slice does not depend on these.)
# ---------------------------------------------------------------------------

async def list_products(query: str | None, category: str | None, limit: int, offset: int):
    raise NotImplementedError("Person 2: implement list_products with query/category filters")


async def get_product(product_id: str):
    raise NotImplementedError("Person 2: implement get_product by id, return 404 if deleted")


# ---------------------------------------------------------------------------
# Admin CRUD (used by AdminDashboard → Products tab)
# ---------------------------------------------------------------------------

_ALLOWED_FIELDS = {"name", "category", "material", "price", "stock", "img", "tagline", "palette"}


def _clean_payload(payload: dict[str, Any]) -> dict[str, Any]:
    return {k: v for k, v in payload.items() if k in _ALLOWED_FIELDS}


async def admin_create_product(payload: dict[str, Any], actor=None) -> dict[str, Any]:
    data = _clean_payload(payload)
    if not data.get("name", "").strip():
        raise HTTPException(status_code=400, detail="name is required")
    if int(data.get("price", 0)) < 0:
        raise HTTPException(status_code=400, detail="price must be >= 0")
    if int(data.get("stock", 0)) < 0:
        raise HTTPException(status_code=400, detail="stock must be >= 0")

    product = Product(
        name=data["name"].strip(),
        category=data.get("category", "Seating"),
        material=data.get("material", "Solid oak"),
        price=int(data.get("price", 0)),
        stock=int(data.get("stock", 0)),
        img=data.get("img", ""),
        tagline=data.get("tagline", ""),
        palette=data.get("palette", "Sand"),
        version=1,
    )
    await product.insert()
    await _log(actor.id if actor else None, "product.created", f"Created {product.name}")
    return _serialize_product(product)


async def admin_update_product(product_id: str, payload: dict[str, Any], actor=None) -> dict[str, Any]:
    product = await Product.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    expected_version = payload.get("version")
    if expected_version is None:
        raise HTTPException(status_code=400, detail="version is required for optimistic-lock")
    if int(expected_version) != product.version:
        raise HTTPException(status_code=409, detail="version mismatch")

    data = _clean_payload(payload)
    for k, v in data.items():
        setattr(product, k, v)
    product.version += 1
    await product.save()
    await _log(actor.id if actor else None, "product.updated", f"Updated {product.name}")
    return _serialize_product(product)


async def admin_restore_product(product_id: str, actor=None) -> dict[str, Any]:
    """Undo a soft-delete by clearing deleted_at."""
    product = await Product.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.deleted_at is None:
        # already active — return current state, no-op
        return _serialize_product(product)
    product.deleted_at = None
    product.version += 1
    await product.save()
    await _log(actor.id if actor else None, "product.restored", f"Restored {product.name}")
    return _serialize_product(product)


async def admin_delete_product(product_id: str, actor=None) -> dict[str, Any]:
    product = await Product.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.deleted_at is not None:
        return {
            "ok": True,
            "_id": product.id,
            "deleted_at": product.deleted_at.isoformat(),
        }
    product.deleted_at = datetime.now(timezone.utc)
    await product.save()
    await _log(actor.id if actor else None, "product.deleted", f"Removed {product.name}")
    return {
        "ok": True,
        "_id": product.id,
        "deleted_at": product.deleted_at.isoformat(),
    }
