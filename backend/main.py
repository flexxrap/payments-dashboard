from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import clients, dashboard, payments, projects

app = FastAPI(title="Payments Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(clients.router)
app.include_router(projects.router)
app.include_router(payments.router)
app.include_router(dashboard.router)


@app.get("/")
def health():
    return {"status": "ok"}
