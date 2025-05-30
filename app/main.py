from fastapi import FastAPI
from app.routes.routes import router
from app.database.database import Base, engine
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="API FastAPI com PostGIS")

@app.on_event("startup")
async def startup():
    # Cria as tabelas no banco de dados
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ou coloque o domínio do seu front
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

