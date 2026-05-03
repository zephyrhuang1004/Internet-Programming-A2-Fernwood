from fastapi import APIRouter, Query

from controllers import product_controller as pc


router = APIRouter()


@router.get("")
async def list_products(
    q: str | None = Query(default=None),
    category: str | None = Query(default=None),
    limit: int = Query(default=50, le=200),
    offset: int = Query(default=0, ge=0),
):
    data = await pc.list_products(q, category, limit, offset)
    return {"success": True, "data": data, "error": None}


@router.get("/{product_id}")
async def get_product(product_id: str):
    data = await pc.get_product(product_id)
    return {"success": True, "data": data, "error": None}
