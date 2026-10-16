"""Authentication business rules."""

from datetime import UTC, datetime
from uuid import UUID

from psycopg import AsyncConnection

from app.config.settings import Settings
from app.modules.auth.profile import ProfileResponse, SettingsUpdate
from app.modules.auth.schemas import (
    ChangePasswordRequest,
    LoginRequest,
    LoginResponse,
    UserResponse,
    VerifyOtpRequest,
)
from app.shared.security import (
    create_access_token,
    generate_otp,
    hash_otp,
    hash_password,
    verify_otp,
    verify_password,
)


class AuthService:
    """Authenticates users using a repository-independent SQL callback."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    async def login(self, connection: AsyncConnection, request: LoginRequest) -> LoginResponse:
        """Authenticate an account and issue JWT unless first-login change is required.

        Args:
            connection: PostgreSQL connection for the read transaction.
            request: Validated student ID or staff email credentials.
        Returns:
            A response with a token or a first-login password-change instruction.
        Raises:
            ValueError: When the account does not exist or password is invalid.
        """
        identifier = request.student_id or str(request.email)
        async with connection.cursor() as cursor:
            await cursor.execute(
                """SELECT id, student_id, full_name, email, role, theme_preference,
                          password_hash, is_password_changed
                   FROM users WHERE student_id = %s OR email = %s LIMIT 1""",
                (identifier, identifier),
            )
            row = await cursor.fetchone()
        if row is None or not verify_password(request.password, row[6]):
            raise ValueError("Invalid credentials")
        user_id = UUID(str(row[0]))
        user = UserResponse(
            id=str(user_id),
            studentId=row[1],
            fullName=row[2],
            email=row[3],
            role=row[4],
            themePreference=row[5],
        )
        if not row[7]:
            return LoginResponse(
                success=True,
                requirePasswordChange=True,
                message="Password change is required before issuing an access token.",
                user=user,
            )
        token = create_access_token(
            user_id,
            row[4],
            row[3],
            self.settings.jwt_secret,
            self.settings.jwt_issuer,
            self.settings.jwt_audience,
            self.settings.jwt_expires_in_minutes,
        )
        return LoginResponse(
            success=True,
            requirePasswordChange=False,
            message="Login successful",
            accessToken=token,
            expiresIn=self.settings.jwt_expires_in_minutes * 60,
            user=user,
        )

    async def change_first_password(
        self, connection: AsyncConnection, request: ChangePasswordRequest
    ) -> tuple[str, str | None]:
        """Store a pending password and send a five-minute OTP through the configured adapter."""
        if request.new_password != request.confirm_password:
            raise ValueError("Passwords do not match")
        if request.new_password.upper().startswith("GDU@"):
            raise ValueError("Password cannot use the default password pattern")
        otp = generate_otp()
        pending_hash = hash_password(request.new_password)
        otp_hash = hash_otp(otp, self.settings.otp_secret)
        async with connection.cursor() as cursor:
            await cursor.execute(
                """UPDATE users
                   SET pending_password_hash = %s, otp_hash = %s,
                       otp_expires_at = CURRENT_TIMESTAMP + (%s * INTERVAL '1 minute'),
                       otp_attempts = 0, updated_at = CURRENT_TIMESTAMP
                   WHERE student_id = %s AND role = 'STUDENT'
                   RETURNING email""",
                (pending_hash, otp_hash, self.settings.otp_ttl_minutes, request.student_id),
            )
            row = await cursor.fetchone()
        if row is None:
            raise ValueError("Student account not found")
        return str(row[0]), otp if self.settings.expose_test_otp else None

    async def verify_first_otp(
        self, connection: AsyncConnection, request: VerifyOtpRequest
    ) -> LoginResponse:
        """Atomically verify OTP, activate the pending password and issue JWT."""
        invalid_otp = False
        row: (
            tuple[
                UUID,
                str,
                str,
                str,
                str,
                str,
                str | None,
                str | None,
                datetime | None,
                int,
            ]
            | None
        ) = None
        async with connection.transaction():
            async with connection.cursor() as cursor:
                await cursor.execute(
                    """SELECT id, student_id, full_name, email, role, theme_preference,
                              pending_password_hash, otp_hash, otp_expires_at, otp_attempts
                       FROM users WHERE student_id = %s AND role = 'STUDENT' FOR UPDATE""",
                    (request.student_id,),
                )
                row = await cursor.fetchone()
                if row is None or row[6] is None or row[7] is None:
                    raise ValueError("OTP is invalid or expired")
                otp_hash = row[7]
                if row[9] >= self.settings.otp_max_attempts:
                    raise ValueError("OTP attempt limit exceeded")
                await cursor.execute(
                    "UPDATE users SET otp_attempts = otp_attempts + 1 WHERE id = %s", (row[0],)
                )
                expires_at = row[8]
                invalid_otp = (
                    expires_at is None
                    or expires_at < datetime.now(UTC)
                    or not verify_otp(request.otp, otp_hash, self.settings.otp_secret)
                )
                if not invalid_otp:
                    await cursor.execute(
                        """UPDATE users SET password_hash = pending_password_hash,
                                  pending_password_hash = NULL, otp_hash = NULL,
                                  otp_expires_at = NULL, otp_attempts = 0,
                                  is_password_changed = TRUE, updated_at = CURRENT_TIMESTAMP
                           WHERE id = %s""",
                        (row[0],),
                    )
        if invalid_otp:
            raise ValueError("OTP is invalid or expired")
        if row is None:
            raise ValueError("OTP is invalid or expired")
        user = UserResponse(
            id=str(row[0]),
            studentId=row[1],
            fullName=row[2],
            email=row[3],
            role=row[4],
            themePreference=row[5],
        )
        return LoginResponse(
            success=True,
            requirePasswordChange=False,
            message="Account activated successfully",
            accessToken=create_access_token(
                UUID(str(row[0])),
                row[4],
                row[3],
                self.settings.jwt_secret,
                self.settings.jwt_issuer,
                self.settings.jwt_audience,
                self.settings.jwt_expires_in_minutes,
            ),
            expiresIn=self.settings.jwt_expires_in_minutes * 60,
            user=user,
        )

    async def profile(self, connection: AsyncConnection, user_id: UUID) -> ProfileResponse:
        """Load profile and cumulative ledger points for an authenticated user."""
        async with connection.cursor() as cursor:
            await cursor.execute(
                """SELECT u.id, u.student_id, u.last_name, u.first_name, u.full_name, u.gender,
                          TO_CHAR(u.birth_date, 'DD/MM/YYYY'), u.class_name, u.major, u.email,
                          u.role, u.theme_preference, COALESCE(SUM(l.points_awarded), 0)
                   FROM users u LEFT JOIN training_points_ledger l ON l.student_id = u.id
                   WHERE u.id = %s
                   GROUP BY u.id""",
                (user_id,),
            )
            row = await cursor.fetchone()
        if row is None:
            raise ValueError("User not found")
        total = int(row[12])
        classification = (
            "Xuất sắc"
            if total >= 90
            else "Giỏi"
            if total >= 80
            else "Khá"
            if total >= 65
            else "Trung bình"
            if total >= 50
            else "Yếu"
        )
        return ProfileResponse(
            id=str(row[0]),
            studentId=row[1],
            lastName=row[2],
            firstName=row[3],
            fullName=row[4],
            gender=row[5],
            birthDate=row[6],
            className=row[7],
            major=row[8],
            email=row[9],
            role=row[10],
            themePreference=row[11],
            totalTrainingPoints=total,
            classification=classification,
        )

    async def update_settings(
        self, connection: AsyncConnection, user_id: UUID, settings: SettingsUpdate
    ) -> str:
        """Persist a validated theme preference for the authenticated user."""
        if settings.theme not in {"light", "dark", "system"}:
            raise ValueError("Invalid theme")
        async with connection.cursor() as cursor:
            await cursor.execute(
                """UPDATE users SET theme_preference = %s, updated_at = CURRENT_TIMESTAMP
                   WHERE id = %s RETURNING theme_preference""",
                (settings.theme, user_id),
            )
            row = await cursor.fetchone()
        if row is None:
            raise ValueError("User not found")
        return str(row[0])
