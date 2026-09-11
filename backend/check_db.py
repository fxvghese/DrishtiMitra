import os
os.environ['DATABASE_URL'] = 'sqlite:///./legal_metrology.db'
from backend.database.client import SessionLocal, engine, Base
from backend.models.entities import ReferenceProduct
from sqlalchemy import text

db = SessionLocal()
try:
    result = db.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='reference_products'")).fetchall()
    print('Tables:', result)
finally:
    db.close()