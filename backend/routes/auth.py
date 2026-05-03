from fastapi import APIRouter, Cookie, Depends, Request, Response, status

from config import settings
from controllers import auth_controller as ac
from middleware.auth_middleware import get_current_user
from models.user import User
from schemas.auth import (
    ChangePasswordIn,
    ForgotPasswordIn,
    LoginIn,
    RegisterIn,
    ResetPasswordIn,
    UpdateMeIn,
)


router = APIRouter()
REFRESH_COOKIE = "fernwood_refresh"


def _set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=REFRESH_COOKIE,
        value=token,
        max_age=settings.REFRESH_TTL_DAYS * 24 * 3600,
        httponly=True,
        samesite="lax",
        secure=settings.ENV != "dev",
        path="/api/auth",
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(key=REFRESH_COOKIE, path="/api/auth")


def _envelope(data) -> dict:
    return {"success": True, "data": data, "error": None}


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(body: RegisterIn, request: Request, response: Response):
    user = await ac.register_user(body.name, body.email, body.password)
    refresh = await ac.issue_refresh_token(user, request.headers.get("user-agent"))
    _set_refresh_cookie(response, refresh)
    access = ac.make_access_token(user)
    return _envelope({"access_token": access, "token_type": "bearer", "user": ac.me_out(user)})


@router.post("/login")
async def login(body: LoginIn, request: Request, response: Response):
    user = await ac.authenticate(body.email, body.password)
    refresh = await ac.issue_refresh_token(user, request.headers.get("user-agent"))
    _set_refresh_cookie(response, refresh)
    access = ac.make_access_token(user)
    return _envelope({"access_token": access, "token_type": "bearer", "user": ac.me_out(user)})


@router.post("/refresh")
async def refresh(
    request: Request,
    response: Response,
    fernwood_refresh: str | None = Cookie(default=None),
):
    if not fernwood_refresh:
        return {"success": False, "data": None, "error": "Missing refresh cookie"}, 401
    user, new_token = await ac.rotate_refresh_token(fernwood_refresh, request.headers.get("user-agent"))
    _set_refresh_cookie(response, new_token)
    access = ac.make_access_token(user)
    return _envelope({"access_token": access, "token_type": "bearer", "user": ac.me_out(user)})


@router.post("/logout")
async def logout(response: Response, fernwood_refresh: str | None = Cookie(default=None)):
    if fernwood_refresh:
        await ac.revoke_refresh_token(fernwood_refresh)
    _clear_refresh_cookie(response)
    return _envelope({"ok": True})


@router.get("/me")
async def me(user: User = Depends(get_current_user)):
    return _envelope(ac.me_out(user))


@router.patch("/me")
async def update_me(body: UpdateMeIn, user: User = Depends(get_current_user)):
    user = await ac.update_profile(user, body.name, body.email)
    return _envelope(ac.me_out(user))


@router.get("/sessions")
async def sessions(
    user: User = Depends(get_current_user),
    fernwood_refresh: str | None = Cookie(default=None),
):
    items = await ac.list_sessions(user, fernwood_refresh)
    return _envelope(items)


# ---- Person 1: stubs below — controllers raise NotImplementedError → 501 ----

@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordIn):
    data = await ac.request_password_reset(body.email)
    return _envelope(data)


@router.post("/reset-password")
async def reset_password(body: ResetPasswordIn):
    user = await ac.reset_password(body.token, body.new_password)
    return _envelope({"email": user.email})


@router.post("/change-password")
async def change_password(body: ChangePasswordIn, user: User = Depends(get_current_user)):
    await ac.change_password(user, body.old_password, body.new_password)
    return _envelope({"ok": True})


@router.delete("/sessions/{session_id}")
async def revoke_session(session_id: str, user: User = Depends(get_current_user)):
    await ac.revoke_session(user, session_id)
    return _envelope({"ok": True})
