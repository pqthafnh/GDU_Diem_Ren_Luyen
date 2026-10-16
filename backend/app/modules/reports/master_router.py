"""HTTP adapters for master matrix reports."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse

from app.modules.reports.master_matrix import MasterMatrixService
from app.shared.auth import current_claims

router = APIRouter(tags=["reports"])


async def _matrix_data(
    request: Request,
    claims: dict[str, object],
    academic_year: str | None,
    semester: str | None,
    major: str | None,
    search: str | None,
    page: int,
    limit: int,
    max_limit: int = 100,
) -> dict[str, object]:
    if claims.get("role") not in {"MOD", "ADMIN"}:
        raise HTTPException(status_code=403, detail="MOD or ADMIN role required")
    if page < 1 or limit < 1 or limit > max_limit:
        raise HTTPException(status_code=400, detail="Invalid pagination")
    try:
        actor_id = UUID(str(claims["userId"]))
        async with request.app.state.database.connection() as connection:
            return await MasterMatrixService().build(
                connection, actor_id, academic_year, semester, major, search, page, limit
            )
    except (KeyError, ValueError) as error:
        raise HTTPException(status_code=403, detail=str(error)) from error


@router.get("/mod/reports/master-matrix")
async def master_matrix(
    request: Request,
    academic_year: str | None = None,
    semester: str | None = None,
    major: str | None = None,
    search: str | None = None,
    page: int = 1,
    limit: int = 20,
    claims: dict[str, object] = Depends(current_claims),
) -> dict[str, object]:
    """Return the paginated master matrix."""
    return await _matrix_data(request, claims, academic_year, semester, major, search, page, limit)


@router.get("/mod/reports/master-matrix/export")
async def export_master_matrix(
    request: Request,
    academic_year: str | None = None,
    semester: str | None = None,
    major: str | None = None,
    search: str | None = None,
    claims: dict[str, object] = Depends(current_claims),
) -> StreamingResponse:
    """Export the unpaginated master matrix as XLSX."""
    data = await _matrix_data(
        request, claims, academic_year, semester, major, search, 1, 100000, max_limit=100000
    )
    workbook = await MasterMatrixService().workbook(data)
    return StreamingResponse(
        workbook,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": 'attachment; filename="GDU_master_matrix.xlsx"'},
    )
