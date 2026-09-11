"""Authentication and Authorization module using cryptographically verified Supabase JWT."""

import logging
import jwt
from fastapi import Header, HTTPException, status
from typing import Optional, Dict, Any
from backend.database.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

DEV_TOKEN = "development-token"
DEV_USER_ID = "dev-user-00000000-0000-0000-0000-000000000000"


def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Validate Supabase JWT Bearer token with cryptographic signature verification.
    
    In development mode (APP_ENV=development), also accepts a simple development token
    for easier local testing without requiring a full JWT setup.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Authorization header format. Expected 'Bearer <token>'",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = parts[1]

    # In development mode, accept the simple development token
    if settings.APP_ENV == "development" and token == DEV_TOKEN:
        logger.debug("Accepted development token for authentication")
        return {
            "user_id": DEV_USER_ID,
            "email": "dev@local",
            "role": "authenticated",
        }

    jwt_secret = getattr(settings, "SUPABASE_JWT_SECRET", None) or settings.SUPABASE_KEY or "fallback-secret"

    try:
        # Enforce cryptographic signature verification
        payload = jwt.decode(
            token,
            jwt_secret,
            algorithms=["HS256", "RS256"],
            options={"verify_signature": True},
        )

        user_id = payload.get("sub") or payload.get("id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload: missing user subject (sub)",
            )
        return {
            "user_id": user_id,
            "email": payload.get("email"),
            "role": payload.get("role", "authenticated"),
        }
    except jwt.PyJWTError as exc:
        logger.warning(f"JWT cryptographic signature verification failed: {exc}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(exc)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
