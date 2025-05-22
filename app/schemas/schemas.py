from pydantic import BaseModel

class LocalCreate(BaseModel):
    nome: str
    longitude: float
    latitude: float

class LocalOut(BaseModel):
    id: int
    nome: str
    distancia_km: float | None = None

    class Config:
        orm_mode = True