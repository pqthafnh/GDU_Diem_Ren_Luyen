# ADR-002: Rate-limit storage boundary

**Date:** 2026-10-15  
**Status:** Accepted

## Decision

Authentication rate limiting uses the in-memory storage implementation only for
single-process development and automated tests. Production deployments must
provide a shared Redis or PostgreSQL-backed implementation through the existing
`RateLimitStorage` interface before running multiple workers.

The backend does not claim distributed rate limiting until that shared storage
has been deployed and tested. The deployment checklist therefore treats the
in-memory implementation as a production blocker rather than silently
accepting inconsistent per-worker quotas.

## Consequences

- Development remains dependency-free and deterministic.
- Production operators must configure shared rate-limit storage before
  horizontally scaling the API.
- A future shared implementation can replace the application state object
  without changing the authentication middleware contract.
