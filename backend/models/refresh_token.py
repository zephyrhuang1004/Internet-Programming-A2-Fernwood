from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from beanie import Document, Indexed
from pydantic import Field


class RefreshToken(Document):
    id: Optional[str] = Field(default_factory=lambda: str(uuid4()), alias="_id")
    user_id: str
    token_hash: Indexed(str, unique=True)
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    user_agent: str | None = None
    revoked_at: datetime | None = None

    class Settings:
        name = "refresh_tokens"
