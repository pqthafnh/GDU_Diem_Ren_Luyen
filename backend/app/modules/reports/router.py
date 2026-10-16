"""HTTP adapters for report downloads."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse

from app.modules.reports.service import ReportService
from app.shared.auth import current_claims

router = APIRouter(tags=["reports"])


@router.get("/mod/events/{event_id}/report/export")
async def export_event_report(
    request: Request,
    event_id: UUID,
    claims: dict[str, object] = Depends(current_claims),
) -> StreamingResponse:
    """Export the owned event attendance report as a real XLSX workbook."""
    if claims.get("role") not in {"MOD", "ADMIN"}:
        raise HTTPException(status_code=403, detail="MOD or ADMIN role required")
    try:
        moderator_id = UUID(str(claims["userId"]))
        async with request.app.state.database.connection() as connection:
            workbook = await ReportService().event_workbook(connection, event_id, moderator_id)
    except (KeyError, ValueError) as error:
        raise HTTPException(status_code=403, detail=str(error)) from error
    return StreamingResponse(
        workbook,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="GDU_event_report_{event_id}.xlsx"'},
    )
