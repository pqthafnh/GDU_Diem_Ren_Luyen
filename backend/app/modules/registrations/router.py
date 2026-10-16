"""HTTP adapters for student ticket registration."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request

from app.modules.registrations.schemas import (
    RegistrationRequest,
    TicketListResponse,
    TicketResponse,
)
from app.modules.registrations.service import RegistrationService
from app.shared.auth import current_claims

router = APIRouter(tags=["registrations"])


@router.get("/tickets", response_model=list[TicketListResponse])
async def list_tickets(
    request: Request,
    claims: dict[str, object] = Depends(current_claims),
) -> list[TicketListResponse]:
    """List all tickets belonging to the authenticated student."""
    if claims.get("role") != "STUDENT":
        raise HTTPException(status_code=403, detail="STUDENT role required")
    async with request.app.state.database.connection() as connection:
        return await RegistrationService().list_for_student(connection, UUID(str(claims["userId"])))


@router.post("/events/{event_id}/register", response_model=TicketResponse, status_code=201)
async def register(
    request: Request,
    event_id: UUID,
    body: RegistrationRequest,
    claims: dict[str, object] = Depends(current_claims),
) -> TicketResponse:
    """Register the authenticated student for an available event."""
    if claims.get("role") != "STUDENT":
        raise HTTPException(status_code=403, detail="STUDENT role required")
    try:
        async with request.app.state.database.connection() as connection:
            return await RegistrationService().register(
                connection, event_id, UUID(str(claims["userId"])), body
            )
    except RuntimeError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error
    except (KeyError, ValueError) as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@router.post("/tickets/{ticket_id}/cancel")
async def cancel(
    request: Request,
    ticket_id: UUID,
    claims: dict[str, object] = Depends(current_claims),
) -> dict[str, object]:
    """Cancel the authenticated student's ticket and promote waitlist."""
    if claims.get("role") != "STUDENT":
        raise HTTPException(status_code=403, detail="STUDENT role required")
    try:
        async with request.app.state.database.connection() as connection:
            await RegistrationService().cancel(connection, ticket_id, UUID(str(claims["userId"])))
        return {"success": True}
    except (KeyError, ValueError) as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
