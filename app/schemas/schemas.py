from pydantic import BaseModel

class LocalCreate(BaseModel):
    nome: str
    latitude: float
    longitude: float
    obs: str

class LocalOut(BaseModel):
    id: int
    nome: str
    distancia_km: float | None = None
    obs: str


    class Config:
        orm_mode = True