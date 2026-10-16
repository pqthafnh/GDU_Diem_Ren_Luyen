# API conventions

The API is served under `http://localhost:4000` during development. Interactive
documentation is available at `/docs`, `/redoc`, and `/openapi.json`.

Successful operations use:

```json
{"success": true, "message": "...", "data": {}}
```

Errors use one stable envelope:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [],
    "requestId": "uuid"
  }
}
```

Malformed request syntax returns `400`. Authentication and authorization use
`401` and `403`; not-found and conflicts use `404` and `409`; valid requests
that violate a business rule use `422`. Every response includes `X-Request-ID`.

Authentication uses `Authorization: Bearer <access-token>`. JSON request and
response fields use camelCase; SQL and migration fields use snake_case.
