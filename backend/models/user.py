from datetime import datetime, timezone
from typing import Literal, Optional
from uuid import uuid4

from beanie import Document, Indexed
from pydantic import EmailStr, Field


class User(Document):
    id: Optional[str] = Field(default_factory=lambda: str(uuid4()), alias="_id")
    name: str
    email: Indexed(EmailStr, unique=True)
    role: Literal["admin", "customer"] = "customer"
    password_hash: str
    password_salt: str
    joined_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    deleted_at: datetime | None = None

    class Settings:
        name = "users"
        use_state_management = True
