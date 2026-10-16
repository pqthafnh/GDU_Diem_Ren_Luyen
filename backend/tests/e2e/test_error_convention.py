"""End-to-end assertions for the public error response contract."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_unauthorized_error_uses_canonical_envelope(client: AsyncClient) -> None:
    """Protected endpoints return a request-correlated canonical error."""
    response = await client.get("/api/auth/me")
    assert response.status_code == 401
    body = response.json()
    assert body["success"] is False
    assert body["error"]["code"] == "UNAUTHORIZED"
    assert body["error"]["details"]
    assert body["error"]["requestId"] == response.headers["X-Request-ID"]


@pytest.mark.asyncio
async def test_validation_error_uses_http_400_and_details(client: AsyncClient) -> None:
    """Malformed login payloads use VALIDATION_ERROR rather than FastAPI's 422 shape."""
    response = await client.post("/api/auth/login", json={"email": "not-an-email"})
    assert response.status_code == 400
    body = response.json()
    assert body["success"] is False
    assert body["error"]["code"] == "VALIDATION_ERROR"
    assert body["error"]["details"]
