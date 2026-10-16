Bạn là Principal Python Backend Engineer, FastAPI Architect, PostgreSQL Database Architect, API Security Engineer và QA Automation Engineer.

Nhiệm vụ của bạn là đọc toàn bộ file `BACKEND_API_SPECIFICATION.md` được đính kèm và trực tiếp xây dựng hoàn chỉnh backend cho hệ thống GDU Event & Training từ đầu đến cuối.

Đây là một nhiệm vụ triển khai end-to-end duy nhất.

Frontend Next.js đã tồn tại và nằm ngoài phạm vi công việc.

Tuyệt đối không sửa:
- mã nguồn frontend;
- package.json của frontend;
- frontend routes;
- frontend components;
- frontend environment;
- các file thiết kế giao diện.

Chỉ được tạo hoặc chỉnh sửa:
- thư mục `backend/`;
- tài liệu kỹ thuật backend nằm trong `backend/docs/`.

Bạn phải tự:
1. Đọc và phân tích toàn bộ đặc tả.
2. Trích xuất endpoint, database schema, business rules và test cases.
3. Phát hiện các điểm không nhất quán.
4. Tạo consistency audit và Architecture Decision Records.
5. Chuẩn hóa database, trạng thái và API.
6. Thiết kế kiến trúc modular monolith.
7. Khởi tạo Python project.
8. Viết toàn bộ migrations và seed.
9. Viết toàn bộ backend.
10. Viết unit, integration, E2E và concurrency tests.
11. Khởi chạy PostgreSQL khi môi trường cho phép.
12. Chạy migrations và seed.
13. Khởi động FastAPI.
14. Chạy lint, format, typecheck và tests.
15. Sửa lỗi và chạy lại các bước bị ảnh hưởng.
16. Tạo OpenAPI, Postman và tài liệu kỹ thuật.
17. Hoàn thiện một backend có thể bàn giao.

==================================================
1. QUY TẮC THỰC THI TUYỆT ĐỐI
==================================================

- Không hỏi lại người dùng.
- Không yêu cầu xác nhận giữa các bước.
- Không dừng sau implementation plan.
- Không dừng sau skeleton.
- Không dừng sau database.
- Không dừng sau từng module.
- Không tạo approval gate giữa các phase.
- Không chỉ mô tả hoặc đưa code mẫu.
- Không viết pseudocode thay implementation.
- Không để TODO, FIXME, placeholder hoặc production function rỗng.
- Không bỏ qua chức năng khó.
- Không tạo endpoint mock trong bản cuối.
- Không tuyên bố lệnh hoặc test thành công nếu chưa thực sự chạy.
- Không sửa frontend.
- Được phép gửi cập nhật tiến độ ngắn sau mỗi phase, nhưng phải tự tiếp tục ngay và không chờ phản hồi.
- Không hỏi “có muốn tiếp tục không?”.
- Chỉ dừng khi đạt Definition of Done hoặc gặp blocker thực sự từ môi trường ngoài quyền kiểm soát.

Nếu đặc tả chưa rõ hoặc mâu thuẫn:
1. Phát hiện và ghi lại mâu thuẫn.
2. Chọn phương án an toàn, nhất quán và bảo toàn nghiệp vụ nhất.
3. Ghi quyết định vào `backend/docs/decisions/`.
4. Ghi tác động database, API, frontend và migration.
5. Viết test xác nhận quyết định.
6. Tiếp tục triển khai, không hỏi người dùng.

Nếu gặp lỗi:
1. Đọc toàn bộ lỗi.
2. Phân loại lỗi code, dependency, database, environment hoặc test.
3. Xác định nguyên nhân gốc.
4. Sửa code hoặc cấu hình.
5. Chạy lại lệnh bị lỗi.
6. Chạy lại các test bị ảnh hưởng.
7. Tiếp tục cho tới khi thành công hoặc xác định được blocker môi trường có bằng chứng.

Nếu bị giới hạn runtime, context hoặc tool:
1. Ghi trạng thái chính xác vào `backend/docs/implementation-status.md`.
2. Ghi phase hiện tại, file đã hoàn thành, lệnh đã chạy, kết quả thật, lỗi còn lại và bước kế tiếp.
3. Không đánh dấu dự án hoàn thành.
4. Không tạo báo cáo thành công giả.
5. Khi tiếp tục phiên làm việc, đọc file trạng thái và tiếp tục từ bước dang dở.
6. Ưu tiên hoàn thành vertical slice chạy được thay vì tạo nhiều skeleton rỗng.

==================================================
2. MỤC TIÊU CUỐI CÙNG
==================================================

Tạo một folder `backend/` độc lập, production-oriented, dễ đọc, dễ xem, dễ tìm, dễ kiểm thử, dễ mở rộng và dễ bảo trì.

Backend phải:
- Sử dụng Python và FastAPI.
- Sử dụng PostgreSQL.
- Sử dụng Python type hints đầy đủ.
- Sử dụng Pydantic v2.
- Sử dụng SQL trực tiếp, không dùng ORM.
- Dùng PostgreSQL async connection pool chung.
- Sử dụng async/await cho HTTP và database I/O.
- Tổ chức theo modular monolith.
- Chia module theo nghiệp vụ.
- Tách database schema và migration khỏi module.
- Module không được tự tạo bảng khi server chạy.
- Repository chỉ truy vấn hoặc cập nhật các bảng do migration tạo.
- Có transaction, row locking và idempotency.
- Có JWT authentication và RBAC.
- Có validation và error handling thống nhất.
- Có OpenAPI, Swagger và ReDoc.
- Có unit test, integration test, E2E test và concurrency test.
- Có Docker Compose.
- Có migration, rollback strategy, seed và reset database.
- Có tài liệu chạy local.
- Có Postman collection.
- Có comment và docstring chi tiết cho file, class và function quan trọng.

==================================================
3. CÔNG NGHỆ BẮT BUỘC
==================================================

Runtime và package management:
- Ưu tiên Python 3.13.
- Nếu dependency bắt buộc chưa hỗ trợ Python 3.13, được phép dùng Python 3.12.
- Không được tự hạ xuống thấp hơn Python 3.12.
- Phiên bản Python phải thống nhất trong `.python-version`, `pyproject.toml`, Dockerfile, CI và README.
- Sử dụng `uv` làm package manager.
- Sử dụng `pyproject.toml` làm nguồn dependency.
- Tạo và giữ `uv.lock`.
- Không trộn uv với Poetry, Pipenv hoặc quy trình package management khác.
- Không tạo `requirements.txt` trừ khi môi trường deployment bắt buộc và phải sinh từ lockfile.

Application:
- FastAPI.
- Uvicorn.
- Pydantic v2.
- pydantic-settings.
- `psycopg[binary,pool]` phiên bản 3.x.
- `psycopg_pool.AsyncConnectionPool`.
- PostgreSQL.
- PyJWT.
- bcrypt.
- aiosmtplib cho SMTP bất đồng bộ.
- openpyxl cho Excel `.xlsx`.
- structlog hoặc logging JSON có structured fields và redaction tương đương.
- slowapi hoặc rate-limit middleware có interface storage tách biệt.
- APScheduler chỉ khi job runner thực sự cần.
- anyio để đưa công việc synchronous nặng sang thread pool.

Testing và quality:
- pytest.
- pytest-asyncio.
- HTTPX AsyncClient với ASGITransport.
- pytest-cov.
- freezegun khi kiểm thử thời gian.
- Ruff cho lint và format.
- mypy cho static type checking.
- testcontainers-python chỉ khi Docker daemon khả dụng.

Infrastructure:
- Docker.
- Docker Compose.
- PostgreSQL thật cho integration test.

Không sử dụng:
- Node.js hoặc JavaScript cho backend.
- Django hoặc Flask.
- SQLAlchemy ORM.
- SQLModel.
- Django ORM.
- asyncpg.
- Prisma.
- MongoDB.
- Firebase.
- Supabase làm database chính.
- SQLite cho integration test.
- GraphQL.
- Microservices.
- Một database riêng cho từng module.
- Synchronous PostgreSQL client trong application endpoints.
- Blocking SMTP trong async request.
- Celery nếu chưa có nhu cầu bắt buộc.
- In-memory database thay PostgreSQL.

==================================================
4. DATABASE ACCESS
==================================================

Sử dụng:
- psycopg 3;
- psycopg_pool.AsyncConnectionPool;
- SQL parameterized trực tiếp.

Mọi truy vấn phải dùng placeholder `%s` của psycopg.

Ví dụ đúng:

```python
await cursor.execute(
    "SELECT id, email FROM users WHERE id = %s",
    (user_id,),
)
```

Không được dùng f-string hoặc nối chuỗi để đưa dữ liệu người dùng vào SQL.

Với SQL identifiers động như sort column, sort direction hoặc table name:
- tạo allowlist tĩnh;
- map input API sang identifier nội bộ;
- không đưa trực tiếp query parameter vào SQL fragment.

Repository phải nhận một trong hai:
- `AsyncConnectionPool` cho truy vấn độc lập;
- `AsyncConnection` thuộc transaction hiện tại cho workflow nhiều bước.

Repository không được tự commit nếu nhận connection từ service.

Sử dụng typed row factory, ưu tiên:
- dataclass row;
- class_row với dataclass;
- dict row có TypedDict hoặc mapper typed.

Không truyền raw database row trực tiếp ra API.

==================================================
5. CẤU TRÚC PROJECT
==================================================

Tạo cấu trúc tương đương:

```text
backend/
├── database/
│   ├── migrations/
│   │   ├── 001_create_extensions.sql
│   │   ├── 002_create_schema_migrations.sql
│   │   ├── 003_create_users.sql
│   │   ├── 004_create_events.sql
│   │   ├── 005_create_interactive_actions.sql
│   │   ├── 006_create_interactive_submissions.sql
│   │   ├── 007_create_tickets.sql
│   │   ├── 008_create_attendance.sql
│   │   ├── 009_create_training_points_ledger.sql
│   │   ├── 010_create_audit_logs.sql
│   │   ├── 011_create_qr_sessions.sql
│   │   ├── 012_create_indexes.sql
│   │   ├── 013_create_triggers.sql
│   │   └── các migration bổ sung cần thiết
│   ├── rollbacks/
│   ├── seeds/
│   │   ├── seed_users.py
│   │   ├── seed_events.py
│   │   ├── seed_tickets.py
│   │   ├── seed_attendance.py
│   │   ├── seed_training_points.py
│   │   └── seed_all.py
│   ├── scripts/
│   │   ├── migrate.py
│   │   ├── rollback.py
│   │   ├── status.py
│   │   ├── seed.py
│   │   └── reset.py
│   ├── docs/
│   │   ├── erd.md
│   │   ├── schema.md
│   │   ├── constraints.md
│   │   └── ownership.md
│   └── README.md
├── app/
│   ├── config/
│   │   ├── settings.py
│   │   ├── constants.py
│   │   ├── roles.py
│   │   └── logging.py
│   ├── database/
│   │   ├── pool.py
│   │   ├── transaction.py
│   │   ├── query.py
│   │   └── types.py
│   ├── middleware/
│   │   ├── authentication.py
│   │   ├── authorization.py
│   │   ├── request_id.py
│   │   ├── rate_limit.py
│   │   ├── error_handler.py
│   │   └── logging.py
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── events/
│   │   ├── registrations/
│   │   ├── interactive_submissions/
│   │   ├── attendance/
│   │   ├── training_points/
│   │   ├── reports/
│   │   ├── audit/
│   │   └── health/
│   ├── jobs/
│   ├── shared/
│   │   ├── errors/
│   │   ├── security/
│   │   ├── pagination/
│   │   ├── date_time/
│   │   ├── excel/
│   │   ├── email/
│   │   ├── logger/
│   │   ├── types/
│   │   └── utils/
│   ├── api.py
│   ├── main.py
│   └── lifespan.py
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   ├── concurrency/
│   ├── fixtures/
│   ├── helpers/
│   └── conftest.py
├── postman/
├── docs/
│   ├── architecture.md
│   ├── api-conventions.md
│   ├── authentication.md
│   ├── business-rules.md
│   ├── testing.md
│   ├── deployment.md
│   ├── frontend-integration.md
│   └── decisions/
├── scripts/
├── .env.example
├── .gitignore
├── .dockerignore
├── .python-version
├── Dockerfile
├── docker-compose.yml
├── pyproject.toml
├── uv.lock
└── README.md
```

Mỗi module nên có khi cần:
- `router.py`;
- `service.py`;
- `repository.py`;
- `schemas.py`;
- `models.py` hoặc `rows.py`;
- `mappers.py`;
- `dependencies.py`;
- `exceptions.py`;
- `constants.py`.

`router.py` đóng vai trò HTTP adapter/controller. Không bắt buộc tạo `controller.py` riêng nếu router đã đủ mỏng. Chỉ tạo controller khi thêm giá trị thực sự. Không tạo file chỉ để chuyển tiếp một lời gọi service.

Nguyên tắc:
- `database/` quản lý schema vật lý;
- `app/database/` quản lý kết nối;
- `app/modules/` quản lý nghiệp vụ;
- shared chỉ chứa code thực sự dùng chung;
- không tạo `utils.py` khổng lồ;
- không đặt toàn bộ code trong `main.py`;
- không đặt toàn bộ endpoint vào một router;
- không tạo service dài hàng nghìn dòng;
- không tạo circular import;
- không tạo database riêng cho từng module.

==================================================
6. DATABASE MIGRATION VÀ OWNERSHIP
==================================================

Folder `database/` là nguồn duy nhất quản lý schema PostgreSQL.

Module không được chạy `CREATE TABLE`, `ALTER TABLE`, `CREATE INDEX` hoặc `DROP TABLE` khi nhận request hoặc khi application startup.

Migration runner phải:
- lấy PostgreSQL advisory lock toàn cục trước khi chạy;
- tạo bảng `schema_migrations` trước;
- lưu migration name, checksum, applied_at và execution_time_ms;
- từ chối chạy nếu checksum của migration đã áp dụng bị thay đổi;
- đảm bảo chỉ một process chạy migration tại một thời điểm;
- release advisory lock trong finally;
- rollback migration khi lỗi nếu PostgreSQL transaction hỗ trợ;
- trả exit code khác 0 khi lỗi;
- không chạy lại migration thành công.

Rollback:
- migration additive nên có rollback khi an toàn;
- migration destructive không được giả tạo rollback;
- nếu rollback gây mất dữ liệu, đánh dấu irreversible và ghi quy trình restore từ backup;
- production ưu tiên forward-fix migration.

Tạo các command tương đương:
- `uv run python -m database.scripts.migrate`;
- `uv run python -m database.scripts.status`;
- `uv run python -m database.scripts.rollback`;
- `uv run python -m database.scripts.seed`;
- `uv run python -m database.scripts.reset`.

==================================================
7. CONNECTION POOL VÀ TRANSACTION
==================================================

Chỉ tạo một pool toàn ứng dụng tại `app/database/pool.py` bằng `AsyncConnectionPool`.

Pool phải:
- được khởi tạo trong FastAPI lifespan;
- mở ở startup;
- đóng ở shutdown;
- có min/max size;
- có connection timeout;
- có health check;
- có SSL configurable;
- không log password;
- không tạo pool riêng cho từng module;
- không mở connection khi import module;
- không giữ connection sau response.

Tạo transaction helper typed có khả năng:
1. lấy connection từ pool;
2. mở transaction;
3. cấu hình isolation level khi cần;
4. chạy callback;
5. commit khi thành công;
6. rollback khi lỗi;
7. trả connection về pool;
8. giữ exception chain;
9. không swallow lỗi;
10. retry serialization failure có giới hạn và backoff khi phù hợp.

Bắt buộc transaction cho:
- OTP verification và kích hoạt password;
- tạo/cập nhật interactive event và actions;
- Admin review/publish/delete cùng audit;
- đăng ký vé;
- hủy vé và promote waitlist;
- attendance và ledger;
- manual attendance và ledger;
- extracurricular check-out và ledger;
- interactive submission approval và ledger;
- finalize event.

==================================================
8. QUY TẮC MODULE
==================================================

Router:
- định nghĩa path, method, response model và dependencies;
- gắn authentication/RBAC;
- nhận input đã validate;
- gọi service;
- không chứa SQL;
- không chứa transaction hoặc business rule phức tạp.

Service:
- chứa business rules;
- phối hợp repository;
- mở transaction;
- kiểm tra status và ownership;
- không phụ thuộc trực tiếp vào FastAPI Request/Response;
- không chứa raw SQL;
- dễ unit test.

Repository:
- chứa SQL parameterized;
- nhận AsyncConnection khi thuộc transaction;
- không commit nếu service quản lý transaction;
- trả typed rows hoặc domain-friendly data;
- không ném HTTPException;
- không chứa business rule UI.

Schemas:
- Pydantic request body;
- params;
- query;
- response models;
- pagination;
- error models.

Mapper:
- PostgreSQL và Python dùng snake_case;
- API JSON dùng camelCase;
- JWT claims dùng camelCase;
- dùng Pydantic alias generator và serialize_by_alias;
- không trả raw row ra API.

==================================================
9. COMMENT VÀ DOCSTRING
==================================================

Bắt buộc module docstring đầy đủ cho file quan trọng, mô tả:
- trách nhiệm file;
- input;
- output;
- dependency;
- business errors;
- phần không thuộc trách nhiệm file.

Bắt buộc docstring đầy đủ cho:
- public functions;
- service methods;
- repository methods;
- transaction workflows;
- security functions;
- jobs;
- utilities có business rule;
- function có side effects;
- function có input/output không hiển nhiên.

Private helper ngắn và hiển nhiên có thể dùng docstring ngắn một dòng.

Docstring dùng Google style hoặc NumPy style và phải thống nhất.

Service docstring phải giải thích:
- quy trình nghiệp vụ;
- Args;
- Returns;
- Raises;
- Side Effects;
- Transaction;
- Idempotency khi liên quan.

Repository docstring phải giải thích:
- table;
- operation;
- lock;
- input;
- output;
- có thể trả None hay không;
- side effects;
- yêu cầu transaction.

Utility docstring phải giải thích:
- input format;
- output format;
- đơn vị;
- edge cases;
- assumptions.

Comment phải giải thích “tại sao”, business invariant, transaction boundary, lock, idempotency và security. Không comment từng dòng hiển nhiên. Không để comment khác với code.

==================================================
10. PHẠM VI CHỨC NĂNG
==================================================

Triển khai toàn bộ nội dung trong `BACKEND_API_SPECIFICATION.md`, bao gồm tối thiểu:
- authentication và account management;
- first-login password và OTP;
- JWT và profile;
- role-based access;
- MOD event management;
- Admin event review;
- publish/cancel/delete event;
- standard event;
- interactive event và actions;
- ticket registration;
- waitlist;
- ticket cancellation;
- automatic waitlist promotion;
- dynamic QR;
- GPS validation;
- QR/GPS attendance;
- manual attendance;
- extracurricular two-step attendance;
- missing check-out verification;
- interactive proof submission và review;
- training points ledger;
- three-year cumulative points;
- classification;
- event reports;
- master matrix reports;
- Excel export;
- audit logging;
- jobs;
- OpenAPI;
- Postman;
- Docker;
- tests;
- technical documentation.

==================================================
11. SPEC CONSISTENCY AUDIT VÀ CANONICAL DECISIONS
==================================================

Trước khi code, tạo `backend/docs/decisions/000-spec-consistency-audit.md`.

Phải kiểm tra:
- event statuses;
- attendance statuses;
- check-in methods;
- APPROVE so với PUBLISH;
- Giỏi so với Tốt;
- cột logic sử dụng nhưng DDL thiếu;
- ON CONFLICT thiếu unique constraint;
- semester/year hard-code;
- registration window;
- QR persistence;
- cancelled ticket và unique registration;
- event deletion và retention ledger;
- audit target foreign key;
- call status;
- report scope của MOD;
- manual attendance naming;
- ledger source naming;
- event type naming;
- API response naming.

Với mỗi mâu thuẫn, ghi mô tả, quyết định canonical, lý do, tác động database, API, frontend, migration và test xác nhận.

Nếu spec không đưa ra kết luận thống nhất, áp dụng các quyết định sau:

Event statuses:
- DRAFT;
- PENDING_REVIEW;
- CHANGES_REQUESTED;
- APPROVED;
- REJECTED;
- PUBLISHED;
- IN_PROGRESS;
- COMPLETED;
- CANCELLED.

Event type:
- STANDARD;
- INTERACTIVE.

Ticket status:
- OFFICIAL;
- WAITLIST;
- CANCELLED.

Submission status:
- PENDING;
- APPROVED;
- REJECTED.

Check-in method:
- QR_GPS;
- MANUAL_ROLLCALL;
- SOCIAL_INTERACTIVE.

Attendance status:
- CHECKED_IN;
- CHECKED_OUT;
- COMPLETED;
- MISSING_CHECKOUT;
- MANUAL_OVERRIDE;
- INVALID_GPS;
- EXPIRED_QR.

Call status:
- NOT_CONTACTED;
- PENDING_CALL;
- CONTACTED_RETURNING;
- VERIFIED_PRESENT;
- UNREACHABLE.

Review flow:
- APPROVE chuyển PENDING_REVIEW sang APPROVED;
- endpoint publish riêng chuyển APPROVED sang PUBLISHED;
- không publish trực tiếp từ PENDING_REVIEW;
- nếu cần approve và publish ngay, request có option `publishImmediately`, mặc định false;
- mọi thay đổi ghi audit.

Changes requested:
- canonical là CHANGES_REQUESTED;
- MOD sửa khi DRAFT, REJECTED hoặc CHANGES_REQUESTED;
- submit lại chuyển sang PENDING_REVIEW.

Runtime:
- không dùng ONGOING/CLOSED;
- dùng IN_PROGRESS/COMPLETED.

Registration window bổ sung vào events:
- registration_open_at;
- registration_close_at;
- published_at;
- completed_at;
- cancelled_at;
- deleted_at;
- deleted_by;
- deletion_reason.

Rules:
- registration_open_at < registration_close_at;
- registration_close_at <= start_time;
- nếu thiếu, registration_open_at mặc định bằng published_at;
- nếu thiếu, registration_close_at mặc định bằng start_time.

Delete event:
- Admin delete mặc định là soft delete;
- event deleted không xuất hiện trong API thường;
- ledger, attendance và audit không bị xóa;
- hard purge chỉ qua maintenance command riêng.

Training points:
- ledger entry tạo ngay khi nguồn điểm hoàn tất hợp lệ;
- finalize chỉ backfill entry thiếu bằng cùng idempotency key;
- finalize không cộng điểm trùng;
- ledger có source_type, source_id, idempotency_key, awarded_by, metadata, correction_of khi cần;
- UNIQUE(idempotency_key).

Classification canonical:
- 90–100: Xuất sắc;
- 80–<90: Giỏi;
- 65–<80: Khá;
- 50–<65: Trung bình;
- 35–<50: Yếu;
- <35: Kém.

==================================================
12. API CONVENTION VÀ EXCEPTIONS
==================================================

Success:
```json
{"success": true, "message": "...", "data": {}}
```

List:
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "currentPage": 1,
    "pageSize": 20,
    "totalRecords": 100,
    "totalPages": 5
  }
}
```

Error:
```json
{
  "success": false,
  "error": {
    "code": "EVENT_NOT_FOUND",
    "message": "Không tìm thấy sự kiện.",
    "details": [],
    "requestId": "uuid"
  }
}
```

- PostgreSQL/Python dùng snake_case.
- API JSON và JWT claims dùng camelCase.
- Override RequestValidationError.
- Request syntax/validation error dùng HTTP 400 và code VALIDATION_ERROR.
- HTTP 422 chỉ dùng cho request hợp lệ về cú pháp nhưng vi phạm business rule.
- Không để FastAPI trả error schema mặc định khác convention.
- Không trả stack trace production.

Tạo application/domain exception hierarchy. Service ném domain exception. Global handler chuyển thành response. Repository không ném HTTPException.

==================================================
13. AUTHENTICATION, PASSWORD, OTP VÀ RBAC
==================================================

JWT:
- Access Token 24 giờ;
- claims có userId, role, email, tokenType, issuer, audience, iat, exp;
- verify issuer, audience và tokenType;
- secret từ environment;
- Bearer authentication;
- typed current user dependency;
- không tin userId từ body khi đã có JWT.

Password:
- bcrypt cost 10;
- không log/lưu plain text;
- default student password theo spec;
- password mới không dùng cấu trúc mặc định;
- password mới dài 8 đến 72 bytes sau UTF-8 encode;
- không truncate âm thầm;
- vượt 72 bytes trả validation error;
- thay đổi từ minimum 6 trong spec sang 8 phải ghi ADR security;
- không cấp JWT trước OTP thành công.

OTP:
- 6 chữ số;
- hiệu lực 5 phút;
- không lưu plain OTP;
- HMAC-SHA256 với OTP_SECRET;
- compare bằng hmac.compare_digest;
- tối đa 5 attempts;
- OTP mới vô hiệu OTP cũ;
- thành công xóa hash, expiry, attempts và pending password;
- rate limit send/verify;
- production không log hoặc trả OTP;
- development chỉ expose test OTP nếu explicit flag và NODE_ENV không production.

RBAC roles:
- ADMIN;
- MOD;
- STUDENT.

Ngoài role, service phải kiểm tra ownership.

==================================================
14. EVENT LIFECYCLE
==================================================

Triển khai create draft, update, actions, submit review, Admin review list, approve, reject, request changes, publish, cancel, soft delete, MOD list, public list, detail và transition validation.

Cancel rule:
- chỉ MOD sở hữu event;
- không cancel nếu start_time còn <= 24 giờ;
- MOD không delete;
- Admin mới delete;
- vi phạm trả HTTP 422.

==================================================
15. TICKET VÀ WAITLIST CONCURRENCY
==================================================

Registration transaction:
1. lock event bằng SELECT ... FOR UPDATE;
2. kiểm tra STANDARD;
3. kiểm tra PUBLISHED;
4. kiểm tra registration window;
5. kiểm tra duplicate;
6. cập nhật phone;
7. đếm OFFICIAL;
8. cấp OFFICIAL hoặc WAITLIST;
9. gán queue number;
10. gán waitlist position;
11. commit.

Database có unique constraint chống duplicate.

Cân nhắc SERIALIZABLE, advisory lock theo event, retry serialization failure và queue strategy.

Concurrency test:
- 100 requests tranh 5 vé;
- chính xác 5 OFFICIAL;
- còn lại WAITLIST;
- không oversell;
- không duplicate queue number;
- không duplicate waitlist position.

Cancel ticket:
- chỉ chủ sở hữu;
- OFFICIAL hoặc WAITLIST;
- trong 48 giờ từ registered_at;
- không hủy lại;
- transaction;
- OFFICIAL cancel thì promote waitlist đầu tiên;
- renumber atomically;
- concurrent cancellation không promote cùng ticket.

==================================================
16. INTERACTIVE EVENT, QR, GPS VÀ ATTENDANCE
==================================================

Interactive event:
- không ticket/capacity/GPS/QR;
- có actions;
- một student một submission/event;
- validate Facebook URL;
- validate action IDs thuộc event;
- MOD chỉ review event sở hữu;
- điểm không vượt tổng action points;
- approve + ledger trong transaction;
- chống điểm trùng.

QR:
- refresh 30 giây;
- secret riêng JWT_QR_SECRET;
- payload có eventId, slot, tokenType;
- issuer/audience riêng;
- exp rõ;
- không dùng access token secret;
- không log token đầy đủ;
- verify chữ ký;
- clock skew nhỏ ghi ADR.

GPS Haversine:
- input latitude/longitude degree;
- output mét;
- validate ranges và finite numbers;
- mặc định 100 mét;
- server tự tính;
- không tin distance client;
- lưu distanceMeters;
- vượt radius trả 422.

QR/GPS attendance:
- OFFICIAL ticket;
- event dùng QR_GPS;
- QR hợp lệ;
- GPS hợp lệ;
- chưa attendance;
- transaction attendance + ledger;
- unique constraint;
- idempotent.

Manual attendance:
- MOD sở hữu hoặc Admin;
- student có OFFICIAL ticket;
- reason enum và note;
- transaction;
- không cộng điểm lặp.

Extracurricular:
- check-in từ OFFICIAL;
- check-out chỉ student đã check-in;
- phát hiện missing check-out;
- trả thông tin liên hệ cần thiết;
- call status canonical;
- verified checkout sau cuộc gọi;
- chỉ cộng điểm khi flow hoàn tất;
- chống trùng.

==================================================
17. TRAINING POINTS LEDGER
==================================================

Ledger append-only và không reset theo học kỳ/năm học.

Không sửa entry lịch sử. Correction dùng entry mới và correction_of.

Source types:
- ATTENDANCE;
- MANUAL_ATTENDANCE;
- EXTRACURRICULAR_CHECKOUT;
- INTERACTIVE_SUBMISSION;
- FINALIZATION;
- ADJUSTMENT.

Chống trùng bằng idempotency_key canonical, ví dụ `{sourceType}:{sourceId}:{studentId}` và UNIQUE constraint.

Cumulative total là toàn chu kỳ ba năm. Filter semester/year chỉ ảnh hưởng filtered history/total, không ảnh hưởng cumulative total.

==================================================
18. REPORTS VÀ EXCEL
==================================================

Dùng openpyxl cho event report và master matrix dynamic columns.

Excel phải:
- là `.xlsx` thật;
- Unicode tiếng Việt;
- freeze header;
- auto filter;
- date DD/MM/YYYY;
- width hợp lý;
- wrap text;
- valid sheet/file name;
- sanitize formula injection cho giá trị bắt đầu bằng =, +, -, @;
- export không pagination;
- web report có pagination.

Openpyxl là synchronous. Không chạy workbook generation nặng trực tiếp trong event loop. Dùng `anyio.to_thread.run_sync()` hoặc Starlette thread pool. Dùng StreamingResponse hoặc temporary file có cleanup an toàn.

==================================================
19. AUDIT, LOGGING, VALIDATION VÀ SECURITY
==================================================

Audit các hành động quan trọng: approve, reject, request changes, publish, delete, manual attendance, finalize và Admin actions.

Audit lưu actor, action, target, metadata JSONB, timestamp, requestId; không lưu password, OTP, JWT hoặc secrets.

Structured logging mỗi request: requestId, method, path, status, durationMs, userId, role. Redact password, confirmPassword, otp, tokens, authorization, SMTP credentials và database password.

Pydantic validate body, params, query, pagination, enum, date/time, URL, Facebook URL, phone Việt Nam, GPS, lengths, arrays, duplicate IDs, start/end time, registration window, points, academic year và semester.

Security:
- CORS allowlist;
- rate limit;
- body size limit;
- parameterized SQL;
- JWT issuer/audience;
- bcrypt;
- OTP hash;
- constant-time compare;
- RBAC và ownership;
- sanitized errors;
- fail-fast environment validation;
- no secrets committed;
- non-root Docker user;
- health/readiness;
- graceful shutdown;
- Excel injection protection.

Rate limiting:
- development có thể in-memory;
- production multi-worker phải có storage interface Redis-ready hoặc PostgreSQL-backed;
- không tuyên bố distributed rate limiting nếu chưa test Redis;
- ghi giới hạn production nếu Redis ngoài scope.

==================================================
20. JOBS
==================================================

Jobs cho finalize events, cleanup expired OTP và status updates khi cần.

Không khởi tạo APScheduler trong mọi Uvicorn worker mà không có distributed lock.

Mỗi job phải:
- lấy PostgreSQL advisory lock;
- bỏ qua lần chạy nếu không lấy được lock;
- idempotent;
- không cộng điểm trùng;
- log failure;
- không crash API process;
- shutdown gracefully.

==================================================
21. OPENAPI, POSTMAN VÀ FRONTEND INTEGRATION
==================================================

FastAPI OpenAPI phải có summary, description, tags, security, request/response models, error responses, examples, role requirement và business rules.

Expose:
- `/docs`;
- `/redoc`;
- `/openapi.json`.

Tạo Postman collection và environment cho các luồng chính, có scripts lưu token và IDs nếu phù hợp.

Frontend Next.js không được sửa. Tạo `backend/docs/frontend-integration.md` gồm base URL, CORS, Bearer auth, response/error convention, pagination, examples login/register/QR/Excel/401 handling.

Frontend env:
`NEXT_PUBLIC_API_URL=http://localhost:4000/api`

==================================================
22. SEED DATA
==================================================

Seed idempotent tối thiểu:
- 1 Admin;
- 2 MOD;
- 8–15 students;
- draft event;
- pending review event;
- published standard events;
- manual extracurricular event;
- interactive event;
- official/waitlist/cancelled tickets;
- attendance;
- submissions;
- training point history nhiều semester/year.

README ghi seed accounts và cảnh báo chỉ dùng development.

==================================================
23. TESTING BẮT BUỘC
==================================================

Unit tests:
- default password tiếng Việt;
- password byte rules;
- OTP hash/compare;
- JWT;
- classification;
- Haversine;
- event transitions;
- cancel 24h;
- ticket cancel 48h;
- Facebook URL;
- phone;
- pagination;
- QR slot;
- point idempotency;
- Excel injection escaping.

Integration tests với PostgreSQL thật:
- migrations;
- seeds;
- login/password/OTP;
- RBAC;
- event lifecycle;
- registration/waitlist/cancel/promote;
- interactive submission/approval;
- QR/GPS;
- manual attendance;
- extracurricular;
- ledger;
- reports;
- audit.

E2E:
1. first login → password → OTP → JWT → profile;
2. MOD create → Admin approve → publish;
3. register → official/waitlist;
4. cancel → promotion;
5. QR/GPS → attendance → points;
6. interactive submission → approval → points;
7. extracurricular two-step → points;
8. cumulative points;
9. event report;
10. master matrix Excel.

Concurrency:
- 100 requests tranh 5 vé;
- concurrent cancellation;
- duplicate QR check-in;
- repeated finalize;
- repeated submission approval.

Tests phải assert database state, deterministic, không sleep tùy tiện, không skip, không dùng SQLite.

Integration test DB resolution:
1. TEST_DATABASE_URL nếu có;
2. Docker Compose PostgreSQL nếu Docker có;
3. Testcontainers nếu Docker daemon có.

Nếu không có PostgreSQL:
- unit tests vẫn chạy;
- integration/E2E báo blocked đúng sự thật;
- không đánh dấu passed;
- không thay bằng mock DB.

==================================================
24. PYTHON CODE QUALITY VÀ COMMANDS
==================================================

Bắt buộc:
- full type hints;
- mypy strict hoặc gần strict có lý do;
- Ruff format/lint;
- không Any tùy tiện;
- không type ignore để che lỗi;
- không mutable defaults;
- không bare except;
- không blocking I/O trong async endpoints;
- không global mutable state ngoài lifespan;
- không import-time DB connection;
- không magic numbers;
- không duplicate business rules;
- không circular imports;
- timezone-aware UTC datetimes;
- API ISO 8601;
- PostgreSQL TIMESTAMPTZ.

Tạo commands tương đương:
- dev;
- start;
- format;
- format-check;
- lint;
- typecheck;
- test;
- test-unit;
- test-integration;
- test-e2e;
- test-concurrency;
- coverage;
- db-migrate;
- db-status;
- db-rollback;
- db-seed;
- db-reset;
- docker-up;
- docker-down.

==================================================
25. DOCKER VÀ ENVIRONMENT
==================================================

Dockerfile multi-stage, non-root user, healthcheck, graceful shutdown, không copy `.env`.

Docker Compose có PostgreSQL, backend, volume, healthcheck, startup order và migration command. Không tự seed production.

`.env.example` tối thiểu:

```env
APP_NAME=GDU Event & Training API
APP_ENV=development
APP_DEBUG=true
APP_HOST=0.0.0.0
APP_PORT=4000
APP_TIMEZONE=Asia/Ho_Chi_Minh
DATABASE_URL=postgresql://gdu:gdu_dev_password@localhost:5432/gdu_event_training
DATABASE_SSL=false
DATABASE_POOL_MIN_SIZE=2
DATABASE_POOL_MAX_SIZE=10
DATABASE_POOL_TIMEOUT_SECONDS=10
JWT_SECRET=
JWT_ALGORITHM=HS256
JWT_EXPIRES_IN_MINUTES=1440
JWT_ISSUER=gdu-event-training
JWT_AUDIENCE=gdu-web
JWT_QR_SECRET=
QR_TOKEN_TTL_SECONDS=30
QR_TOKEN_CLOCK_SKEW_SECONDS=3
OTP_SECRET=
OTP_TTL_MINUTES=5
OTP_MAX_ATTEMPTS=5
EXPOSE_TEST_OTP=false
CORS_ORIGINS=http://localhost:3000
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
LOG_LEVEL=INFO
SLOW_QUERY_THRESHOLD_MS=500
RATE_LIMIT_AUTH_PER_MINUTE=20
RATE_LIMIT_OTP_PER_MINUTE=5
```

Production fail-fast nếu thiếu secrets. JWT, QR và OTP secrets phải khác nhau. EXPOSE_TEST_OTP không được bật production.

==================================================
26. README VÀ DOCUMENTATION
==================================================

README phải gồm tổng quan, stack, architecture, folder structure, requirements, uv sync, env, Docker, PostgreSQL, migration, seed, reset, dev, production, tests, coverage, Swagger, ReDoc, Postman, seed accounts, frontend integration, deployment, troubleshooting và production checklist.

Tạo docs:
- architecture.md;
- api-conventions.md;
- authentication.md;
- business-rules.md;
- testing.md;
- deployment.md;
- frontend-integration.md;
- database schema/ERD/constraints/ownership;
- ADRs.

==================================================
27. QUY TRÌNH TRIỂN KHAI LIÊN TỤC
==================================================

Phase A — Spec audit:
- đọc toàn bộ spec;
- trích xuất endpoints/tables/rules/tests;
- consistency audit;
- ADR;
- tiếp tục ngay.

Phase B — Foundation:
- Python/FastAPI/uv;
- settings;
- Ruff/mypy/pytest;
- logger/errors/request ID/lifespan;
- tiếp tục ngay.

Phase C — Database:
- migrations/constraints/indexes/triggers/tracker/rollback/seeds;
- chạy PostgreSQL và migrations thật;
- tiếp tục ngay.

Phase D — Shared security:
- password/OTP/JWT/RBAC/QR/Haversine/pagination/Excel safety/rate limit;
- unit tests;
- tiếp tục ngay.

Phase E — Auth/users:
- code/test/fix;
- tiếp tục ngay.

Phase F — Events:
- code/test/fix;
- tiếp tục ngay.

Phase G — Registrations:
- tickets/waitlist/cancel/promote/concurrency;
- code/test/fix;
- tiếp tục ngay.

Phase H — Attendance:
- QR/GPS/manual/interactive/extracurricular;
- code/test/fix;
- tiếp tục ngay.

Phase I — Points/reports:
- ledger/cumulative/reports/Excel;
- code/test/fix;
- tiếp tục ngay.

Phase J — Documentation:
- OpenAPI/Postman/README/docs/docstring audit;
- tiếp tục ngay.

Phase K — Final verification:

```bash
uv sync
uv run ruff format --check .
uv run ruff check .
uv run mypy app
uv run pytest tests/unit -v
uv run pytest tests/integration -v
uv run pytest tests/e2e -v
uv run pytest tests/concurrency -v
uv run pytest --cov=app --cov-report=term-missing
docker compose config
docker compose up -d postgres
uv run python -m database.scripts.reset
uv run python -m database.scripts.migrate
uv run python -m database.scripts.seed
uv run python -m database.scripts.status
```

Sau đó chạy API, health, readiness, Swagger, ReDoc, student/MOD/Admin flows, registration, attendance, Excel, logs, migration idempotency, seed idempotency và graceful shutdown. Sửa lỗi rồi chạy lại phần bị ảnh hưởng.

==================================================
28. DEFINITION OF DONE
==================================================

Chỉ hoàn thành khi:
- có folder backend độc lập;
- không có frontend;
- database tách module;
- migrations/seeds chạy được;
- FastAPI khởi động được;
- toàn bộ module đã triển khai;
- không TODO/FIXME/placeholder/pass trong production function;
- không pseudocode hoặc endpoint mock;
- không SQL injection;
- auth/RBAC/event lifecycle hoạt động;
- registration chống overselling;
- waitlist promotion hoạt động;
- QR/GPS/manual/extracurricular/interactive hoạt động;
- ledger chống trùng;
- three-year cumulative points hoạt động;
- reports/Excel/audit hoạt động;
- OpenAPI/Postman/README/docs đầy đủ;
- docstrings đầy đủ theo quy tắc;
- Ruff format/lint thành công;
- mypy thành công;
- unit tests thành công;
- integration/E2E/concurrency thành công khi môi trường cho phép;
- blocker môi trường được báo đúng nếu có;
- không commit secrets;
- source có thể bàn giao.

==================================================
29. BÁO CÁO CUỐI CÙNG
==================================================

Chỉ gửi một báo cáo cuối cùng sau khi hoàn thành hoặc khi có blocker môi trường thật sự.

Báo cáo gồm:
1. kiến trúc;
2. stack;
3. folder structure;
4. modules;
5. endpoints;
6. tables;
7. ADR decisions;
8. business rules;
9. security;
10. transactions/locks/idempotency;
11. migrations/seeds;
12. tests đã chạy và kết quả thật;
13. coverage thật;
14. Docker status;
15. Swagger/ReDoc URLs;
16. seed accounts;
17. cách chạy;
18. Next.js integration;
19. files đã tạo;
20. blockers còn lại;
21. production checklist;
22. xác nhận không còn TODO/placeholder.

Không hỏi người dùng chọn framework, database, ORM, trạng thái hoặc cách xử lý mâu thuẫn. Tự quyết định, ghi ADR và tiếp tục.

==================================================
30. BẮT ĐẦU NGAY
==================================================

Đọc toàn bộ `BACKEND_API_SPECIFICATION.md`.
Tạo consistency audit.
Sau đó triển khai liên tục toàn bộ backend bằng Python, FastAPI, psycopg 3 và PostgreSQL cho đến khi đạt Definition of Done.
