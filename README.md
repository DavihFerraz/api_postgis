# 🌍 FastAPI + PostGIS - API de Locais Geográficos

Este é um projeto simples de API REST com **FastAPI**, conectado a um banco de dados **PostgreSQL com PostGIS**, que permite cadastrar locais com coordenadas geográficas e calcular distâncias entre eles.

---

## 🚀 Funcionalidades

- 📌 Cadastrar locais com nome, latitude e longitude
- 🌐 Cálculo de distância usando geolocalização real (GPS / SRID 4326)

---

## ⚙️ Tecnologias

- Python 3.10+
- FastAPI
- PostgreSQL
- PostGIS
- SQLAlchemy + GeoAlchemy2
- asyncpg (conexão assíncrona com o banco)

---

## 🛠️ Instalação

1. **Clone o repositório:**
```bash
git clone https://github.com/seu-usuario/fastapi-postgis.git
cd fastapi-postgis
