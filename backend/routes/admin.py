from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel

from controllers import admin_controller as adc
from controllers import order_controller as oc
from controllers import product_controller as pc
from middleware.auth_middleware import require_admin
from models.user import User


router = APIRouter()


class RoleIn(BaseModel):
    role: str  # "admin" | "customer"


class StatusIn(BaseModel):
    status: str  # "Processing" | "Shipped" | "Delivered"


@router.get("/dashboard")
async def dashboard(_: User = Depends(require_admin)):
    return {"success": True, "data": await adc.kpi_dashboard(), "error": None}


# ----- Users -----
@router.get("/users")
async def users(q: str | None = Query(default=None), _: User = Depends(require_admin)):
    return {"success": True, "data": await adc.list_users(q), "error": None}


@router.patch("/users/{user_id}/role")
async def set_role(user_id: str, body: RoleIn, actor: User = Depends(require_admin)):
    return {"success": True, "data": await adc.update_user_role(user_id, body.role, actor=actor), "error": None}


@router.delete("/users/{user_id}")
async def del_user(user_id: str, actor: User = Depends(require_admin)):
    return {"success": True, "data": await adc.delete_user(user_id, actor=actor), "error": None}


@router.get("/users/{user_id}/cart")
async def user_cart(user_id: str, _: User = Depends(require_admin)):
    return {"success": True, "data": await adc.get_user_cart(user_id), "error": None}


# ----- Products -----
@router.get("/products")
async def list_admin_products(q: str | None = Query(default=None), _: User = Depends(require_admin)):
    return {"success": True, "data": await adc.list_admin_products(q), "error": None}


@router.post("/products")
async def create_product(payload: dict, actor: User = Depends(require_admin)):
    return {"success": True, "data": await pc.admin_create_product(payload, actor=actor), "error": None}


@router.patch("/products/{product_id}")
async def update_product(product_id: str, payload: dict, actor: User = Depends(require_admin)):
    return {"success": True, "data": await pc.admin_update_product(product_id, payload, actor=actor), "error": None}


@router.delete("/products/{product_id}")
async def delete_product(product_id: str, actor: User = Depends(require_admin)):
    return {"success": True, "data": await pc.admin_delete_product(product_id, actor=actor), "error": None}


@router.patch("/products/{product_id}/restore")
async def restore_product(product_id: str, actor: User = Depends(require_admin)):
    return {"success": True, "data": await pc.admin_restore_product(product_id, actor=actor), "error": None}


# ----- Orders -----
@router.get("/orders")
async def list_orders(
    status: str | None = Query(default=None),
    date_from: str | None = Query(default=None),
    date_to: str | None = Query(default=None),
    _: User = Depends(require_admin),
):
    return {"success": True, "data": await adc.list_orders({"status": status, "from": date_from, "to": date_to}), "error": None}


@router.patch("/orders/{order_id}/status")
async def order_status(order_id: str, body: StatusIn, actor: User = Depends(require_admin)):
    return {"success": True, "data": await oc.admin_update_status(order_id, body.status, actor=actor), "error": None}


# ----- Activity / Analytics -----
@router.get("/activity")
async def activity(action: str | None = Query(default=None), _: User = Depends(require_admin)):
    return {"success": True, "data": await adc.list_activity({"action": action}), "error": None}


@router.get("/analytics")
async def analytics(_: User = Depends(require_admin)):
    return {"success": True, "data": await adc.analytics_overview(), "error": None}
