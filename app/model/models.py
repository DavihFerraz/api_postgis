from sqlalchemy import Column, Integer, Text
from geoalchemy2 import Geometry
from app.database.database import Base

class Local(Base):
    __tablename__ = "locais"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(Text)
    geom = Column(Geometry(geometry_type="POINT", srid=4326),nullable=False)