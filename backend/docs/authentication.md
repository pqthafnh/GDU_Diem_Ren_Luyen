# Authentication

Login returns a JWT after the first-login password and OTP requirements are
satisfied. Protected requests use `Authorization: Bearer <token>`. JWTs are
validated for issuer, audience, expiry, and signature. Role checks distinguish
`STUDENT`, `MOD`, and `ADMIN`; ownership checks remain in the service
transaction.

Passwords are bcrypt hashes. OTP values are HMAC-derived and are never stored
or logged in plaintext. Development OTP exposure is disabled by default.
