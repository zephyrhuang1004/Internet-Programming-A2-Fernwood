from fastapi import APIRouter, Depends
from pydantic import BaseModel

from controllers import order_controller as oc
from middleware.auth_middleware import get_current_user
from models.user import User


router = APIRouter()


class ShippingIn(BaseModel):
    name: str
    address: str
    city: str
    postal: str
    country: str


class PlaceOrderIn(BaseModel):
    shipping: ShippingIn
    card: str  # raw card number — controller strips before persisting


@router.get("")
async def my_orders(user: User = Depends(get_current_user)):
    return {"success": True, "data": await oc.list_my_orders(user.id), "error": None}


@router.post("")
async def place(body: PlaceOrderIn, user: User = Depends(get_current_user)):
    data = await oc.place_order(user, body.shipping.model_dump(), body.card)
    return {"success": True, "data": data, "error": None}


@router.get("/{order_id}")
async def detail(order_id: str, user: User = Depends(get_current_user)):
    return {"success": True, "data": await oc.get_order(order_id, user), "error": None}
