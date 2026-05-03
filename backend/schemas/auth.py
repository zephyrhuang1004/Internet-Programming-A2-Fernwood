from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class RegisterIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=4, max_length=128)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UpdateMeIn(BaseModel):
    name: str | None = Field(default=None, max_length=120)
    email: EmailStr | None = None


class MeOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: Literal["admin", "customer"]
    joined_at: datetime


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: MeOut


class SessionOut(BaseModel):
    id: str
    created_at: datetime
    expires_at: datetime
    user_agent: str | None
    is_current: bool


# ---- Person 1 to implement controllers for the schemas below ----

class ForgotPasswordIn(BaseModel):
    email: EmailStr


class ResetPasswordIn(BaseModel):
    token: str = Field(min_length=8, max_length=256)
    new_password: str = Field(min_length=4, max_length=128)


class ChangePasswordIn(BaseModel):
    old_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=4, max_length=128)
