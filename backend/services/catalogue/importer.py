"""Chunked CSV importers for Open Food Facts and Flipkart datasets with efficient batch upsert."""

import os
import json
import logging
import pandas as pd
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy import inspect
from backend.models.entities import ReferenceProduct

logger = logging.getLogger(__name__)

OFF_CSV_PATH = r"C:\Users\Felix\Downloads\DM-Resources\Catalogue\Final\product_catalogue.csv"
FLIPKART_CSV_PATH = r"C:\Users\Felix\Downloads\DM-Resources\Catalogue\Final\flipkart_catalogue.csv"

# Batch size for database operations
BATCH_SIZE = 1000

# Mapping from model attribute names to database column names for PostgreSQL upsert
_REFERENCE_PRODUCT_COLUMN_MAP = {
    "id": "id",
    "source": "source",
    "external_id": "external_id",
    "product_name": "product_name",
    "generic_name": "generic_name",
    "brand": "brand",
    "category": "category",
    "quantity": "quantity",
    "mrp": "mrp",
    "description": "description",
    "image_url": "image_url",
    "source_url": "source_url",
    "product_metadata": "metadata",  # attribute name -> column name
    "created_at": "created_at",
    "updated_at": "updated_at",
}


def _get_dialect_name(db: Session) -> str:
    """Get the database dialect name."""
    return db.bind.dialect.name


def _to_column_names(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Convert attribute-name keys to column-name keys for PostgreSQL upsert."""
    return [
        {_REFERENCE_PRODUCT_COLUMN_MAP.get(k, k): v for k, v in item.items()}
        for item in items
    ]


def _deduplicate_items(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Remove duplicate items by (source, external_id), keeping first occurrence."""
    seen = set()
    deduplicated = []
    for item in items:
        key = (item["source"], item["external_id"])
        if key not in seen:
            seen.add(key)
            deduplicated.append(item)
    return deduplicated


def _get_dialect_name(db: Session) -> str:
    """Get the database dialect name."""
    return db.bind.dialect.name


def _to_column_names(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Convert attribute-name keys to column-name keys for PostgreSQL upsert."""
    return [
        {_REFERENCE_PRODUCT_COLUMN_MAP.get(k, k): v for k, v in item.items()}
        for item in items
    ]


def _get_dialect_name(db: Session) -> str:
    """Get the database dialect name."""
    return db.bind.dialect.name


def _bulk_upsert(db: Session, items: List[Dict[str, Any]]) -> tuple[int, int]:
    """
    Efficiently upsert a batch of items using PostgreSQL ON CONFLICT or SQLite fallback.
    
    Returns:
        tuple: (inserted_count, updated_count)
    """
    if not items:
        return 0, 0
    
    # Deduplicate items by (source, external_id) to avoid PostgreSQL CardinalityViolation
    items = _deduplicate_items(items)
    
    dialect = _get_dialect_name(db)
    inserted = 0
    updated = 0
    
    if dialect == "postgresql":
        # Convert attribute names to column names for PostgreSQL
        pg_items = _to_column_names(items)
        
        # Use PostgreSQL's ON CONFLICT for efficient upsert
        # Use the actual Table object (ReferenceProduct.__table__) not the ORM class
        stmt = pg_insert(ReferenceProduct.__table__).values(pg_items)
        
        # Define the conflict target and update columns
        # Conflict on source + external_id (unique together per source)
        conflict_cols = ["source", "external_id"]
        # Use column names for update columns
        update_cols = {k: stmt.excluded[k] for k in pg_items[0].keys() if k not in conflict_cols and k != "id"}
        
        stmt = stmt.on_conflict_do_update(
            index_elements=conflict_cols,
            set_=update_cols
        )
        
        result = db.execute(stmt)
        # PostgreSQL returns rowcount for upsert
        inserted = result.rowcount
        # We can't easily distinguish insert vs update in PostgreSQL without RETURNING
        # For simplicity, we'll count as inserted (new) since most will be new
        # In practice, updated count is harder to get without RETURNING clause
    else:
        # SQLite fallback: use individual upsert (less efficient but works for tests)
        for item in items:
            existing = db.query(ReferenceProduct).filter_by(
                source=item["source"], 
                external_id=item["external_id"]
            ).first()
            if existing:
                for k, v in item.items():
                    setattr(existing, k, v)
                updated += 1
            else:
                ref = ReferenceProduct(**item)
                db.add(ref)
                inserted += 1
    
    return inserted, updated


def import_open_food_facts(db: Session, csv_path: str = OFF_CSV_PATH, chunk_size: int = 5000) -> Dict[str, int]:
    """Import Open Food Facts dataset in chunks safely with batch upsert."""
    metrics = {"total_rows": 0, "inserted": 0, "updated": 0, "skipped": 0, "errors": 0}

    if not os.path.exists(csv_path):
        logger.warning(f"Open Food Facts CSV not found at {csv_path}")
        return metrics

    try:
        for chunk in pd.read_csv(csv_path, chunksize=chunk_size, low_memory=False, on_bad_lines='skip'):
            metrics["total_rows"] += len(chunk)
            batch = []
            
            for _, row in chunk.iterrows():
                try:
                    code = str(row.get("code", "")).strip()
                    if not code or code.lower() == "nan":
                        metrics["skipped"] += 1
                        continue

                    product_name = str(row.get("product_name", "")).strip()
                    if not product_name or product_name.lower() == "nan":
                        product_name = "Unknown Product"

                    brand = str(row.get("brands", "")).strip()
                    if brand.lower() == "nan":
                        brand = None

                    category = str(row.get("categories", "")).strip()
                    if category.lower() == "nan":
                        category = None

                    quantity = str(row.get("quantity", "")).strip()
                    if quantity.lower() == "nan":
                        quantity = None

                    image_url = str(row.get("image_url", "")).strip()
                    if image_url.lower() == "nan":
                        image_url = None

                    source_url = str(row.get("url", "")).strip()
                    if source_url.lower() == "nan":
                        source_url = None

                    # Build metadata from additional CSV fields
                    meta_fields = {}
                    for field in ["packaging", "manufacturing_places", "labels", "countries", "countries_en", "image_small_url"]:
                        val = row.get(field)
                        if pd.notna(val) and str(val).strip():
                            meta_fields[field] = str(val).strip()
                    
                    metadata_json = json.dumps(meta_fields, ensure_ascii=False) if meta_fields else None

                    batch.append({
                        "source": "open_food_facts",
                        "external_id": code,
                        "product_name": product_name,
                        "generic_name": str(row.get("generic_name", "")).strip() if pd.notna(row.get("generic_name")) else None,
                        "brand": brand,
                        "category": category,
                        "quantity": quantity,
                        "mrp": None,
                        "description": None,
                        "image_url": image_url,
                        "source_url": source_url,
                        "metadata": metadata_json,  # Use 'metadata' column name directly
                    })
                except Exception:
                    metrics["errors"] += 1

            if batch:
                # Process in smaller batches for database
                for i in range(0, len(batch), BATCH_SIZE):
                    sub_batch = batch[i:i + BATCH_SIZE]
                    try:
                        ins, upd = _bulk_upsert(db, sub_batch)
                        metrics["inserted"] += ins
                        metrics["updated"] += upd
                        db.commit()
                    except Exception as batch_exc:
                        db.rollback()
                        logger.error(f"Batch insert error (OFF): {batch_exc}")
                        metrics["errors"] += len(sub_batch)

        logger.info(f"Open Food Facts import completed: {metrics}")
    except Exception as exc:
        logger.error(f"Failed to import Open Food Facts CSV: {exc}")
        metrics["errors"] += 1

    return metrics


def import_flipkart(db: Session, csv_path: str = FLIPKART_CSV_PATH, chunk_size: int = 2000) -> Dict[str, int]:
    """Import Flipkart dataset safely with batch upsert."""
    metrics = {"total_rows": 0, "inserted": 0, "updated": 0, "skipped": 0, "errors": 0}

    if not os.path.exists(csv_path):
        logger.warning(f"Flipkart CSV not found at {csv_path}")
        return metrics

    try:
        for chunk in pd.read_csv(csv_path, chunksize=chunk_size, low_memory=False, on_bad_lines='skip'):
            metrics["total_rows"] += len(chunk)
            batch = []
            
            for idx, row in chunk.iterrows():
                try:
                    title = str(row.get("title", "")).strip()
                    if not title or title.lower() == "nan":
                        metrics["skipped"] += 1
                        continue

                    raw_mrp = row.get("mrp")
                    mrp_val = None
                    if pd.notna(raw_mrp):
                        mrp_str = str(raw_mrp).replace("₹", "").replace("Rs.", "").replace(",", "").strip()
                        try:
                            mrp_val = float(mrp_str)
                        except ValueError:
                            mrp_val = None

                    category_parts = [str(row.get(c, "")).strip() for c in ["category_1", "category_2", "category_3"] if pd.notna(row.get(c)) and str(row.get(c)).strip().lower() != "nan"]
                    category = " > ".join(category_parts) if category_parts else None

                    image_links = str(row.get("image_links", "")).strip()
                    if image_links.lower() == "nan":
                        image_links = None

                    # Use a more stable external_id based on title hash
                    external_id = f"fk_{abs(hash(title)) % 10000000}"

                    # Build metadata from additional fields
                    meta_fields = {}
                    highlights = row.get("highlights")
                    if pd.notna(highlights) and str(highlights).strip():
                        meta_fields["highlights"] = str(highlights).strip()
                    
                    metadata_json = json.dumps(meta_fields, ensure_ascii=False) if meta_fields else None

                    batch.append({
                        "source": "flipkart",
                        "external_id": external_id,
                        "product_name": title,
                        "generic_name": None,
                        "brand": str(row.get("seller_name", "")).strip() if pd.notna(row.get("seller_name")) else None,
                        "category": category,
                        "quantity": None,
                        "mrp": mrp_val,
                        "description": str(row.get("description", "")).strip() if pd.notna(row.get("description")) else None,
                        "image_url": image_links,
                        "source_url": None,
                        "metadata": metadata_json,  # Use 'metadata' column name directly
                    })
                except Exception:
                    metrics["errors"] += 1

            if batch:
                # Process in smaller batches for database
                for i in range(0, len(batch), BATCH_SIZE):
                    sub_batch = batch[i:i + BATCH_SIZE]
                    try:
                        ins, upd = _bulk_upsert(db, sub_batch)
                        metrics["inserted"] += ins
                        metrics["updated"] += upd
                        db.commit()
                    except Exception as batch_exc:
                        db.rollback()
                        logger.error(f"Batch insert error (Flipkart): {batch_exc}")
                        metrics["errors"] += len(sub_batch)

        logger.info(f"Flipkart import completed: {metrics}")
    except Exception as exc:
        logger.error(f"Failed to import Flipkart CSV: {exc}")
        metrics["errors"] += 1

    return metrics