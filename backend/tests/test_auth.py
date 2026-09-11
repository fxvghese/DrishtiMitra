"""Tests for authentication and ownership authorization."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.models.entities import Inspection
from backend.database.config import get_settings


def test_scan_missing_auth_header(client: TestClient):
    """Test POST /api/v1/inspections/scan without Authorization header returns 401."""
    response = client.post(
        "/api/v1/inspections/scan",
        files={"image": ("label.jpg", b"fake", "image/jpeg")},
    )
    assert response.status_code == 401


def test_evaluate_unauthorized_owner(client: TestClient, db_session: Session, auth_headers: dict):
    """Test evaluating another user's inspection returns 403 Forbidden."""
    inspection = Inspection(
        image_url="inspections/test/other.jpg",
        user_id="user-owner-999",
    )
    db_session.add(inspection)
    db_session.commit()

    response = client.post(
        f"/api/v1/inspections/{inspection.id}/evaluate",
        headers=auth_headers,
    )
    assert response.status_code == 403


def test_development_token_accepted(client: TestClient):
    """Test that development-token is accepted when APP_ENV=development."""
    settings = get_settings()
    # Only run this test if we're actually in development mode
    if settings.APP_ENV != "development":
        pytest.skip("Test only runs in development mode")

    response = client.post(
        "/api/v1/inspections/scan",
        files={"image": ("label.jpg", b"fake", "image/jpeg")},
        headers={"Authorization": "Bearer development-token"},
    )
    # Should not be 401 (may be 400 for other reasons like invalid image, but not auth failure)
    assert response.status_code != 401, f"Expected non-401, got {response.status_code}: {response.text}"


def test_invalid_token_rejected(client: TestClient):
    """Test that invalid tokens are rejected even in development mode."""
    response = client.post(
        "/api/v1/inspections/scan",
        files={"image": ("label.jpg", b"fake", "image/jpeg")},
        headers={"Authorization": "Bearer invalid-random-token"},
    )
    assert response.status_code == 401
