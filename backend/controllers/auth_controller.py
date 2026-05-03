"""Auth controller — argon2id + JWT (access) + refresh-token rotation.

Person 1: WIRED. Other persons should mirror this pattern in their controllers.
"""
from __future__ import annotations

import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from beanie import PydanticObjectId
from fastapi import HTTPException, status
from jose import jwt

from config import settings
from models.user import User
from models.refresh_token import RefreshToken


_ph = PasswordHasher()


def hash_password(plaintext: str) -> tuple[str, str]:
    """Return (hash, salt). Argon2id encodes its own salt; password_salt is legacy
    and kept only for schema compatibility."""
    salt = secrets.token_urlsafe(16)
    return _ph.hash(plaintext), salt


def verify_password(stored_hash: str, _salt_unused: str, plaintext: str) -> bool:
    try:
        _ph.verify(stored_hash, plaintext)
        return True
    except VerifyMismatchError:
        return False


def make_access_token(user: User) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=settings.ACCESS_TTL_MIN)).timestamp()),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALG)


def _hash_refresh(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


async def issue_refresh_token(user: User, user_agent: str | None) -> str:
    """Generate a refresh token, persist its hash, return the plaintext token."""
    plain = secrets.token_urlsafe(48)
    expires = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TTL_DAYS)
    rt = RefreshToken(
        user_id=user.id,
        token_hash=_hash_refresh(plain),
        expires_at=expires,
        user_agent=user_agent,
    )
    await rt.insert()
    return plain


async def rotate_refresh_token(plaintext: str, user_agent: str | None) -> tuple[User, str]:
    """Validate, revoke, and issue a new refresh token. Returns (user, new_plaintext)."""
    th = _hash_refresh(plaintext)
    rt = await RefreshToken.find_one(RefreshToken.token_hash == th)
    if not rt or rt.revoked_at is not None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    # Mongo may return naive datetime; normalize to UTC-aware
    expires_at = rt.expires_at if rt.expires_at.tzinfo else rt.expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired")

    user = await User.get(rt.user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    rt.revoked_at = datetime.now(timezone.utc)
    await rt.save()
    new_plain = await issue_refresh_token(user, user_agent)
    return user, new_plain


async def revoke_refresh_token(plaintext: str) -> None:
    th = _hash_refresh(plaintext)
    rt = await RefreshToken.find_one(RefreshToken.token_hash == th)
    if rt and rt.revoked_at is None:
        rt.revoked_at = datetime.now(timezone.utc)
        await rt.save()


async def register_user(name: str, email: str, password: str) -> User:
    email = email.strip().lower()
    if await User.find_one(User.email == email):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    h, salt = hash_password(password)
    user = User(name=name.strip(), email=email, password_hash=h, password_salt=salt, role="customer")
    await user.insert()
    return user


async def authenticate(email: str, password: str) -> User:
    email = email.strip().lower()
    user = await User.find_one(User.email == email)
    if not user or not verify_password(user.password_hash, user.password_salt, password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    return user


async def update_profile(user: User, name: str | None, email: str | None) -> User:
    if name is not None:
        user.name = name.strip()
    if email is not None:
        new_email = email.strip().lower()
        if new_email != user.email:
            existing = await User.find_one(User.email == new_email)
            if existing:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already in use")
            user.email = new_email
    user.updated_at = datetime.now(timezone.utc)
    await user.save()
    return user


async def list_sessions(user: User, current_token_plain: str | None) -> list[dict]:
    cursor = RefreshToken.find(
        RefreshToken.user_id == user.id,
        RefreshToken.revoked_at == None,  # noqa: E711
    )
    items = []
    current_hash = _hash_refresh(current_token_plain) if current_token_plain else None
    async for rt in cursor:
        items.append({
            "id": str(rt.id),
            "created_at": rt.created_at,
            "expires_at": rt.expires_at,
            "user_agent": rt.user_agent,
            "is_current": rt.token_hash == current_hash,
        })
    return items


def me_out(user: User) -> dict:
    return {
        "id": str(user.id),
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "joined_at": user.joined_at,
    }


# ============================================================
# Person 1 — implement these. All raise NotImplementedError → HTTP 501.
# Frontend service falls back to mock so the UI remains browseable.
# ============================================================

async def request_password_reset(email: str) -> dict:
    """Issue a single-use reset token for `email`.

    Person 1: store token (or its hash) on the User document with a TTL
    (e.g. `reset_token_hash` + `reset_token_expires_at` fields), then
    return the token in the response so the frontend can display it
    (mock-email flow — no real email sender required for the assignment).
    Always return success even if the email doesn't exist (avoid user
    enumeration), but only persist a token when the user actually exists.
    """
    raise NotImplementedError(
        "Person 1: implement request_password_reset (issue reset token, persist hash, return token for mock-email flow)"
    )


async def reset_password(token: str, new_password: str) -> User:
    """Consume a reset token and set a new password.

    Person 1: look up the user by `reset_token_hash`, check expiry, hash
    the new password with `hash_password()`, clear the reset fields, and
    revoke all existing refresh tokens for that user (force re-login on
    every device for safety).
    """
    raise NotImplementedError(
        "Person 1: implement reset_password (verify token, hash new password, revoke all sessions)"
    )


async def change_password(user: User, old_password: str, new_password: str) -> User:
    """Change password for an authenticated user.

    Person 1: verify `old_password` with `verify_password()`, hash the
    new one with `hash_password()`, save the user, and revoke all OTHER
    refresh tokens (keep the current session alive — the route handler
    knows which token is current via the cookie).
    """
    raise NotImplementedError(
        "Person 1: implement change_password (verify old, hash new, revoke other sessions)"
    )


async def revoke_session(user: User, session_id: str) -> None:
    """Revoke one specific refresh token belonging to the user.

    Person 1: look up `RefreshToken` by id, ensure `user_id` matches
    `user.id` (else 403/404), set `revoked_at = utcnow()`, save.
    """
    raise NotImplementedError(
        "Person 1: implement revoke_session (lookup by id, ensure ownership, set revoked_at)"
    )
