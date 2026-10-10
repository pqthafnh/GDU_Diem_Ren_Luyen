# TÀI LIỆU HƯỚNG DẪN XÂY DỰNG BACKEND & TÍCH HỢP FRONTEND (GDU EVENT & TRAINING)

Tài liệu này cung cấp thiết kế toàn diện cho Backend, bao gồm mô hình cơ sở dữ liệu quan hệ (RDBMS), danh sách các API chi tiết (Input/Output), luồng nghiệp vụ tương tác với người dùng và hướng dẫn từng bước để kết nối Backend này với Frontend hiện tại.

---

## 1. MÔ HÌNH CƠ SỞ DỮ LIỆU QUAN HỆ (ERD - Relational Database Schema)

Hệ thống quản lý sự kiện và điểm rèn luyện yêu cầu một database ổn định, đảm bảo tính toàn vẹn dữ liệu. Khuyến nghị sử dụng **PostgreSQL** hoặc **MySQL**.

### Bảng `users` (Người dùng)
Lưu trữ thông tin của Sinh viên, MOD và Admin.
- `id` (UUID, PK): Mã định danh.
- `role` (Enum): `ADMIN`, `MOD`, `STUDENT`.
- `email` (String, Unique): Email đăng nhập (VD: email trường).
- `full_name` (String): Họ và tên.
- `student_id` (String, Nullable): Mã số sinh viên (chỉ dành cho STUDENT).
- `major` (String, Nullable): Chuyên ngành.
- `total_points` (Integer, Default 0): Tổng điểm rèn luyện tích lũy (chu kỳ 3 năm).

### Bảng `events` (Sự kiện)
Lưu trữ thông tin sự kiện do MOD tạo.
- `id` (UUID, PK): Mã sự kiện.
- `created_by` (UUID, FK -> users.id): MOD tạo sự kiện.
- `title` (String): Tên sự kiện.
- `description` (Text): Mô tả.
- `banner_url` (String): Hình ảnh banner.
- `status` (Enum): `DRAFT`, `PENDING_REVIEW`, `APPROVED`, `REJECTED`, `PUBLISHED`, `CANCELLED`.
- `start_time` (Timestamp): Thời gian bắt đầu.
- `end_time` (Timestamp): Thời gian kết thúc.
- `location` (String): Địa điểm (tên).
- `gps_lat`, `gps_lng` (Float): Tọa độ cấu hình để kiểm tra vị trí (100m).
- `capacity` (Integer): Số vé chính thức tối đa.
- `points_reward` (Integer): Số điểm rèn luyện cộng thêm khi tham gia.
- `feedback` (Text, Nullable): Lời phê của Admin khi từ chối/yêu cầu sửa.

### Bảng `tickets` (Đăng ký/Vé)
Lưu trữ trạng thái đăng ký của Sinh viên đối với sự kiện.
- `id` (UUID, PK): Mã vé.
- `event_id` (UUID, FK -> events.id): Mã sự kiện.
- `student_id` (UUID, FK -> users.id): Sinh viên đăng ký.
- `status` (Enum): `OFFICIAL` (Vé chính thức), `WAITLIST` (Chờ), `CANCELLED` (Đã hủy).
- `queue_number` (Integer): Số thứ tự đăng ký (dùng để xác định official hay waitlist).
- `seat_number` (String, Nullable): Số ghế (nếu có).
- `registered_at` (Timestamp): Thời gian đăng ký.

### Bảng `attendance` (Điểm danh)
Lưu trữ lịch sử check-in quét mã QR.
- `id` (UUID, PK): Mã lượt điểm danh.
- `event_id` (UUID, FK -> events.id).
- `student_id` (UUID, FK -> users.id).
- `check_in_time` (Timestamp): Thời gian quét.
- `scanned_lat`, `scanned_lng` (Float): Tọa độ lúc quét.
- `status` (Enum): `VALID`, `INVALID_LOCATION` (Sai tọa độ), `LATE` (Trễ giờ).

### Bảng `points_history` (Lịch sử cộng điểm)
Lưu trữ chi tiết các lần cộng điểm để không bị reset.
- `id` (UUID, PK).
- `student_id` (UUID, FK -> users.id).
- `event_id` (UUID, FK -> events.id).
- `points_added` (Integer): Điểm cộng.
- `reason` (String): Lý do cộng (VD: Tham gia sự kiện ABC).
- `created_at` (Timestamp): Thời gian cộng.

---

## 2. THIẾT KẾ CHI TIẾT API VÀ LUỒNG NGHIỆP VỤ

### 2.1. Nhóm API dành cho Sinh viên (STUDENT)

#### 1. Lấy danh sách sự kiện (Đã Public)
- **Hành động người dùng:** Mở trang "Lịch sự kiện" hoặc bấm nút Lọc/Tìm kiếm.
- **API:** `GET /api/events?status=PUBLISHED&search=...&type=...`
- **Input (Query):** `status`, `search` (từ khóa), `page`, `limit`.
- **Output (JSON):** 
  ```json
  {
    "data": [
      { "id": "...", "title": "Sự kiện A", "start_time": "...", "capacity": 100, "registered_count": 45, "points": 5 }
    ],
    "pagination": { "total": 1, "page": 1 }
  }
  ```
- **Nghiệp vụ Backend:** Lấy các sự kiện trạng thái PUBLISHED, join với bảng tickets để đếm số lượng người đã đăng ký.

#### 2. Đăng ký tham gia sự kiện
- **Hành động người dùng:** Xem chi tiết sự kiện và bấm nút "Đăng ký".
- **API:** `POST /api/events/:eventId/register`
- **Input (Body):** N/A (Chỉ cần Auth Token chứa `student_id`).
- **Output (JSON):**
  ```json
  {
    "success": true,
    "ticket": { "status": "OFFICIAL", "queue_number": 45 }
  }
  ```
- **Nghiệp vụ Backend:** 
  1. Kiểm tra sự kiện có đang mở đăng ký không.
  2. Đếm số vé OFFICIAL hiện có. Nếu nhỏ hơn `capacity` -> cấp vé `OFFICIAL`. Ngược lại -> cấp vé `WAITLIST`.
  3. Lưu vào bảng `tickets`. Trả về trạng thái cho Frontend hiển thị popup thành công.

#### 3. Hủy vé sự kiện
- **Hành động người dùng:** Bấm "Hủy vé" trong trang "Vé của tôi".
- **API:** `POST /api/tickets/:ticketId/cancel`
- **Nghiệp vụ Backend:**
  1. Kiểm tra thời gian hiện tại so với `registered_at`. Nếu > 48 giờ -> Báo lỗi không cho hủy.
  2. Đổi status thành `CANCELLED`.
  3. (Tự động) Tìm người có vé `WAITLIST` số thứ tự nhỏ nhất và đổi trạng thái họ lên `OFFICIAL`. Trả thông báo thành công.

#### 4. Điểm danh qua quét QR
- **Hành động người dùng:** Sinh viên giơ điện thoại quét mã QR động trên màn hình Projector, trình duyệt hỏi quyền Vị trí (GPS) và gửi lên server.
- **API:** `POST /api/attendance/check-in`
- **Input (Body):**
  ```json
  {
    "qr_token": "token_dong_30_giay_sinh_ra_tu_projector",
    "lat": 10.762622,
    "lng": 106.660172
  }
  ```
- **Output (JSON):** `{"success": true, "message": "Điểm danh thành công"}`
- **Nghiệp vụ Backend:**
  1. Giải mã `qr_token` xem có hợp lệ và còn hạn (trong 30s) không.
  2. Tính khoảng cách (Haversine formula) giữa tọa độ sinh viên gửi lên và `gps_lat/gps_lng` của sự kiện. Nếu > 100m -> Trả lỗi `INVALID_LOCATION`.
  3. Lưu vào `attendance`. Tạo ngay 1 record trong `points_history` và cộng dồn điểm vào `users.total_points`.

---

### 2.2. Nhóm API dành cho Quản lý Sự kiện (MOD)

#### 1. Tạo sự kiện (Lưu nháp)
- **Hành động người dùng:** MOD điền form tạo sự kiện và bấm "Lưu nháp".
- **API:** `POST /api/events`
- **Input (Body):** `title, description, start_time, location, capacity, points_reward, gps_lat, gps_lng`
- **Output:** `{"id": "new_uuid", "status": "DRAFT"}`

#### 2. Gửi duyệt sự kiện
- **Hành động người dùng:** MOD bấm nút "Gửi duyệt" (Submit for review).
- **API:** `POST /api/events/:eventId/submit`
- **Nghiệp vụ Backend:** Cập nhật trạng thái sự kiện từ `DRAFT` sang `PENDING_REVIEW`.

#### 3. Sinh mã QR động cho Projector MOD
- **Hành động người dùng:** MOD mở chế độ Projector trên màn hình lớn.
- **API:** `GET /api/events/:eventId/qr-token`
- **Output:** `{"token": "jwt_token_het_han_sau_30s"}`
- **Nghiệp vụ Backend:** Tạo một chuỗi JWT hoặc mã hash chứa ID sự kiện và thời gian sống là 30 giây. Frontend sẽ gọi API này lặp lại mỗi 25-30 giây để đổi mã QR.

#### 4. Xem thống kê Điểm danh (Live Attendance)
- **Hành động người dùng:** MOD mở tab "Điểm danh". Dashboard hiện số người quét mã realtime.
- **API:** `GET /api/events/:eventId/attendance-stats`
- **Output:** `{"total_registered": 100, "checked_in": 45, "invalid_location": 2}`

---

### 2.3. Nhóm API dành cho Kiểm duyệt (ADMIN)

#### 1. Lấy danh sách cần duyệt
- **Hành động người dùng:** Admin mở Dashboard thấy các sự kiện chờ duyệt.
- **API:** `GET /api/admin/events?status=PENDING_REVIEW`

#### 2. Phê duyệt / Yêu cầu chỉnh sửa
- **Hành động người dùng:** Admin nhập phản hồi và bấm "Duyệt" hoặc "Yêu cầu sửa".
- **API Duyệt:** `POST /api/admin/events/:eventId/approve` (Chuyển thành `PUBLISHED`).
- **API Yêu cầu sửa:** `POST /api/admin/events/:eventId/reject`
- **Input (Body cho Reject):** `{"feedback": "Vui lòng thêm chi tiết mô tả"}`
- **Nghiệp vụ Backend:** Cập nhật status, lưu lời phê `feedback` để MOD xem lại.

---

## 3. HƯỚNG DẪN KẾT NỐI BACKEND VỚI FRONTEND HIỆN TẠI

Frontend hiện tại đang sử dụng hệ thống Mock Data tĩnh (trong thư mục `src/mocks`). Để kết nối vào Backend thật, bạn cần thực hiện quá trình "thay máu" data flow như sau:

### Bước 1: Thiết lập thư viện gọi API
Khuyến nghị sử dụng **Axios** (hoặc Fetch API chuẩn).
Trong folder `src/lib`, tạo file `apiClient.ts`:

```typescript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để nhúng token vào mỗi request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token'); // Hoặc lấy từ cookie/Zustand store
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Bước 2: Viết các Service (Thay thế mock)
Thay vì import `MOCK_EVENTS` vào component, tạo folder `src/services/eventService.ts`:

```typescript
import { apiClient } from '@/lib/apiClient';

export const getEvents = async (status?: string) => {
  const res = await apiClient.get('/events', { params: { status } });
  return res.data;
};

export const registerEvent = async (eventId: string) => {
  const res = await apiClient.post(`/events/${eventId}/register`);
  return res.data;
};
```

### Bước 3: Tích hợp vào UI Component (Dùng React Query / SWR hoặc React Hooks chuẩn)

Trong file `page.tsx` (Ví dụ trang Lịch sự kiện của sinh viên):

**Trước đây (Mock):**
```tsx
import { MOCK_EVENTS } from "@/mocks"

export default function StudentEventsPage() {
  const groupedEvents = groupEventsByDate(MOCK_EVENTS);
  // ...
}
```

**Sau khi nối Backend:**
```tsx
'use client'
import { useEffect, useState } from 'react';
import { getEvents } from '@/services/eventService';

export default function StudentEventsPage() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getEvents('PUBLISHED');
        setEvents(data.data);
      } catch (error) {
        console.error("Lỗi khi tải sự kiện", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (isLoading) return <LoadingSkeleton />;

  const groupedEvents = groupEventsByDate(events);
  // ... render giao diện như cũ
}
```

### Bước 4: Xử lý State khi tương tác (Ví dụ bấm Đăng ký)
Khi người dùng click Đăng ký, gọi API, chờ kết quả và dùng `Toast` (ví dụ của shadcn) để thông báo:

```tsx
const handleRegister = async (eventId) => {
  setIsRegistering(true);
  try {
    const res = await registerEvent(eventId);
    if (res.ticket.status === 'OFFICIAL') {
       toast.success("Đăng ký thành công! Bạn đã có vé chính thức.");
    } else {
       toast.warning("Bạn đã được xếp vào danh sách chờ.");
    }
    // Refresh lại data sự kiện
  } catch (error) {
    toast.error("Đăng ký thất bại. Bạn đã đăng ký sự kiện này rồi!");
  } finally {
    setIsRegistering(false);
  }
};
```

## Tổng kết các bước cho Team Backend:
1. Chọn framework (NodeJS/Express/NestJS) và tạo init project.
2. Thiết lập Database kết nối (ORM Prisma hoặc TypeORM).
3. Viết Schema/Migration tạo 5 bảng như mục 1.
4. Xây dựng Controller & Route dựa theo mục 2.
5. Setup CORS cho phép domain Frontend gọi vào.
6. Cung cấp file `.env` chứa `API_URL` cho Team Frontend cấu hình.
