from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import init_db, close_db
from middleware.error_handler import register_error_handlers
from routes import auth as auth_routes
from routes import products as products_routes
from routes import cart as cart_routes
from routes import orders as orders_routes
from routes import admin as admin_routes


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    await close_db()


app = FastAPI(
    title="Fernwood API",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_error_handlers(app)


@app.get("/api/health")
async def health():
    return {"success": True, "data": {"status": "ok", "env": settings.ENV}}


app.include_router(auth_routes.router, prefix="/api/auth", tags=["auth"])
app.include_router(products_routes.router, prefix="/api/products", tags=["products"])
app.include_router(cart_routes.router, prefix="/api/cart", tags=["cart"])
app.include_router(orders_routes.router, prefix="/api/orders", tags=["orders"])
app.include_router(admin_routes.router, prefix="/api/admin", tags=["admin"])
