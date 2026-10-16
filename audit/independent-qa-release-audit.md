# Independent QA & Release Audit

**Repository:** `pqthafnh/GDU_Diem_Ren_Luyen`  
**Audit mode:** Read-only independent audit after repository restructuring  
**Scope:** `frontend/`, `backend/`, shared `docs/`, migrations, seeds, tests, Postman and deployment configuration  
**Audit restriction:** No source code, test, migration, database data, requirement or commit was changed during this audit. The only created file is this report.

## Executive verdict

**NOT READY for end-to-end handoff or production deployment.**

The backend is testable and its current PostgreSQL test suites pass, but the repository does not meet the complete product/API handoff bar:

1. The Next.js application is still a mock/demo frontend and makes no runtime calls to the FastAPI backend.
2. Several endpoints explicitly required by `docs/BACKEND_API_SPECIFICATION.md` are absent from the generated API surface, or use a different path/method.
3. The development seed script creates only one student and one MOD, while the build prompt requires one ADMIN, two MOD accounts and 8–15 students.
4. Production rate limiting is explicitly not distributed; the accepted ADR correctly identifies this as a blocker before multi-worker production deployment.

The backend implementation is therefore **partially ready for backend-focused development/demo**, but not ready to claim that the complete frontend/backend system is integrated or production-ready.

## Commands executed and observed results

All PostgreSQL suites were run sequentially against the existing Docker PostgreSQL service.

| Area | Command / verification | Result |
|---|---|---|
| Backend unit | `uv run pytest tests/unit -v` | **20 passed** |
| Backend integration | `uv run pytest tests/integration -v` | **1 passed** |
| Backend E2E | `uv run pytest tests/e2e -v` | **10 passed** |
| Backend concurrency | `uv run pytest tests/concurrency -v` | **6 passed** |
| Backend coverage | `uv run pytest --cov=app --cov-report=term-missing` | **37 passed, 85% coverage** |
| Frontend lint | `npm run lint` from `frontend/` | **Passed, no ESLint warnings/errors** |
| Frontend build | `npm run build` from `frontend/` | **Passed; 21 routes generated** |
| Migration status | `uv run python -m database.scripts.status` from `backend/` | **Migrations 001–012 present with matching checksums** |
| Migration/seed repeat | `uv run python -m database.scripts.seed` twice | **Completed without error** |
| Compose | `docker compose --env-file .env config --quiet` | **Valid** |
| Docker runtime | `docker compose --env-file .env ps` | PostgreSQL healthy; backend service not running in the observed Compose state |
| Postman JSON | Parsed both files with Python `json` | **Both valid JSON** |
| Environment tracking | `git ls-files .env backend/.env frontend/.env.local` | **No tracked environment files** |
| Database invariants | Direct PostgreSQL queries | **No observed violations** |

The 85% coverage result is application coverage, not proof that every specification endpoint or frontend workflow is implemented.

## Findings

### F-001 — Critical: frontend has no runtime backend integration

**Evidence**

- Searches across `frontend/src` found no `fetch(`, `axios`, `NEXT_PUBLIC_API_URL`, or backend API request implementation.
- Pages and components import centralized mock data, including [`frontend/src/mocks/index.ts`](../frontend/src/mocks/index.ts), and use local state for login, registration, events, attendance and training points.
- The frontend build output contains only demo routes such as `/demo/student/events`, `/demo/MOD/events` and `/demo/admin/reviews`.
- [`backend/docs/frontend-integration.md`](../backend/docs/frontend-integration.md) documents how an integration should be performed, but documentation is not runtime integration.

**Impact**

The compiled frontend can display a demo but cannot authenticate against FastAPI, load PostgreSQL-backed events, register a ticket, submit proof, record attendance, or download backend reports. A successful Next.js build does not validate product integration.

**Severity:** CRITICAL  
**Confidence:** 10/10  
**Required remediation:** Add a typed API client and replace mock/local-state flows with authenticated requests to the implemented backend endpoints; then add frontend integration/E2E verification.

### F-002 — High: required API endpoints are missing or have incompatible paths

The specification explicitly requires:

- `GET /api/admin/reviews`
- `GET /api/mod/events`
- `GET /api/student/events/:eventId`
- `GET /api/mod/events/:eventId/projector/qr-token`

Generated OpenAPI paths were independently listed from `app.openapi()` and contain:

- `/api/admin/reviews/{event_id}/decision` but no `GET /api/admin/reviews`;
- `/api/mod/events` with the create route, but no GET operation for the MOD event list;
- `/api/student/events` but no `/api/student/events/{event_id}` detail route;
- `/api/events/{event_id}/qr-token`, not the specified MOD projector route.

The relevant implementation is visible in [`backend/app/modules/events/router.py`](../backend/app/modules/events/router.py) and [`backend/app/modules/attendance/router.py`](../backend/app/modules/attendance/router.py). The generated path list was obtained directly from the running FastAPI application, not inferred from documentation.

**Impact**

The admin review screen, MOD event management/status groups, student event detail screen and projector QR workflow cannot use the documented API contract as written. Existing tests passing does not cover these absent operations.

**Severity:** HIGH  
**Confidence:** 10/10  
**Required remediation:** Implement the missing operations and align the QR route with the specification, or record and test an approved contract change across OpenAPI, Postman, frontend integration documentation and clients.

### F-003 — High: development seed does not satisfy the required minimum dataset

[`backend/database/scripts/seed.py`](../backend/database/scripts/seed.py) inserts:

- one student (`2024001@gdu.edu.vn`);
- one MOD (`mod@gdu.edu.vn`);
- one ADMIN (`admin@gdu.edu.vn`).

The build prompt requires an idempotent minimum seed containing one ADMIN, two MOD accounts and 8–15 students. It also requires README documentation of seed accounts. The script does not create the second MOD or the required student range.

The current database contains more rows because prior tests and previous runs populated the shared development database; those observed counts cannot be used as proof that a clean seed produces the required dataset.

**Impact**

A clean development/demo environment cannot exercise the required role matrix or realistic student/report flows after running the documented seed command.

**Severity:** HIGH  
**Confidence:** 10/10  
**Required remediation:** Expand the idempotent seed to the documented minimum and verify it on a clean database or isolated development database without deleting production data.

### F-004 — High: production authentication rate limiting is not deployable as distributed protection

[`backend/app/main.py`](../backend/app/main.py) installs `InMemoryRateLimitStorage`. [`backend/docs/decisions/002-rate-limit-storage.md`](../backend/docs/decisions/002-rate-limit-storage.md) explicitly states that this is development/test-only and that shared Redis or PostgreSQL-backed storage is required before multiple workers.

**Impact**

With multiple backend workers or replicas, each process has an independent quota. Authentication and OTP protection can therefore be bypassed by distributing requests across workers.

**Severity:** HIGH for production deployment; LOW for single-process local development  
**Confidence:** 10/10  
**Required remediation:** Implement and integration-test shared rate-limit storage, then configure production deployment to reject the in-memory implementation.

## Positive verification

The following areas were independently re-run successfully:

- FastAPI backend imports and OpenAPI generation;
- migration checksum/status verification for migrations 001–012;
- unit, integration, E2E and concurrency test suites;
- PostgreSQL-backed registration/attendance/ledger concurrency coverage;
- frontend TypeScript/Next.js production build;
- frontend ESLint;
- Docker Compose configuration parsing;
- Postman collection and environment JSON parsing;
- `.env` files are ignored and not tracked;
- database checks found no official-ticket-over-capacity rows, duplicate queue numbers, duplicate waitlist positions, duplicate attendance rows, duplicate interactive submissions, duplicate ledger idempotency keys or orphan tickets.

These results support a backend-focused development quality assessment, but do not remove the findings above.

## Functionality matrix

| Capability | Evidence | Audit status |
|---|---|---|
| FastAPI/PostgreSQL foundation | Application source, migration status, readiness route | PASS |
| Authentication/OTP/JWT | 20 unit + E2E coverage | PASS for tested backend flows |
| Event lifecycle core | E2E/concurrency coverage | PASS for tested operations |
| Registration/waitlist | PostgreSQL integration/concurrency coverage | PASS for tested operations |
| QR/GPS/manual attendance | E2E/concurrency coverage | PASS for tested operations |
| Interactive submissions | E2E/concurrency coverage | PASS for tested operations |
| Ledger/finalization/correction | Tests and invariant queries | PASS for tested operations |
| Reports/XLSX | Existing E2E coverage and build artifacts | PASS for tested backend paths |
| Admin review list endpoint | Required by spec, absent in OpenAPI | FAIL |
| MOD event list/status groups | Required by spec, GET operation absent | FAIL |
| Student event detail endpoint | Required by spec, absent in OpenAPI | FAIL |
| Projector QR endpoint path | Spec path differs from implementation | FAIL/CONTRACT MISMATCH |
| Frontend/backend runtime integration | No API client or requests in frontend | FAIL |
| Minimum clean development seed | Script below required minimum | FAIL |
| Distributed production rate limit | ADR says not implemented | BLOCKED |
| Frontend lint/build | Independently passed | PASS as build quality only |

## Release recommendation

**Do not approve production release or full-system handoff.**

The repository may be used for backend-focused review and local demo of the currently covered API flows. Release approval should be reconsidered only after:

1. frontend API integration is implemented and tested against PostgreSQL-backed FastAPI;
2. all specification endpoints and route contracts are present and documented;
3. clean seed data meets the required role/student minimum;
4. shared production rate-limit storage is implemented and tested;
5. the complete verification matrix is rerun after those changes, including frontend integration/E2E and sequential PostgreSQL suites.

No source changes were made by this audit, and no claim is made that the current findings were fixed.

## Remediation follow-up (2026-10-16)

This follow-up was performed in a separate implementation session. The
canonical backend routes and expanded development seed have now been added and
verified. The frontend now uses a real API client for login/OTP, public event
listing/detail, registration, ticket listing, student dashboard/profile,
training points, MOD event listing and admin review listing.

The original audit finding F-001 is **partially remediated, not closed**:
several legacy MOD/admin detail/report/attendance screens still import the
legacy mock catalogue and require migration to live API data. Production
rate-limit storage also remains intentionally unchanged per ADR-002.
