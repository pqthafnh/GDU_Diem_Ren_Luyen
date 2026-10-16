# Backend implementation status

## 2026-10-16 administrator student directory

- Added migration 013 with `users.enrollment_year` and a student-year index.
- Added ADMIN-only student directory APIs:
  - `GET /api/admin/students`;
  - `POST /api/admin/students`;
  - `POST /api/admin/students/import` for transactional `.xlsx` batches;
  - `DELETE /api/admin/students/{studentId}`;
  - `DELETE /api/admin/students/year/{enrollmentYear}`.
- Added frontend Admin student management at `/demo/admin/students`, including
  manual insert, Excel import, search/filter by enrollment year, individual deletion,
  and whole-year deletion.
- Excel imports require the headers `studentId`, `fullName`, `email`, `initialPassword`,
  `gender`, `birthDate`, `className`, `major`, `phoneNumber`, and `enrollmentYear`.
- Import batches are all-or-nothing; duplicate MSSV/email conflicts return `409`.
- Removed development account quick-fill controls, seeded credential values, and test OTP
  controls from the frontend login screen. Staff and student credentials must now be entered
  from the real account source.
- Added ADMIN-only account management for ADMIN and MOD users:
  - `GET /api/admin/staff`;
  - `POST /api/admin/staff`;
  - `POST /api/admin/staff/import`;
  - `DELETE /api/admin/staff/{staffId}`.
- Added frontend route `/demo/admin/staff`; staff Excel files require
  `fullName`, `email`, `initialPassword`, `role`, `gender`, `birthDate`, and `phoneNumber`.
  Staff imports are transactional and self-deletion is rejected.
- Staff feature verification: Ruff format/check passed, mypy passed for 54 source files,
  backend unit tests passed (24), backend integration test passed (1), and frontend lint/build
  passed. OpenAPI exposes `/api/admin/staff`, `/api/admin/staff/import`, and
  `/api/admin/staff/{staff_id}`.

Updated: 2026-10-15

## Audit

- `backend/` previously contained only `docs/decisions/001-consistency-audit.md`.
- No `pyproject.toml`, `uv.lock`, application source, migrations, seeds, Docker files, or tests existed.
- `BACKEND_BUILD_PROMPT.md` was absent; the repository's equivalent source document is `PROMPT_BUILD_BACKEND_PYTHON.md`.
- Frontend files were not changed.

## Completed vertical slice

- Python 3.12/uv project manifest and `.env.example`.
- FastAPI application with health endpoint, CORS, lifecycle, and a single `AsyncConnectionPool` database owner.
- PostgreSQL initial schema migration for users, events, interactive actions, tickets, attendance, points ledger, and audit logs.
- Transactional migration runner with advisory lock and migration checksums.
- Password hashing and JWT access-token primitives.
- Login schema/service/router with first-login response semantics.
- Event validation schemas and role-guarded HTTP surface.
- Unit tests for security and event validation.
- Dockerfile and Docker Compose PostgreSQL/runtime definition.
- Development secret generator, idempotent seed/reset/status scripts.
- First-login password replacement, HMAC OTP activation, JWT profile and theme settings.
- Event update, public listing, publish, 24-hour cancellation and soft-delete lifecycle.
- Transactional ticket registration with event row lock, duplicate protection and waitlist fields.
- Student ticket listing and cancellation with atomic first-waitlist promotion and position renumbering.
- QR token issuance, server-side Haversine GPS validation, idempotent attendance and ledger award.
- Interactive event proof submission migration and student submission workflow with Facebook URL validation,
  action ownership validation, MOD verification and idempotent ledger award.
- Extracurricular MOD attendance operations: manual check-in, check-out with missing-student detection,
  call-status updates, verified follow-up checkout, and idempotent ledger awards.
- PostgreSQL integration test infrastructure with migration/reset fixtures and real database tests for
  waitlist promotion, atomic renumbering, and 100-request registration concurrency.
- Registration retries bounded PostgreSQL deadlock/serialization conflicts; the 100-request test
  passes repeatedly without overselling or duplicate waitlist positions.
- Append-only ledger metadata migration and student training-points endpoint with cumulative/filter
  totals, event history and canonical classification boundaries.
- Event attendance XLSX export with required Vietnamese columns, formula-injection sanitization,
  freeze/filter metadata and `anyio.to_thread.run_sync` workbook generation.
- `/ready` PostgreSQL readiness endpoint and `X-Request-ID` middleware.
- Interactive MOD submission listing with status filter, pagination and aggregate statistics.
- Append-only ledger correction endpoint with reason, correction reference, idempotency key and audit.
- Event finalization endpoint with event row lock, role/ownership checks, completed timestamp and audit.
- Event finalization rejects events whose end time has not elapsed.
- Master matrix report API and XLSX export with dynamic event columns, filters, pagination,
  classification, freeze panes and formula-injection sanitization.
- Report E2E coverage verifies event XLSX and Master Matrix JSON/XLSX exports, including
  freeze panes and autofilters.
- Dedicated concurrency test package for 100-request registration contention.
- Concurrency coverage now includes QR attendance, append-only corrections, event finalization,
  and interactive submission approval; each verifies PostgreSQL state and ledger idempotency.
- Manual and extracurricular attendance E2E coverage verifies official-ticket enforcement,
  ownership/RBAC, notes, missing checkout fields, call status, verified checkout, audit records,
  and deterministic ledger retries.
- Cancellation concurrency coverage verifies row-lock promotion, continuous waitlist positions,
  official capacity invariants, unique queue numbers, cancelled-ticket immutability, and repeated
  cancellation rejection.
- Dedicated E2E package with health/readiness/request-ID coverage.

## Verification

- `uv sync`: passed; generated `uv.lock`.
- `uv run ruff format --check .`: passed.
- `uv run ruff check .`: passed.
- `uv run mypy app`: passed.
- `uv run pytest tests/unit -v`: passed (4 tests).
- `docker compose config` with temporary environment secrets: passed.
- FastAPI import and OpenAPI smoke test: passed; `/api/auth/login` and `/api/mod/events` are present.
- PostgreSQL Docker service: healthy.
- Migrations 001-004: applied successfully; second migration run is idempotent.
- Seed runner: executed twice without duplicates.
- Authentication API smoke flow: change password, OTP verification, JWT, profile, settings and login passed.
- Event/registration API smoke flow: create, submit, review, publish, registration and duplicate conflict passed.
- QR/GPS attendance smoke flow: valid check-in and repeated idempotent check-in passed.
- Attendance operations slice: Ruff, mypy and unit tests passed after adding manual/check-out workflows.
- Docker Compose config: passed.
- Backend Docker image build: passed (`backend-backend:latest`).
- Database status: migrations 001-004 applied with recorded checksums.
- Database status: migrations 001-005 applied with recorded checksums; migration 005 is idempotent.
- PostgreSQL integration tests: 2 passed, including 100 concurrent registrations with exactly 5
  OFFICIAL and 95 WAITLIST tickets and no duplicate waitlist positions.
- Training-points classification boundary unit tests passed.
- XLSX report unit tests passed, including Unicode headers and formula-injection escaping.
- Final targeted quality pass: Ruff format/lint and mypy passed across 50 source/test files;
  unit tests 18 passed; PostgreSQL integration tests 2 passed after the bounded retry fix.
- Latest full suite: 21 tests passed after adding health/readiness E2E coverage; JWT warning fixed
  by using a sufficiently long test secret.
- Dedicated suite verification passed sequentially: unit 18 passed, integration 1 passed,
  E2E 1 passed, concurrency 1 passed. Coverage is 53% (`pytest --cov=app`).
- Migrations 001-008 are applied and migration status is clean.
- Attendance ledger writes now use explicit deterministic keys for QR attendance and extracurricular
  checkout (`ATTENDANCE` and `EXTRACURRICULAR_CHECKOUT`) with source metadata.
- Migration 009 removes the random ledger-key default and enforces uniqueness for explicit
  idempotency keys.
- Cross-cutting API hardening added canonical error envelopes, validation-error normalization,
  request IDs, JSON structured request logging with redaction, request body-size protection,
  and an in-memory development rate limiter behind a replaceable storage protocol.
- Added OpenAPI-facing API conventions, frontend integration documentation, and Postman
  collection/environment artifacts.
- Latest verification after the master-matrix slice: Ruff format/lint passed, mypy passed,
  unit tests 18 passed, and PostgreSQL integration tests 1 passed.
- Verification after cross-cutting changes: Ruff format/lint passed, mypy passed, unit tests
  18 passed, integration 1 passed, E2E 1 passed, and concurrency 1 passed sequentially.
- OpenAPI generation verified (`3.1.0`, 33 paths, auth login path present); Postman JSON files
  parse successfully. Coverage verification passed with 21 tests at 52% after adding the
  cross-cutting modules.
- Error convention E2E coverage now verifies canonical 401 and malformed-request 400 envelopes,
  including request correlation and validation details. Full sequential verification now passes
  with 23 tests and 54% coverage.
- Migrations 010-011 are applied and clean: negative correction points are supported within the
  bounded ledger range, and append-only corrections are no longer blocked by the old business-key
  uniqueness constraint.
- Targeted report verification passes after explicitly typing nullable PostgreSQL filter
  parameters and allowing the unpaginated Master Matrix export limit.
- Current sequential E2E verification: 9 passed.
- Current sequential concurrency verification: 5 passed.
- Ruff format, Ruff lint, and mypy pass after the report and concurrency changes.
- Full unit, integration, E2E, and concurrency coverage now passes sequentially: 33 tests.
- Full application coverage was 80% before the release-audit additions.
- Latest full application coverage is 85% after attendance, cancellation, and production-settings
  coverage.
- Final release verification passes sequentially: 20 unit, 1 integration, 10 E2E, and 6
  concurrency tests (37 total).
- Database status confirms migrations 001-012 with matching checksums; Docker Compose config
  validation passes.
- Migration 012 adds persisted attendance notes and is applied with a matching checksum.
- Docker production image verification passes with a non-root runtime image.
- Seed command was executed twice successfully; the stable development account inserts are
  idempotent. Contamination scan found no mailto, HTML-anchor, chat-entity, or escaped-operator
  artifacts in backend source, migrations, seeds, tests, or documentation.
- Rate-limit production boundary is documented in
  [ADR-002](./decisions/002-rate-limit-storage.md): in-memory storage remains development-only;
  shared Redis/PostgreSQL storage is required before multi-worker production deployment.
- Final source audit found no TODO/FIXME/placeholder/pseudocode, empty production functions,
  501 endpoints, mock endpoints, unsafe SQL interpolation, dynamic user-controlled ordering,
  import-time database connections, blocking database calls in async handlers, tracked `.env`
  files, or contamination markers. Compose now requires database credentials instead of using
  a plaintext PostgreSQL password.
- No TODO/FIXME/placeholder/pseudocode or status-501 endpoint found in backend source.

## Remaining implementation

The remaining production prerequisite is deployment of and integration testing with shared
Redis/PostgreSQL rate-limit storage before multi-worker production rollout. The PostgreSQL test
database is shared by fixtures, so database-backed suites must run sequentially.

## Remediation verification (2026-10-16)

- Added the canonical `GET /api/admin/reviews`, `GET /api/mod/events`,
  `GET /api/student/events/{event_id}`, and
  `GET /api/mod/events/{event_id}/projector/qr-token` operations.
- Kept the previous QR route as a backward-compatible, undocumented alias.
- Expanded the idempotent development seed to one ADMIN, two MOD accounts,
  ten students, published/pending demo events, official/waitlist tickets,
  attendance, an interactive submission, and a deterministic ledger entry.
- Verified repeated seed execution and role login for a student, second MOD,
  and ADMIN against the existing PostgreSQL instance.
- Added a frontend API client using `NEXT_PUBLIC_API_URL` without embedding
  backend secrets. Login/OTP, public event listing/detail, registration,
  ticket listing, MOD event listing, admin review listing, QR issuance and
  training-points requests now use the FastAPI API.
- Frontend lint and production build pass. Backend unit, integration, E2E and
  concurrency suites pass sequentially: 37 tests, 83% coverage after the new
  route/seed code.
- Remaining frontend screens still require migration from legacy demo-only
  views to live API data before full-system production handoff. In-memory
  rate limiting remains development/single-worker only per ADR-002.
