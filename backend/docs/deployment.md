# Deployment

Build the non-root backend image with the repository Dockerfile and provide
PostgreSQL credentials and production secrets through the environment. Set
`POSTGRES_PASSWORD`, `DATABASE_URL`, `JWT_SECRET`, `JWT_QR_SECRET`, and
`OTP_SECRET` before running Compose. Run migrations as a
release step before starting workers. Do not use the development in-memory
rate-limit storage as distributed protection: production deployments need a
Redis-ready or PostgreSQL-backed `RateLimitStorage` implementation.

Expose `/health` for liveness and `/ready` for PostgreSQL readiness. Never
print database URLs, JWT secrets, OTP secrets, or access tokens in logs.
