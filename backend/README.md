# GDU Event & Training API

FastAPI modular monolith using PostgreSQL, psycopg 3, uv, and direct
parameterized SQL.

## Development

1. Copy `.env.example` to `.env` and provide development secrets.
2. Start PostgreSQL with `docker compose up -d postgres`.
3. Run migrations with `uv run python -m database.scripts.migrate`.
4. Seed development data with `uv run python -m database.scripts.seed`.
5. Start the API with `uv run uvicorn app.main:app --reload --port 4000`.

Swagger is at `http://localhost:4000/docs`; ReDoc is at `/redoc`.
See [frontend integration](./docs/frontend-integration.md) and
[API conventions](./docs/api-conventions.md) before integrating a client.

The development seed creates the following stable accounts (development only):

- `admin@gdu.edu.vn` / `Admin@123` (ADMIN)
- `mod@gdu.edu.vn` / `Mod@123` (MOD)
- `mod2@gdu.edu.vn` / `Mod2@123` (MOD)
- `2024001@gdu.edu.vn` / `GDU@AN1508` (STUDENT)
- `2024002` through `2024010` use `GDU@<FIRSTNAME>0101` (STUDENT)

Never use these credentials in a production environment.

## Verification

Run `uv run ruff check .`, `uv run mypy app`, and the suites under
`tests/unit`, `tests/integration`, `tests/e2e`, and `tests/concurrency`.
PostgreSQL suites share a database fixture and must run sequentially.
