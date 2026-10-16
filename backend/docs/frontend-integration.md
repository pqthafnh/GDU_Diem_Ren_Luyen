# Frontend integration

Set `NEXT_PUBLIC_API_URL=http://localhost:4000/api` in the Next.js environment.
The backend allows the configured development origin (`http://localhost:3000`)
through CORS.

## Login

`POST /auth/login` accepts `{ "email": "...", "password": "..." }`. Store the
returned access token only in the frontend's existing secure session mechanism
and send it as `Authorization: Bearer <token>`.

## Registration and QR attendance

Student registration is `POST /student/events/{eventId}/register`. QR issuance
and attendance endpoints are documented in Swagger and require the bearer
token. The server validates QR expiry and GPS distance; clients must not send
or trust a calculated distance.

## Excel

Report endpoints return an XLSX stream. Treat the response as a file download,
not JSON.

## Errors and pagination

All JSON failures use the `success: false` envelope described in
[api-conventions.md](./api-conventions.md). Include `requestId` when reporting
an error to support server-side correlation. List responses provide a
`pagination` object; clients should not assume a fixed page size.
