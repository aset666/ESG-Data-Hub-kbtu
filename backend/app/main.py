from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import auth, metrics, stats, audit, export

Base.metadata.create_all(bind=engine)

app = FastAPI(title="ESG Data Inventory System", version="1.0.0")

origins = [o.strip() for o in settings.cors_origins.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(metrics.router)
app.include_router(stats.router)
app.include_router(audit.router)
app.include_router(export.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
