from uuid import uuid4

from app.shared.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


def test_password_hash_and_verify() -> None:
    password_hash = hash_password("correct horse battery staple")
    assert verify_password("correct horse battery staple", password_hash)
    assert not verify_password("wrong", password_hash)


def test_access_token_round_trip() -> None:
    user_id = uuid4()
    secret = "test-access-token-secret-with-at-least-32-bytes"
    token = create_access_token(
        user_id, "STUDENT", "student@gdu.edu.vn", secret, "issuer", "aud", 10
    )
    claims = decode_access_token(token, secret, "issuer", "aud")
    assert claims["userId"] == str(user_id)
    assert claims["role"] == "STUDENT"
