"""Person 2 (Catalogue) — implement these. All currently raise NotImplementedError → HTTP 501."""


async def list_products(query: str | None, category: str | None, limit: int, offset: int):
    raise NotImplementedError("Person 2: implement list_products with query/category filters")


async def get_product(product_id: str):
    raise NotImplementedError("Person 2: implement get_product by id, return 404 if deleted")


async def admin_create_product(payload: dict):
    raise NotImplementedError("Person 2: admin create_product")


async def admin_update_product(product_id: str, payload: dict):
    raise NotImplementedError("Person 2: admin update_product (optimistic lock via version)")


async def admin_delete_product(product_id: str):
    raise NotImplementedError("Person 2: admin soft-delete (set deleted_at)")
