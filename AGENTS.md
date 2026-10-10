# AGENTS.md

## Mục đích

Tệp này hướng dẫn mọi coding agent làm việc trong repository của hệ thống **GDU Event & Training**. Agent phải đọc tài liệu sản phẩm và design system trước khi sửa code, triển khai theo từng phase, kiểm tra trực tiếp bằng browser và không tự ý mở rộng phạm vi.

## Thứ tự tài liệu ưu tiên

Trước khi lập kế hoạch hoặc chỉnh sửa code, bắt buộc đọc theo thứ tự:

1. `AGENTS.md`
2. `PRD.md`
3. `DESIGN.md`
4. `DESIGN_RULES.md`
5. `README.md`, nếu tồn tại
6. `package.json` và cấu trúc source hiện tại
7. Các `AGENTS.md` nằm sâu hơn trong thư mục đang sửa, nếu có

Khi tài liệu mâu thuẫn:

1. Yêu cầu trực tiếp mới nhất của người dùng có ưu tiên cao nhất.
2. `PRD.md` quyết định chức năng, phân quyền và nghiệp vụ cấp cao.
3. `DESIGN.md` quyết định design tokens, màu sắc, typography, spacing, radius và responsive.
4. `DESIGN_RULES.md` quyết định art direction, information hierarchy, composition, cách sử dụng component và các pattern thiết kế bị cấm.
5. Code hiện tại không được xem là nguồn đúng nếu mâu thuẫn với các tài liệu trên.

## Ngôn ngữ sản phẩm

- Nội dung UI mặc định dùng tiếng Việt.
- Tên biến, tên hàm, type, interface và comment kỹ thuật dùng tiếng Anh, trừ khi codebase có quy ước khác.
- Không dùng lorem ipsum.
- Mock data phải giống dữ liệu đại học thực tế: tên sự kiện, thời gian, địa điểm, ngành, điểm rèn luyện, vị trí waitlist, số thứ tự và số ghế.

## Mô hình phân quyền bắt buộc

```text
Admin
  ↓
MOD
  ↓
Sinh viên
```

### Admin

Admin chỉ tập trung vào:

- Xem sự kiện chờ duyệt.
- Duyệt sự kiện.
- Từ chối sự kiện.
- Yêu cầu MOD chỉnh sửa.
- Nhập phản hồi xét duyệt.
- Xem lịch sử xử lý.
- Xóa sự kiện.

Admin không được triển khai như người vận hành sự kiện hằng ngày. Không đặt các chức năng sau trong shell Admin:

- Tạo hoặc cấu hình sự kiện.
- Quản lý đăng ký hằng ngày.
- Mở Projector MOD.
- Theo dõi live attendance.
- Xuất báo cáo sự kiện.

### MOD

MOD thuộc quyền Admin và cao hơn Sinh viên. MOD chịu trách nhiệm tạo và vận hành sự kiện:

- Tạo, sửa và lưu bản nháp.
- Thêm banner và nội dung.
- Cấu hình thời gian, địa điểm, ngành, số lượng và sức chứa.
- Cấu hình GPS mặc định thử nghiệm 100 mét.
- Chọn tiêu chí và số điểm rèn luyện.
- Dùng cấu hình mẫu.
- Preview và gửi Admin duyệt.
- Nhận phản hồi, sửa và gửi lại.
- Cancel sự kiện trong giới hạn 24 giờ theo business rules.
- Quản lý đăng ký và waitlist.
- Mở Projector MOD và QR động 30 giây.
- Theo dõi điểm danh.
- Xem báo cáo và xuất Excel.

MOD không được:

- Tự duyệt.
- Tự Public.
- Xóa sự kiện.

### Sinh viên

Sinh viên có thể:

- Xem sự kiện đã Public.
- Tìm kiếm và lọc sự kiện.
- Đăng ký, nhận vé chính thức hoặc waitlist.
- Xem số thứ tự, số ghế và vị trí waitlist nếu có.
- Hủy trong 48 giờ từ thời điểm đăng ký khi còn hiệu lực.
- Xem lịch trình cá nhân.
- Quét QR kết hợp GPS.
- Xem kết quả điểm danh.
- Xem điểm, xếp loại và lịch sử điểm rèn luyện.

Điểm rèn luyện được cộng dồn liên tục trong **3 năm**, không reset theo học kỳ hoặc năm học. Bộ lọc học kỳ/năm học chỉ thay đổi phạm vi hiển thị, không thay đổi tổng tích lũy.

## Nguyên tắc triển khai hiện tại

Cho đến khi người dùng phê duyệt UI, agent chỉ được làm frontend bằng mock data.

### Được phép

- Tạo design tokens.
- Tạo reusable components.
- Tạo app shell và role-based navigation.
- Tạo demo routes.
- Tạo mock fixtures riêng khỏi component.
- Triển khai search, filter, tabs, form state, dialog, bottom sheet, toast và client-side validation.
- Tạo loading, empty, error, disabled và success states.
- Chạy browser và tạo screenshot artifacts.
- Viết test cho component và responsive behavior nếu hạ tầng test đã tồn tại.

### Không được phép khi chưa có yêu cầu rõ ràng

- Kết nối database thật.
- Thay đổi schema hoặc migration.
- Kết nối API thật.
- Triển khai authentication thật.
- Gửi email thật.
- Xuất Excel thật.
- Dùng camera hoặc GPS thật.
- Triển khai QR production.
- Thay framework, router hoặc styling solution nếu không thật sự cần.
- Xóa hoặc phá vỡ route/backend hiện có.
- Tự triển khai phase tiếp theo sau điểm dừng yêu cầu.

Nếu repository đã có backend hoặc chức năng thật, giữ nguyên và cô lập UI demo để không tạo regression.

## Design system bắt buộc

Đọc `DESIGN.md` và `DESIGN_RULES.md` trước khi viết hoặc chỉnh sửa UI.

### Màu thương hiệu

```css
--color-primary: #173a67;
--color-primary-hover: #102e52;
--color-primary-active: #0b2340;
--color-primary-soft: #eaf0f7;
--color-primary-muted: #c9d6e5;
--color-accent: #d8b24f;
--color-accent-hover: #c59c35;
--color-accent-active: #a98224;
--color-accent-soft: #fbf5e5;
--color-canvas: #f6f8fb;
--color-surface: #ffffff;
--color-ink: #10233d;
--color-body: #344a63;
--color-muted: #66788c;
--color-border: #dce4ed;
--color-border-strong: #bbc9d8;
--color-success: #21835a;
--color-warning: #a66a12;
--color-error: #c23b3b;
--color-info: #2563a6;
```

### Quy tắc màu

- Navy là primary action, active navigation, focus và heading quan trọng.
- Gold chỉ là accent cho điểm rèn luyện, badge và dữ liệu nổi bật.
- Không dùng gold cho body text trên nền trắng.
- Gold button dùng chữ navy đậm.
- Success, warning và error phải dùng semantic colors, không thay bằng navy/gold.
- Không tạo theme riêng không liên quan cho từng vai trò.

### Không thay đổi

Nếu người dùng chỉ yêu cầu đổi màu/responsive, không được tự ý thay:

- Typography.
- Font scale và weight.
- Spacing scale.
- Border radius.
- Hình dạng button, card, input, chip hoặc dialog.

Không thêm glassmorphism, neon, gradient nhiều màu hoặc shadow đậm.

## Art direction và chống giao diện AI-generated

Mọi UI phải tuân thủ `DESIGN_RULES.md`.

Agent phải ưu tiên giao diện sản phẩm vận hành thực tế, rõ ràng và có mật độ thông tin hợp lý. Không được biến hệ thống thành landing page marketing, SaaS dashboard chung chung hoặc concept Dribbble khó triển khai.

Các quy tắc bắt buộc:

- Mỗi màn hình có một mục tiêu chính và tối đa một primary CTA trong mỗi action area.
- Không đặt mọi nội dung trong card; ưu tiên section, divider, list row và spacing khi phù hợp.
- Không lồng card quá hai cấp.
- Không tạo hàng loạt statistic cards nếu số liệu không hỗ trợ quyết định hoặc thao tác tiếp theo.
- Không thêm chart để trang trí hoặc lấp khoảng trống.
- Không dùng icon trước mọi heading.
- Không biến mọi metadata thành badge.
- Không dùng hero lớn, heading quá khổ hoặc khoảng trắng kiểu landing page trong màn hình ứng dụng.
- Không tự thêm chatbot, AI assistant, social feed, leaderboard, gamification, dark MOD hoặc chức năng ngoài PRD.
- Admin, MOD và Sinh viên dùng cùng một design language; khác biệt nằm ở navigation, thông tin ưu tiên và quyền thao tác, không phải ba theme khác nhau.
- Mobile phải được thiết kế lại theo tác vụ, không chỉ ép layout desktop thành một cột.
- Mock data phải cụ thể, tự nhiên và không dùng số liệu đối xứng hoặc hoàn hảo một cách giả tạo.

Trước khi gửi UI để duyệt, agent phải thực hiện checklist chống AI-generated trong `DESIGN_RULES.md` và tự sửa nếu phát hiện quá nhiều card, badge, chart, gradient, icon trang trí hoặc khoảng trắng không cần thiết.

## Mobile-first bắt buộc

Base CSS phải dành cho mobile. Chỉ dùng `min-width` để tăng khả năng bố trí.

```text
Base:    0px+
Small:   480px+
Tablet:  640px+
Desktop: 1024px+
Wide:    1280px+
```

### Base mobile

- Hỗ trợ tối thiểu 320px; viewport kiểm thử chính 390px.
- Padding ngang 16px.
- Header khoảng 56px.
- Một cột mặc định.
- Form một trường mỗi hàng.
- Primary action full width khi thiếu không gian.
- Touch target tối thiểu 44px.
- Không có persistent sidebar.
- Dùng drawer hoặc bottom navigation.
- Filter nâng cao mở trong bottom sheet hoặc stacked panel.
- Table chuyển sang mobile data cards hoặc horizontal scroll có chủ đích.
- Dialog rộng tối đa `calc(100vw - 32px)`.
- Không giảm font chỉ để nhét layout desktop.

### Tablet 640px+

- Padding ngang 24px.
- Card có thể hai cột.
- Các trường ngắn có thể hai cột.
- Bảng hiển thị lại các cột ưu tiên.

### Desktop 1024px+

- Padding ngang 32px.
- Container tối đa khoảng 1200px.
- Có thể dùng persistent sidebar.
- Card tối đa ba cột.
- Table hiển thị đầy đủ.
- Header khoảng 64px.

## Responsive theo loại màn hình

- Event grid: 1 cột mobile, 2 cột tablet, 3 cột desktop.
- Timetable: agenda/list trên mobile, weekly grid đầy đủ trên desktop.
- Data table: card hoặc scroll trên mobile, full table trên desktop.
- Form: 1 cột mobile; 2 cột cho trường ngắn từ tablet.
- Dialog: stacked actions trên mobile, inline actions khi đủ chỗ.
- Detail page: sticky action bar trên mobile nhưng không che bottom navigation.
- Projector MOD: tối ưu màn hình lớn, tương phản cao, không hiển thị dữ liệu cá nhân.

## Kiến trúc frontend

Trước khi code, agent phải khảo sát:

1. Framework và phiên bản.
2. Router.
3. Styling solution.
4. Component library.
5. State management.
6. Scripts build, lint, test và dev.
7. Route hiện tại và lỗi có sẵn.

Ưu tiên tái sử dụng. Không tạo component trùng nếu đã có component tương đương.

Cấu trúc khuyến nghị, điều chỉnh theo codebase:

```text
src/
  components/
    ui/
    layout/
    events/
    attendance/
    training-points/
  features/
    student/
    MOD/
    admin/
  mocks/
  lib/
  styles/
```

Mock data phải nằm ngoài page/component. Không hard-code cùng một dataset ở nhiều nơi.

## Demo routes

Nếu chưa có route phù hợp, tạo route demo riêng và không phá route thật:

```text
/demo/student
/demo/student/events
/demo/student/events/:id
/demo/student/tickets
/demo/student/schedule
/demo/student/attendance
/demo/student/training-points

/demo/MOD
/demo/MOD/events
/demo/MOD/events/new
/demo/MOD/events/:id
/demo/MOD/events/:id/registrations
/demo/MOD/events/:id/attendance
/demo/MOD/events/:id/report
/demo/MOD/events/:id/projector

/demo/admin
/demo/admin/reviews
/demo/admin/reviews/:id
/demo/admin/history
/demo/admin/events
```

Cú pháp route phải theo router đang dùng.

## Phases và điểm dừng

### Phase 1: Foundation và Sinh viên

- Design tokens.
- App shell responsive.
- Logo/header/navigation.
- Demo role switcher.
- Mock data.
- Trang chủ Sinh viên.
- Danh sách sự kiện.
- Chi tiết sự kiện.
- Dialog đăng ký.
- Kết quả vé chính thức.
- Kết quả waitlist.
- Vé của tôi.
- Điểm rèn luyện tích lũy 3 năm.

Sau Phase 1, chạy kiểm tra, tạo screenshot artifacts và **dừng chờ duyệt**.

### Phase 2: MOD

Chỉ bắt đầu khi người dùng duyệt Phase 1:

- Dashboard MOD.
- Danh sách sự kiện.
- Form tạo/chỉnh sửa.
- Cấu hình mẫu.
- Preview và gửi duyệt.
- Chờ duyệt/yêu cầu chỉnh sửa.
- Registration/waitlist.
- Projector MOD.
- Live attendance.
- Report và cancel.

Sau Phase 2, tạo artifacts và **dừng chờ duyệt**.

### Phase 3: Admin

Chỉ bắt đầu khi người dùng duyệt Phase 2:

- Dashboard tối giản.
- Danh sách chờ duyệt.
- Chi tiết xét duyệt.
- Dialog duyệt/yêu cầu sửa/từ chối.
- Lịch sử xử lý.
- Quản lý xóa sự kiện.

Sau Phase 3, tạo artifacts và **dừng chờ duyệt**.

### Phase 4: Tích hợp thật

Chỉ bắt đầu có yêu cầu riêng và business rules đã được chốt.

## Component states bắt buộc

Các màn hình quan trọng cần có khi phù hợp:

- Default.
- Loading/skeleton.
- Empty.
- Error.
- Disabled.
- Success.

Không chỉ biểu thị trạng thái bằng màu. Luôn dùng label rõ ràng và icon khi cần.

## Accessibility

- Heading hierarchy hợp lý.
- Input có label.
- Button icon có accessible name.
- Navigation có aria label.
- Dialog quản lý focus.
- Focus indicator rõ ràng.
- Tương phản màu phù hợp.
- Touch target tối thiểu 44px.
- Không dùng color-only communication.
- Hỗ trợ keyboard với các tương tác chính.

## Quy trình làm việc của agent

Mỗi task UI phải thực hiện theo thứ tự:

1. Đọc tài liệu liên quan.
2. Khảo sát codebase và các quy ước hiện tại.
3. Nêu implementation plan ngắn.
4. Triển khai phạm vi được giao, không mở rộng phase.
5. Chạy formatter nếu có.
6. Chạy typecheck/build.
7. Chạy lint và test phù hợp.
8. Khởi động ứng dụng.
9. Kiểm tra browser ở các viewport yêu cầu.
10. Sửa overflow, lỗi tương tác và console errors.
11. Tạo screenshot/browser artifacts.
12. Báo cáo file đã đổi, test đã chạy, phần mock và vấn đề còn lại.
13. Dừng tại approval gate.

## Browser verification

Kiểm tra tối thiểu:

```text
390 x 844
768 x 1024
1440 x 900
```

Phải xác minh:

- Không có horizontal overflow ngoài vùng table có chủ đích.
- Header/navigation hoạt động.
- Dialog và bottom sheet không vượt viewport.
- Sticky action không che nội dung.
- Form và validation đọc được.
- Loading/empty/error state hiển thị đúng.
- Navy/white và gold/navy có tương phản phù hợp.
- Console không có lỗi mới từ thay đổi.

## Lệnh kiểm tra

Dùng scripts có sẵn trong `package.json`. Không giả định package manager. Xác định từ lockfile:

- `pnpm-lock.yaml` → dùng `pnpm`.
- `yarn.lock` → dùng `yarn`.
- `package-lock.json` → dùng `npm`.
- `bun.lock` hoặc `bun.lockb` → dùng `bun`.

Không tự đổi package manager hoặc tái tạo lockfile bằng công cụ khác.

## Quy tắc thay đổi code

- Thay đổi nhỏ nhất đủ hoàn thành task.
- Không refactor ngoài phạm vi nếu không cần.
- Không xóa code chưa hiểu.
- Không ghi đè biến môi trường hoặc secret.
- Không commit credential, key hoặc dữ liệu cá nhân.
- Không sửa file generated nếu có nguồn sinh ra file đó.
- Không bỏ qua lỗi type/lint bằng `any`, suppression hoặc disable rule nếu chưa giải thích rõ.
- Không đánh dấu task hoàn thành khi build hoặc browser verification chưa chạy được. Nếu bị chặn, báo chính xác nguyên nhân.

## Báo cáo hoàn thành

Mỗi lần hoàn thành phải nêu:

- Phạm vi đã làm.
- Routes/màn hình đã tạo.
- Components/tokens đã tạo hoặc tái sử dụng.
- File chính đã thay đổi.
- Lệnh đã chạy và kết quả.
- Viewport đã kiểm tra.
- Artifacts đã tạo.
- Phần nào vẫn là mock.
- Vấn đề hoặc quyết định còn cần người dùng duyệt.

Không tự tiếp tục phase tiếp theo nếu chưa được duyệt.
