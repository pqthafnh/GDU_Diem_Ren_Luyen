Project scope
Đây là repository của hệ thống GDU Event & Training.

Frontend Next.js đã tồn tại và nằm ngoài phạm vi backend.

Khi làm backend:

Chỉ tạo hoặc chỉnh sửa trong backend/.
Không sửa frontend nếu không có yêu cầu trực tiếp.
Đọc BACKEND_BUILD_PROMPT.md.
Đọc BACKEND_API_SPECIFICATION.md.
Đọc backend/docs/implementation-status.md nếu tồn tại.
Source of truth
Thứ tự ưu tiên:

Yêu cầu trực tiếp mới nhất của người dùng.
BACKEND_BUILD_PROMPT.md.
BACKEND_API_SPECIFICATION.md.
Các ADR trong backend/docs/decisions/.
Code hiện tại.
Nếu tài liệu mâu thuẫn:

Không hỏi lại nếu tài liệu đã cung cấp nguyên tắc xử lý.
Chọn phương án an toàn và nhất quán.
Ghi quyết định vào backend/docs/decisions/.
Viết test xác nhận quyết định.
Backend stack
Backend bắt buộc sử dụng:

Python 3.13, hoặc Python 3.12 nếu dependency chưa tương thích.
FastAPI.
Pydantic v2.
PostgreSQL.
psycopg 3.
psycopg_pool.AsyncConnectionPool.
SQL trực tiếp, không dùng ORM.
uv làm package manager.
Ruff.
mypy.
pytest.
Docker và Docker Compose.
Không sử dụng:

Node.js cho backend.
Django hoặc Flask.
SQLAlchemy ORM.
SQLModel.
SQLite thay PostgreSQL trong integration test.
Microservices.
Architecture
Sử dụng modular monolith.

backend/database/ quản lý migrations, seeds và schema.
backend/app/database/ quản lý connection pool và transaction.
backend/app/modules/ quản lý nghiệp vụ.
Module không được tự tạo hoặc thay đổi bảng khi application chạy.
Repository chứa SQL.
Service chứa business rules và transaction.
Router chỉ xử lý HTTP adapter.
Tất cả module sử dụng một PostgreSQL connection pool chung.
Code quality
Full type hints.
Không dùng Any tùy tiện.
Không để TODO, FIXME hoặc placeholder.
Không dùng pseudocode trong production code.
Không tạo endpoint mock trong bản cuối.
Không dùng SQL string interpolation với dữ liệu người dùng.
Không đặt business logic trong router.
Không tạo file hoặc abstraction không mang lại giá trị.
Không tạo function hoặc file quá lớn nếu có thể chia theo trách nhiệm.
Documentation
Viết docstring chi tiết cho:

public functions;
service methods;
repository methods;
transaction workflows;
security utilities;
jobs;
functions có side effects;
functions có business rules.
Docstring phải mô tả khi phù hợp:

mục đích;
input;
output;
exceptions;
side effects;
transaction;
lock;
idempotency.
Không comment những dòng code hiển nhiên.

Database rules
Migrations là nguồn duy nhất thay đổi schema.
Không sửa migration đã áp dụng.
Tạo migration mới cho mỗi thay đổi.
Dùng parameterized SQL.
Dùng transactions cho workflow nhiều bước.
Dùng SELECT ... FOR UPDATE hoặc advisory lock khi có concurrency.
Dùng unique constraints và idempotency keys để chống dữ liệu trùng.
Không giả lập PostgreSQL bằng SQLite trong integration tests.
Verification
Trước khi báo hoàn thành, chạy khi môi trường cho phép:

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