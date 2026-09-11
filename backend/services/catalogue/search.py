"""Reference product catalogue search service."""

import logging
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend.models.entities import ReferenceProduct

logger = logging.getLogger(__name__)


def search_reference_catalogue(db: Session, query_text: str, limit: int = 5) -> List[Dict[str, Any]]:
    """Search reference products by product name, brand, or category.

    Returns candidate matches with a score/confidence.
    """
    if not query_text or not query_text.strip():
        return []

    clean_query = query_text.strip()
    search_pattern = f"%{clean_query}%"

    results = db.query(ReferenceProduct).filter(
        or_(
            ReferenceProduct.product_name.ilike(search_pattern),
            ReferenceProduct.brand.ilike(search_pattern),
            ReferenceProduct.category.ilike(search_pattern),
        )
    ).limit(limit).all()

    matches = []
    for ref in results:
        score = 0.85 if clean_query.lower() in ref.product_name.lower() else 0.70
        matches.append({
            "reference_product_id": str(ref.id),
            "source": ref.source,
            "product_name": ref.product_name,
            "brand": ref.brand,
            "category": ref.category,
            "mrp": float(ref.mrp) if ref.mrp is not None else None,
            "quantity": ref.quantity,
            "image_url": ref.image_url,
            "score": score,
        })

    return matches
