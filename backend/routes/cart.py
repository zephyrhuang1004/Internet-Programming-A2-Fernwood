from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from controllers import cart_controller as cc
from middleware.auth_middleware import get_current_user
from models.user import User


router = APIRouter()


class AddItemIn(BaseModel):
    product_id: str
    qty: int = Field(default=1, ge=1)


class UpdateQtyIn(BaseModel):
    qty: int


@router.get("")
async def get(user: User = Depends(get_current_user)):
    return {"success": True, "data": await cc.get_cart(user.id), "error": None}


@router.post("/items")
async def add(body: AddItemIn, user: User = Depends(get_current_user)):
    return {"success": True, "data": await cc.add_item(user.id, body.product_id, body.qty), "error": None}


@router.patch("/items/{product_id}")
async def update(product_id: str, body: UpdateQtyIn, user: User = Depends(get_current_user)):
    return {"success": True, "data": await cc.update_qty(user.id, product_id, body.qty), "error": None}


@router.delete("/items/{product_id}")
async def remove(product_id: str, user: User = Depends(get_current_user)):
    return {"success": True, "data": await cc.remove_item(user.id, product_id), "error": None}


@router.delete("")
async def clear(user: User = Depends(get_current_user)):
    return {"success": True, "data": await cc.clear(user.id), "error": None}
