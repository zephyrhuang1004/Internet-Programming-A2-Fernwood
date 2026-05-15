"""Person 2 (Catalogue) — all five stubs implemented."""

from datetime import datetime, timezone

from models.product import Product


async def list_products(
    query: str | None,
    category: str | None,
    limit: int,
    offset: int,
):
    """
    GET /api/products?q=&category=&limit=&offset=
    - Hides soft-deleted products (deleted_at is set)
    - Filters by category if provided
    - Searches name, material, tagline, category if q is provided
    - Returns list of products
    """
    filters = [Product.deleted_at == None]  # hide soft-deleted

    if category:
        filters.append(Product.category == category)

    if query:
        q = query.strip()
        filters.append(
            {
                "$or": [
                    {"name": {"$regex": q, "$options": "i"}},
                    {"material": {"$regex": q, "$options": "i"}},
                    {"tagline": {"$regex": q, "$options": "i"}},
                    {"category": {"$regex": q, "$options": "i"}},
                ]
            }
        )

    products = (
        await Product.find(*filters)
        .skip(offset)
        .limit(limit)
        .to_list()
    )

    return products


async def get_product(product_id: str):
    """
    GET /api/products/{id}
    - Returns a single product
    - Returns None if not found or soft-deleted
    """
    product = await Product.get(product_id)

    if not product or product.deleted_at is not None:
        return None

    return product


async def admin_create_product(payload: dict):
    """
    POST /api/admin/products
    - Creates a new product
    - Admin only
    """
    product = Product(
        name=payload.get("name", ""),
        category=payload.get("category", ""),
        material=payload.get("material", ""),
        price=payload.get("price", 0),
        stock=payload.get("stock", 0),
        img=payload.get("img", ""),
        tagline=payload.get("tagline", ""),
        palette=payload.get("palette", "Sand"),
        version=0,
    )
    await product.insert()
    return product


async def admin_update_product(product_id: str, payload: dict):
    """
    PATCH /api/admin/products/{id}
    - Updates a product using optimistic locking on the version field
    - Returns None if not found
    - Raises ValueError with '409' if version mismatch (stale update)
    """
    product = await Product.get(product_id)

    if not product:
        return None

    # Optimistic lock — client must send the current version
    client_version = payload.get("version")
    if client_version is not None and int(client_version) != product.version:
        raise ValueError("409")

    # Apply updates
    allowed_fields = {
        "name", "category", "material", "price",
        "stock", "img", "tagline", "palette"
    }
    for field, value in payload.items():
        if field in allowed_fields:
            setattr(product, field, value)

    # Increment version on success
    product.version += 1

    await product.save()
    return product


async def admin_delete_product(product_id: str):
    """
    DELETE /api/admin/products/{id}
    - Soft delete: sets deleted_at = now(), does NOT remove from DB
    - Admins can still see it; customers cannot
    - Returns None if not found
    """
    product = await Product.get(product_id)

    if not product:
        return None

    product.deleted_at = datetime.now(timezone.utc)
    await product.save()
    return product
