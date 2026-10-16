# GDU Event & Training Frontend

This directory contains the existing Next.js frontend. Run commands from this
directory:

```text
npm install
npm run dev
npm run build
npm run lint
```

The FastAPI backend remains in `../backend`.

Set `NEXT_PUBLIC_API_URL` to the backend `/api` base URL before running the
frontend against a deployed API. The client does not contain backend secrets.
