from datetime import datetime, timezone
from typing import Literal, Optional
from uuid import uuid4

from beanie import Document
from pydantic import BaseModel, Field


class OrderItem(BaseModel):
    product_id: str
    qty: int
    unit_price: int  # price captured at the time of order


class ShippingAddress(BaseModel):
    name: str
    address: str
    city: str
    postal: str
    country: str
    country_code: str | None = None #optional
    lat: float | None = None
    lng: float | None = None


class Payment(BaseModel):
    brand: str
    last4: str
    masked: str


class Order(Document):
    id: Optional[str] = Field(default_factory=lambda: str(uuid4()), alias="_id")
    user_id: str
    items: list[OrderItem]
    subtotal: int
    shipping_fee: int
    tax: int
    total: int
    status: Literal["Processing", "Shipped", "Delivered"] = "Processing"
    version: int = 0
    placed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    shipping: ShippingAddress
    payment: Payment

    class Settings:
        name = "orders"
