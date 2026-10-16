# Testing

Unit tests run without PostgreSQL. Integration, E2E, and concurrency suites use
the real Docker PostgreSQL service and reset shared fixture data. Run them in
this order:

```text
uv run pytest tests/unit -v
uv run pytest tests/integration -v
uv run pytest tests/e2e -v
uv run pytest tests/concurrency -v
```

Do not run the PostgreSQL suites in parallel because their reset fixture is
intentionally shared.
