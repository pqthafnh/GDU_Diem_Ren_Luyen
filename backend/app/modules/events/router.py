"""HTTP adapters for event creation, submission and admin review."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request

from app.modules.events.finalization import EventFinalizationService
from app.modules.events.schemas import EventCreate, EventListItem, EventResponse, ReviewDecision
from app.modules.events.service import EventService
from app.shared.auth import current_claims

router = APIRouter(tags=["events"])


@router.get("/student/events", response_model=list[EventListItem])
async def public_events(request: Request, status_filter: str = "PUBLISHED") -> list[EventListItem]:
    """List published non-deleted events for students."""
    if status_filter != "PUBLISHED":
        raise HTTPException(status_code=400, detail="Only PUBLISHED is public")
    async with request.app.state.database.connection() as connection:
        return await EventService().list_events(connection, status_filter)


@router.get("/student/events/{event_id}", response_model=EventResponse)
async def public_event_detail(
    request: Request, event_id: UUID, claims: dict[str, object] = Depends(current_claims)
) -> EventResponse:
    """Return a published event detail to an authenticated student."""
    if claims.get("role") != "STUDENT":
        raise HTTPException(status_code=403, detail="STUDENT role required")
    async with request.app.state.database.connection() as connection:
        return await EventService().get_event(connection, event_id)


@router.get("/mod/events", response_model=list[EventListItem])
async def owned_events(
    request: Request,
    status_group: str | None = None,
    claims: dict[str, object] = Depends(current_claims),
) -> list[EventListItem]:
    """List events owned by the authenticated MOD."""
    if claims.get("role") != "MOD":
        raise HTTPException(status_code=403, detail="MOD role required")
    async with request.app.state.database.connection() as connection:
        return await EventService().list_owned_events(
            connection, UUID(str(claims["userId"])), status_group
        )


@router.get("/admin/reviews", response_model=list[EventListItem])
async def pending_reviews(
    request: Request, claims: dict[str, object] = Depends(current_claims)
) -> list[EventListItem]:
    """List events pending administrative review."""
    if claims.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="ADMIN role required")
    async with request.app.state.database.connection() as connection:
        return await EventService().list_pending_reviews(connection)


@router.post("/mod/events", response_model=EventResponse, status_code=201)
async def create_event(
    request: Request, body: EventCreate, claims: dict[str, object] = Depends(current_claims)
) -> EventResponse:
    """Create a draft event owned by the authenticated MOD."""
    if claims.get("role") != "MOD":
        raise HTTPException(status_code=403, detail="MOD role required")
    try:
        user_id = UUID(str(claims["userId"]))
        async with request.app.state.database.connection() as connection:
            async with connection.transaction():
                return await EventService().create_draft(connection, body, user_id)
    except (KeyError, ValueError) as error:
        raise HTTPException(status_code=401, detail="Invalid user identity") from error


@router.put("/mod/events/{event_id}", response_model=EventResponse)
async def update_event(
    request: Request,
    event_id: UUID,
    body: EventCreate,
    claims: dict[str, object] = Depends(current_claims),
) -> EventResponse:
    """Update an owned editable event."""
    if claims.get("role") != "MOD":
        raise HTTPException(status_code=403, detail="MOD role required")
    try:
        async with request.app.state.database.connection() as connection:
            async with connection.transaction():
                return await EventService().update_draft(
                    connection, event_id, UUID(str(claims["userId"])), body
                )
    except (KeyError, ValueError) as error:
        raise HTTPException(status_code=422, detail=str(error)) from error


@router.post("/mod/events/{event_id}/submit")
async def submit_event(
    request: Request, event_id: UUID, claims: dict[str, object] = Depends(current_claims)
) -> dict[str, object]:
    """Submit an owned draft for admin review."""
    if claims.get("role") != "MOD":
        raise HTTPException(status_code=403, detail="MOD role required")
    try:
        user_id = UUID(str(claims["userId"]))
        async with request.app.state.database.connection() as connection:
            async with connection.transaction():
                new_status = await EventService().submit(connection, event_id, user_id)
        return {"success": True, "status": new_status}
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error


@router.post("/admin/reviews/{event_id}/decision")
async def review_event(
    request: Request,
    event_id: UUID,
    body: ReviewDecision,
    claims: dict[str, object] = Depends(current_claims),
) -> dict[str, object]:
    """Apply an admin review decision and audit it."""
    if claims.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="ADMIN role required")
    try:
        admin_id = UUID(str(claims["userId"]))
        async with request.app.state.database.connection() as connection:
            new_status = await EventService().review(connection, event_id, admin_id, body)
        return {"success": True, "status": new_status}
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error


@router.post("/admin/events/{event_id}/publish")
async def publish_event(
    request: Request, event_id: UUID, claims: dict[str, object] = Depends(current_claims)
) -> dict[str, object]:
    """Publish an approved event as an administrator."""
    if claims.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="ADMIN role required")
    try:
        async with request.app.state.database.connection() as connection:
            status_value = await EventService().publish(
                connection, event_id, UUID(str(claims["userId"]))
            )
        return {"success": True, "status": status_value}
    except (KeyError, ValueError) as error:
        raise HTTPException(status_code=422, detail=str(error)) from error


@router.post("/mod/events/{event_id}/cancel")
async def cancel_event(
    request: Request, event_id: UUID, claims: dict[str, object] = Depends(current_claims)
) -> dict[str, object]:
    """Cancel an owned event under the 24-hour rule."""
    if claims.get("role") != "MOD":
        raise HTTPException(status_code=403, detail="MOD role required")
    try:
        async with request.app.state.database.connection() as connection:
            status_value = await EventService().cancel(
                connection, event_id, UUID(str(claims["userId"]))
            )
        return {"success": True, "status": status_value}
    except (KeyError, ValueError) as error:
        raise HTTPException(status_code=422, detail=str(error)) from error


@router.delete("/admin/events/{event_id}")
async def delete_event(
    request: Request, event_id: UUID, claims: dict[str, object] = Depends(current_claims)
) -> dict[str, object]:
    """Soft-delete an event as an administrator."""
    if claims.get("role") != "ADMIN":
        raise HTTPException(status_code=403, detail="ADMIN role required")
    try:
        async with request.app.state.database.connection() as connection:
            await EventService().soft_delete(connection, event_id, UUID(str(claims["userId"])))
        return {"success": True}
    except (KeyError, ValueError) as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@router.post("/events/{event_id}/finalize")
async def finalize_event(
    request: Request,
    event_id: UUID,
    claims: dict[str, object] = Depends(current_claims),
) -> dict[str, object]:
    """Finalize an eligible event for its MOD owner or an ADMIN."""
    if claims.get("role") not in {"MOD", "ADMIN"}:
        raise HTTPException(status_code=403, detail="MOD or ADMIN role required")
    try:
        async with request.app.state.database.connection() as connection:
            status_value = await EventFinalizationService().finalize(
                connection, event_id, UUID(str(claims["userId"]))
            )
        return {"success": True, "status": status_value}
    except (KeyError, ValueError) as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
