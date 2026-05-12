import re
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel

from controllers import admin_controller as adc
from controllers import order_controller as oc
from controllers import product_controller as pc
from middleware.auth_middleware import require_admin
from models.activity_log import ActivityLog
from models.user import User


router = APIRouter()


# ---------------------------------------------------------------------------
# Upload constraints
# ---------------------------------------------------------------------------
UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5 MB
ALLOWED_MIME = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}
# UUID v4 + image ext — rejects anything with `..`, `/`, etc.
SAFE_FILENAME = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$")


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


# ----- File uploads (product images) -----
@router.post("/uploads")
async def upload_image(file: UploadFile = File(...), actor: User = Depends(require_admin)):
    """Accept a single image file, store it under backend/uploads/<uuid>.<ext>,
    return a URL the front end can stuff into product.img.
    """
    ext = ALLOWED_MIME.get(file.content_type or "")
    if ext is None:
        raise HTTPException(status_code=415, detail=f"Unsupported media type: {file.content_type}")

    # Read once; bail out if too large.
    data = await file.read()
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail=f"File exceeds {MAX_UPLOAD_BYTES // 1024 // 1024} MB limit")
    if not data:
        raise HTTPException(status_code=400, detail="Empty upload")

    filename = f"{uuid.uuid4()}{ext}"
    target = UPLOAD_DIR / filename
    with open(target, "wb") as f:
        f.write(data)

    await ActivityLog(
        user_id=actor.id,
        action="product.image_uploaded",
        detail=f"{filename} ({len(data) // 1024} KB)",
    ).insert()

    return {
        "success": True,
        "data": {"url": f"/api/admin/uploads/{filename}", "size": len(data)},
        "error": None,
    }


@router.get("/uploads/{filename}")
async def serve_upload(filename: str):
    """Public read of an admin-uploaded image — customers see catalogue too.
    Filename pattern is strictly validated to block path traversal.
    """
    if not SAFE_FILENAME.match(filename):
        raise HTTPException(status_code=400, detail="Invalid filename")
    path = UPLOAD_DIR / filename
    if not path.is_file():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path)
