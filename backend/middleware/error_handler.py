from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError, HTTPException
from fastapi.responses import JSONResponse


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(NotImplementedError)
    async def not_implemented(_: Request, exc: NotImplementedError):
        return JSONResponse(
            status_code=501,
            content={"success": False, "data": None, "error": f"NotImplementedError: {exc}"},
        )

    @app.exception_handler(HTTPException)
    async def http_exc(_: Request, exc: HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"success": False, "data": None, "error": str(exc.detail)},
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exc(_: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=422,
            content={"success": False, "data": None, "error": "validation_error", "details": exc.errors()},
        )

    @app.exception_handler(Exception)
    async def unhandled(_: Request, exc: Exception):
        return JSONResponse(
            status_code=500,
            content={"success": False, "data": None, "error": f"{type(exc).__name__}: {exc}"},
        )
