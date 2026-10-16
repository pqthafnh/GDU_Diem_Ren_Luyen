"""End-to-end health and operational middleware checks."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_and_readiness_expose_request_id(client: AsyncClient) -> None:
    """Liveness, readiness and request correlation work through the ASGI stack."""
    response = await client.get("/health", headers={"X-Request-ID": "e2e-request"})
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert response.headers["X-Request-ID"] == "e2e-request"

    ready = await client.get("/ready")
    assert ready.status_code == 200
    assert ready.json() == {"status": "ready"}
