# Architecture

The backend is a modular monolith. `app/database` owns one PostgreSQL
`AsyncConnectionPool`; `database/migrations` is the only schema owner.
Modules contain HTTP routers, business services, schemas, and SQL-backed
workflows. Services own transaction boundaries and routers remain HTTP
adapters.

Ledger writes are append-only and use deterministic unique idempotency keys.
Event registration and waitlist promotion lock the event row. Event
finalization locks the event and records an audit entry.
