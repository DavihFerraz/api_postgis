from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database.database import SessionLocal
# Remova a importação não utilizada de Local se não for usada em outro lugar
# from app.model.models import Local 
from app.schemas.schemas import LocalCreate, LocalOut
from pydantic import BaseModel

router = APIRouter()

class LocalObsUpdate(BaseModel):
    obs:str

async def get_db():
    async with SessionLocal() as session:
        yield session

@router.post("/locais", response_model=LocalOut)
async def create_local(local: LocalCreate, db: AsyncSession = Depends(get_db)):
    query = text(
        """
        INSERT INTO locais (nome, geom, obs)
        VALUES (:nome, ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326), :obs)
        RETURNING 
            id, 
            nome, 
            obs,
            ST_Y(geom) AS latitude,  -- ADICIONADO: Retorna a latitude
            ST_X(geom) AS longitude -- ADICIONADO: Retorna a longitude
        """
    )
    try:
        result = await db.execute(query, {
            "nome": local.nome, 
            "latitude": local.latitude, 
            "longitude": local.longitude,
            "obs": local.obs
            })
        
        await db.commit()
        row = result.fetchone()
        
        if not row:
             # Embora improvável após um INSERT bem-sucedido, é bom manter uma verificação
             raise HTTPException(status_code=500, detail="Falha ao recuperar dados após inserção.")

        # MODIFICADO: Retorna o mapeamento completo da linha, 
        # que agora inclui latitude e longitude.
        # O FastAPI/Pydantic fará a conversão para LocalOut.
        return dict(row._mapping) 

    except Exception as e:
        await db.rollback() # Garante rollback em caso de erro antes ou durante o fetchone/return
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor ao criar local: {e}")

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

    if not rows:
        raise HTTPException(status_code=404, detail="Nenhum local encontrado ou nome inválido.")
    return[
        dict(r._mapping) for r in rows
    ]


@router.get("/locais", response_model=list[LocalOut])
async def listar_locais(db: AsyncSession = Depends(get_db)):
    query = text(
        """
        SELECT id, nome, obs,
            ST_Y(geom) AS latitude,
            ST_X(geom) AS longitude
        FROM locais
        """
    )
    result = await db.execute(query)
    rows = result.fetchall()
    return [
        dict(r._mapping) for r in rows
    ]


@router.put("/locais/{id}", response_model=LocalOut)
async def atualizar_local(id: int , local: LocalCreate, db:AsyncSession = Depends(get_db)):
    query = text(
        """
        UPDATE locais
        SET nome = :nome,
            geom = ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)
        WHERE id = :id
        RETURNING id, nome

        """
    )
    result = await db.execute(query, {
        "id": id,
        "nome": local.nome,
        "latitude": local.latitude,
        "longitude": local.longitude,
    })

    await db.commit()
    row = result.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Local not found")
    return {"id": row.id, "nome": row.nome}

@router.delete("/locais/{id}")
async def deletar_local(id: int, db: AsyncSession = Depends(get_db)):
    query = text(
        """
        DELETE FROM locais
        WHERE id = :id
        """
    )
    result = await db.execute(query, {"id": id})
    await db.commit()
    
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Local not found")
    
    return {"detail": "Local deleted successfully"}



@router.patch("/locais/{id}/obs", response_model=LocalOut)
async def atualizar_obs(id: int, dados: LocalObsUpdate, db: AsyncSession = Depends(get_db)):
    query = text(
        """
        UPDATE locais
        SET obs = :obs
        WHERE id = :id
        RETURNING 
            id, 
            nome, 
            obs,
            ST_Y(geom) AS latitude,
            ST_X(geom) AS longitude
    """
    )
    result = await db.execute(query, {"id": id, "obs": dados.obs})
    await db.commit()

    row = result.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Local não encontrado")
    
    return {
        "id": row.id,
        "nome": row.nome,
        "obs": row.obs,
        "latitude": row.latitude,
        "longitude": row.longitude,
        }