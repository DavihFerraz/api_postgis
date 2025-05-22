from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database.database import SessionLocal
from app.model.models import Local
from app.schemas.schemas import LocalCreate, LocalOut


router = APIRouter()

async def get_db():
    async with SessionLocal() as session:
        yield session

@router.post("/locais", response_model=LocalOut)
async def create_local(local: LocalCreate, db: AsyncSession = Depends(get_db)):
    query = text(
        """
        INSERT INTO locais (nome, geom)
        VALUES (:nome, ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326))
        RETURNING id, nome
        """
    )
    result = await db.execute(query, {
        "nome": local.nome, 
        "latitude": local.latitude, 
        "longitude": local.longitude
        })
    
    await db.commit()
    row = result.fetchone()
    return {"id": row.id, "nome": row.nome}

@router.get("/locais/{nome}/distancias", response_model=list[LocalOut])
async def distancias(nome: str, db: AsyncSession = Depends(get_db)):
    query = text(
        """
        SELECT l2.id, l2.nome,
        ST_Distance(l1.geom::geography, l2.geom::geography) / 1000 AS distancia_km
        FROM locais l1
        JOIN locais l2 ON l1.id != l2.id
        WHERE l1.nome = :nome
        ORDER BY distancia_km 
        LIMIT 10
        """
    )

    result = await db.execute(query, {"nome": nome})
    rows = result.fetchall()
    return[
        dict(r._mapping) for r in rows
    ]

