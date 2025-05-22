from fastapi import FastAPI
from app.routes.routes import router
from app.database.database import Base, engine

app = FastAPI(title="API FastAPI com PostGIS")
@app.on_event("startup")
async def startup():
    # Cria as tabelas no banco de dados
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

app.include_router(router)