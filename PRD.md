---
title: "PRD - Hệ thống quản lý sự kiện, điểm danh và điểm rèn luyện sinh viên"
version: "2.0"
status: "Bản cập nhật phân quyền và chức năng"
roles:
  - Admin
  - Mode
  - Sinh viên
last_updated: "2026-10-07"
source: "PRD.docx"
---

# Product Requirements Document

**Hệ thống quản lý sự kiện, điểm danh và điểm rèn luyện sinh viên**

> Đặc tả chức năng sản phẩm thực tế

| Phiên bản > **2.0** --- |
| Trạng thái | Bản cập nhật phân quyền và chức năng |
| Phân quyền | Admin > Mode > Sinh viên |
| Ngày cập nhật | 07/10/2026 |
| Trọng tâm | Admin duyệt/xóa; Mode tạo và vận hành; Sinh viên tham gia |

# 1. Tổng quan tài liệu

## 1.1. Mục đích

Tài liệu mô tả phạm vi chức năng của hệ thống quản lý sự kiện sinh viên, đăng ký, danh sách chờ, điểm danh QR kết hợp GPS, quản lý điểm rèn luyện, báo cáo và thông báo. Phiên bản 2.0 tái cấu trúc sản phẩm thành ba cấp quyền Admin, Mode và Sinh viên.

## 1.2. Nguyên tắc phân cấp

> **THỨ BẬC QUYỀN  Admin là cấp cao nhất, Mode thuộc quyền Admin và có quyền cao hơn Sinh viên. Admin không vận hành sự kiện hằng ngày; công việc chính của Admin là duyệt, từ chối và xóa sự kiện. Mode chịu trách nhiệm tạo, cấu hình và vận hành sự kiện. Sinh viên khám phá, đăng ký, điểm danh và theo dõi điểm.**

- Ba vai trò đăng nhập: Admin, Mode và Sinh viên.
- Các System Jobs chỉ là chức năng tự động, không phải vai trò thứ tư.
- Mode không được tự duyệt, tự Public hoặc xóa sự kiện.
- Sự kiện chỉ được Public sau khi Admin duyệt.
- Các xử lý rủi ro kỹ thuật và ngoại lệ chuyên sâu được đặc tả ở tài liệu sau.

## 1.3. Thuật ngữ

| Thuật ngữ > **Định nghĩa** --- |
| Admin | Cấp quyền cao nhất, có nhiệm vụ chính là duyệt/từ chối và xóa sự kiện. |
| Mode | Vai trò tổ chức sự kiện dưới quyền Admin và trên quyền Sinh viên; tạo, cấu hình, gửi duyệt và vận hành sự kiện. |
| Sinh viên | Người khám phá, đăng ký, điểm danh và nhận điểm rèn luyện. |
| Public | Trạng thái sự kiện đã được Admin duyệt và hiển thị cho Sinh viên. |
| Vé chính thức | Đăng ký được ghi nhận trong giới hạn sức chứa. |
| Danh sách chờ | Đăng ký được xếp hàng khi sự kiện đã đủ sức chứa. |
| QR động | Mã QR thay đổi sau mỗi 30 giây để phục vụ điểm danh. |
| Chu kỳ 3 năm | Khoảng thời gian điểm rèn luyện được cộng dồn liên tục, không reset theo từng năm học. |

# 2. Mục tiêu và phạm vi sản phẩm

## 2.1. Mục tiêu

- Tạo quy trình rõ ràng từ Mode tạo sự kiện, Admin duyệt đến Sinh viên đăng ký.
- Giảm thao tác thủ công trong quản lý sức chứa, danh sách chờ, điểm danh và tổng hợp điểm.
- Cung cấp QR động kết hợp GPS thử nghiệm trong bán kính 100 mét.
- Cho phép Mode sử dụng lại cấu hình sự kiện đã lưu.
- Hiển thị điểm và xếp loại rèn luyện theo từng giai đoạn và toàn chu kỳ 3 năm.
- Tự động gửi thông báo, nhắc lịch, cập nhật waitlist và ghi nhận no-show.

## 2.2. Trong phạm vi

- Tạo, chỉnh sửa, gửi duyệt, duyệt, Public, cancel và xóa sự kiện theo đúng quyền.
- Quản lý banner, nội dung, thời gian, địa điểm, ngành, số lượng, GPS và điểm rèn luyện.
- Đăng ký, popup xác nhận, số thứ tự, số ghế, danh sách chờ và hủy đăng ký.
- Điểm danh bằng camera web, QR động, thời gian và GPS.
- Bảng điểm, xếp loại và lịch sử điểm tích lũy liên tục trong 3 năm.
- Danh sách đăng ký, điểm danh, báo cáo và xuất Excel.
- Email và các tác vụ tự động.

## 2.3. Ngoài phạm vi tài liệu

- Xử lý lỗi hạ tầng, mất mạng, GPS giả lập và cơ chế khôi phục chi tiết.
- Quy trình khiếu nại, tranh chấp và miễn trừ đặc biệt.
- API, database schema và kiến trúc triển khai.

# 3. Mô hình phân quyền

## 3.1. Sơ đồ phân cấp

> **ADMIN  Duyệt, từ chối và xóa sự kiện.**

> **MODE  Tạo, cấu hình, gửi duyệt, cancel có giới hạn, vận hành QR, theo dõi và xuất báo cáo sự kiện.**

> **SINH VIÊN  Xem, đăng ký, hủy đăng ký, điểm danh, xem vé, waitlist và điểm rèn luyện.**

## 3.2. Ma trận quyền

| Chức năng | Admin | Mode > **Sinh viên** --- | --- | --- |
| Xem sự kiện Public | Có | Có | Có |
| Tạo sự kiện | Không | Có | Không |
| Chỉnh sửa bản nháp | Không | Có | Không |
| Gửi duyệt | Không | Có | Không |
| Duyệt/từ chối | Có | Không | Không |
| Public sau duyệt | Hệ thống theo quyết định Admin | Không | Không |
| Cancel sự kiện | Không | Có, trong 24 giờ theo quy định | Không |
| Xóa sự kiện | Có | Không | Không |
| Cấu hình banner/nội dung | Không | Có | Không |
| Cấu hình ngành/số lượng/GPS | Không | Có | Không |
| Gán tiêu chí và điểm | Không | Có | Không |
| Dùng cấu hình mẫu | Không | Có | Không |
| Quản lý danh sách đăng ký/waitlist | Không | Có với sự kiện của mình | Chỉ xem trạng thái của mình |
| Mở QR Projector | Không | Có | Không |
| Theo dõi điểm danh | Không | Có | Không |
| Xuất Excel | Không | Có | Không |
| Đăng ký/hủy vé | Không | Không | Có |
| Quét QR/GPS | Không | Không | Có |
| Xem điểm và xếp loại cá nhân | Không | Không | Có |

# 4. Vòng đời sự kiện

## 4.1. Trạng thái

| Trạng thái | Mô tả > **Quyền thao tác** --- | --- |
| Bản nháp | Mode đang tạo hoặc chỉnh sửa. | Mode |
| Chờ duyệt | Mode đã gửi sự kiện đến Admin. | Admin xem xét |
| Yêu cầu chỉnh sửa | Admin chưa duyệt và yêu cầu cập nhật. | Mode chỉnh sửa, gửi lại |
| Đã duyệt/Public | Admin duyệt; sự kiện hiển thị cho Sinh viên. | Sinh viên xem/đăng ký |
| Đang diễn ra | Sự kiện đang được tổ chức. | Mode vận hành |
| Đã kết thúc | Sự kiện đã qua thời gian kết thúc. | Mode xem báo cáo |
| Đã cancel | Mode cancel theo giới hạn 24 giờ. | Chỉ còn xem lịch sử |
| Đã xóa | Admin xóa sự kiện. | Không hiển thị công khai |

## 4.2. Luồng chính

1. Mode tạo bản nháp và nhập thông tin.
1. Mode gửi duyệt.
1. Admin duyệt, từ chối hoặc yêu cầu chỉnh sửa.
1. Nếu được duyệt, hệ thống chuyển sự kiện sang Public.
1. Mode vận hành đăng ký, QR, điểm danh và báo cáo.
1. Admin chỉ can thiệp khi cần duyệt, từ chối hoặc xóa sự kiện.

# 5. Yêu cầu chức năng dành cho Admin

## 5.1. Duyệt sự kiện

`ADM-APR-01`

### Danh sách sự kiện chờ duyệt

**Mục đích:** Tập trung đúng công việc chính của Admin.

**Người sử dụng:** Admin

**Điều kiện sử dụng:** Có sự kiện do Mode gửi duyệt.

**Luồng chức năng chính:**
1. Admin mở danh sách Chờ duyệt.
1. Hệ thống hiển thị tên sự kiện, Mode tạo, thời gian gửi và trạng thái.
1. Admin mở chi tiết để kiểm tra banner, nội dung, thời gian, địa điểm, ngành, sức chứa, GPS và điểm rèn luyện.

**Kết quả:** Admin xem đầy đủ dữ liệu trước khi quyết định.

**Thông tin giao diện chính:** Bộ lọc, tìm kiếm, chi tiết sự kiện và thông tin Mode.

`ADM-APR-02`

### Duyệt, từ chối hoặc yêu cầu chỉnh sửa

**Mục đích:** Cho phép Admin quyết định sự kiện có được Public hay không.

**Người sử dụng:** Admin

**Điều kiện sử dụng:** Sự kiện đang Chờ duyệt.

**Luồng chức năng chính:**
1. Admin chọn Duyệt, Từ chối hoặc Yêu cầu chỉnh sửa.
1. Nếu duyệt, hệ thống chuyển sự kiện sang Public.
1. Nếu từ chối hoặc yêu cầu chỉnh sửa, Admin nhập ghi chú.
1. Hệ thống gửi kết quả đến Mode.

**Kết quả:** Sự kiện có trạng thái xét duyệt rõ ràng.

**Thông tin giao diện chính:** Nút quyết định, ô ghi chú và thông báo kết quả.

## 5.2. Xóa sự kiện

`ADM-DEL-01`

### Xóa sự kiện

**Mục đích:** Cho phép Admin loại bỏ sự kiện khỏi hệ thống theo quyền cao nhất.

**Người sử dụng:** Admin

**Điều kiện sử dụng:** Sự kiện tồn tại.

**Luồng chức năng chính:**
1. Admin mở sự kiện.
1. Admin chọn Xóa.
1. Hệ thống hiển thị popup xác nhận.
1. Admin xác nhận xóa.
1. Hệ thống cập nhật trạng thái xóa và ngừng hiển thị sự kiện.

**Kết quả:** Sự kiện bị xóa khỏi phạm vi sử dụng thông thường.

**Thông tin giao diện chính:** Tên sự kiện, Mode tạo, trạng thái và xác nhận xóa.

> **GIỚI HẠN ADMIN  Admin không chịu trách nhiệm tạo, cấu hình, vận hành QR, theo dõi danh sách đăng ký hoặc xuất báo cáo hằng ngày. Các chức năng đó thuộc Mode.**

# 6. Yêu cầu chức năng dành cho Mode

## 6.1. Tạo và quản lý sự kiện

`MOD-EVT-01`

### Danh sách sự kiện của Mode

**Mục đích:** Cho phép Mode quản lý các sự kiện do mình tạo.

**Người sử dụng:** Mode

**Điều kiện sử dụng:** Mode đã đăng nhập.

**Luồng chức năng chính:**
1. Mode mở khu vực Sự kiện của tôi.
1. Hệ thống hiển thị bản nháp, chờ duyệt, yêu cầu chỉnh sửa, Public, đang diễn ra, kết thúc hoặc cancel.
1. Mode tìm kiếm và lọc theo trạng thái hoặc thời gian.

**Kết quả:** Mode theo dõi được toàn bộ vòng đời sự kiện của mình.

**Thông tin giao diện chính:** Tên, thời gian, trạng thái, số đăng ký và thao tác được phép.

`MOD-EVT-02`

### Tạo và chỉnh sửa sự kiện

**Mục đích:** Cho phép Mode chuẩn bị đầy đủ nội dung sự kiện.

**Người sử dụng:** Mode

**Điều kiện sử dụng:** Mode có quyền tạo sự kiện.

**Luồng chức năng chính:**
1. Mode chọn Tạo sự kiện.
1. Mode nhập tên, banner, nội dung, thể loại, đơn vị tổ chức, thời gian và địa điểm.
1. Mode cấu hình ngành/đối tượng tham gia, số lượng, sức chứa và thời gian đăng ký.
1. Mode cấu hình tọa độ GPS, bán kính thử nghiệm 100 mét, tiêu chí và số điểm rèn luyện.
1. Mode lưu bản nháp hoặc tiếp tục gửi duyệt.

**Kết quả:** Bản nháp sự kiện được tạo hoặc cập nhật.

**Thông tin giao diện chính:** Form sự kiện, banner, rich content, ngành, số lượng, GPS và điểm.

`MOD-EVT-03`

### Sử dụng cấu hình mẫu

**Mục đích:** Giảm thời gian tạo các sự kiện có cấu hình lặp lại.

**Người sử dụng:** Mode

**Điều kiện sử dụng:** Đã tồn tại cấu hình mẫu.

**Luồng chức năng chính:**
1. Mode chọn một cấu hình đã lưu.
1. Hệ thống tự điền địa điểm, GPS, bán kính, thể loại, ngành, sức chứa, tiêu chí và điểm mặc định.
1. Mode chỉnh sửa dữ liệu riêng của sự kiện.
1. Mode lưu bản nháp.

**Kết quả:** Một cấu hình có thể được sử dụng nhiều lần.

**Thông tin giao diện chính:** Danh sách mẫu, xem trước và nút áp dụng.

`MOD-EVT-04`

### Gửi sự kiện để Admin duyệt

**Mục đích:** Khởi tạo quy trình kiểm duyệt trước khi Public.

**Người sử dụng:** Mode

**Điều kiện sử dụng:** Bản nháp có đủ thông tin bắt buộc.

**Luồng chức năng chính:**
1. Mode xem lại sự kiện.
1. Mode chọn Gửi duyệt.
1. Hệ thống chuyển trạng thái sang Chờ duyệt.
1. Mode theo dõi kết quả duyệt và ghi chú của Admin.

**Kết quả:** Sự kiện được chuyển đến Admin.

**Thông tin giao diện chính:** Trạng thái duyệt, thời gian gửi và phản hồi Admin.

`MOD-EVT-05`

### Cancel sự kiện trong giới hạn 24 giờ

**Mục đích:** Cho phép Mode dừng sự kiện trong phạm vi được quy định mà không có quyền xóa.

**Người sử dụng:** Mode

**Điều kiện sử dụng:** Sự kiện thuộc Mode và còn trong giới hạn 24 giờ áp dụng.

**Luồng chức năng chính:**
1. Mode chọn Cancel sự kiện.
1. Hệ thống hiển thị popup xác nhận và yêu cầu lý do.
1. Mode xác nhận.
1. Hệ thống chuyển trạng thái sang Đã cancel và ngừng nhận đăng ký.

**Kết quả:** Sự kiện bị cancel nhưng không bị xóa.

**Thông tin giao diện chính:** Lý do, thời điểm cancel và trạng thái mới.

## 6.2. Quản lý đăng ký và danh sách chờ

`MOD-REG-01`

### Quản lý danh sách đăng ký

**Mục đích:** Cho phép Mode theo dõi người tham gia sự kiện của mình.

**Người sử dụng:** Mode

**Điều kiện sử dụng:** Sự kiện đã Public và có đăng ký.

**Luồng chức năng chính:**
1. Mode mở danh sách đăng ký.
1. Hệ thống hiển thị vé chính thức và danh sách chờ.
1. Mode tìm kiếm theo MSSV, họ tên, lớp, khoa hoặc ngành.
1. Mode xem thời gian đăng ký, số thứ tự và số ghế nếu có.

**Kết quả:** Mode theo dõi được sức chứa và người tham gia.

**Thông tin giao diện chính:** MSSV, họ tên, ngành, trạng thái vé, số thứ tự, số ghế.

`MOD-REG-02`

### Chi tiết danh sách chờ

**Mục đích:** Cho phép Mode theo dõi thứ tự chờ.

**Người sử dụng:** Mode

**Điều kiện sử dụng:** Sự kiện đã đủ sức chứa và có waitlist.

**Luồng chức năng chính:**
1. Mode mở tab Danh sách chờ.
1. Hệ thống hiển thị vị trí, thời gian vào hàng đợi và trạng thái từng sinh viên.
1. Khi có chỗ trống, hệ thống cập nhật người được chuyển sang vé chính thức.

**Kết quả:** Danh sách chờ được hiển thị rõ ràng.

**Thông tin giao diện chính:** Vị trí chờ, tổng số người chờ, thời gian và trạng thái chuyển vé.

## 6.3. Vận hành điểm danh

`MOD-ATT-01`

### Projector Mode và QR động

**Mục đích:** Cho phép Mode trình chiếu QR điểm danh.

**Người sử dụng:** Mode

**Điều kiện sử dụng:** Sự kiện của Mode đang trong thời gian tổ chức.

**Luồng chức năng chính:**
1. Mode mở Projector Mode.
1. Hệ thống hiển thị QR lớn, tên sự kiện và đồng hồ đếm ngược.
1. QR tự làm mới sau mỗi 30 giây.
1. Sinh viên quét QR bằng camera web.

**Kết quả:** QR hiện hành được trình chiếu liên tục.

**Thông tin giao diện chính:** QR toàn màn hình, tên sự kiện và đếm ngược 30 giây.

`MOD-ATT-02`

### Theo dõi kết quả điểm danh

**Mục đích:** Cho phép Mode giám sát số người tham gia.

**Người sử dụng:** Mode

**Điều kiện sử dụng:** Sự kiện có dữ liệu điểm danh.

**Luồng chức năng chính:**
1. Mode mở danh sách điểm danh.
1. Hệ thống hiển thị sinh viên đã check-in và thời gian chính xác.
1. Mode tìm kiếm và lọc danh sách.

**Kết quả:** Mode có dữ liệu phục vụ báo cáo.

**Thông tin giao diện chính:** MSSV, họ tên, ngành, thời gian check-in và trạng thái.

## 6.4. Báo cáo

`MOD-RPT-01`

### Thống kê và xuất Excel

**Mục đích:** Cho phép Mode tổng hợp sự kiện do mình phụ trách.

**Người sử dụng:** Mode

**Điều kiện sử dụng:** Sự kiện có dữ liệu đăng ký hoặc điểm danh.

**Luồng chức năng chính:**
1. Mode xem tổng số đăng ký, vé chính thức, waitlist, hủy, điểm danh và no-show.
1. Mode chọn Xuất minh chứng.
1. Hệ thống tạo file .xlsx theo mẫu.

**Kết quả:** Mode có báo cáo và file minh chứng.

**Thông tin giao diện chính:** Chỉ số tổng quan, bộ lọc và nút tải Excel.

# 7. Yêu cầu chức năng dành cho Sinh viên

## 7.1. Khám phá và chi tiết sự kiện

`STU-EVT-01`

### Danh sách và lọc sự kiện Public

**Mục đích:** Giúp Sinh viên tìm sự kiện phù hợp.

**Người sử dụng:** Sinh viên

**Điều kiện sử dụng:** Sự kiện đã được Admin duyệt và Public.

**Luồng chức năng chính:**
1. Sinh viên xem danh sách sự kiện.
1. Sinh viên lọc theo trạng thái, thể loại, ngành hoặc thời gian.
1. Sinh viên mở trang chi tiết.

**Kết quả:** Chỉ các sự kiện Public được hiển thị.

**Thông tin giao diện chính:** Banner, tên, thời gian, địa điểm, ngành, số chỗ và điểm.

`STU-EVT-02`

### Trang chi tiết sự kiện

**Mục đích:** Cung cấp đầy đủ thông tin trước khi đăng ký.

**Người sử dụng:** Sinh viên

**Điều kiện sử dụng:** Sự kiện đang được hiển thị.

**Luồng chức năng chính:**
1. Hệ thống hiển thị banner và nội dung chi tiết.
1. Hệ thống hiển thị đơn vị tổ chức, Mode phụ trách, ngành/đối tượng, thời gian, địa điểm, sức chứa và điểm.
1. Hệ thống hiển thị trạng thái và nút đăng ký/hủy phù hợp.

**Kết quả:** Sinh viên có đủ thông tin để quyết định.

**Thông tin giao diện chính:** Banner, nội dung, lịch, địa điểm, ngành, điểm, hạn hủy và nút hành động.

## 7.2. Đăng ký, vé và danh sách chờ

`STU-REG-01`

### Đăng ký và popup xác nhận

**Mục đích:** Cho phép Sinh viên xác nhận thông tin trước khi đăng ký.

**Người sử dụng:** Sinh viên

**Điều kiện sử dụng:** Sự kiện đang mở đăng ký.

**Luồng chức năng chính:**
1. Sinh viên chọn Đăng ký.
1. Popup hiển thị tên, thời gian, địa điểm, điểm rèn luyện và thời hạn hủy.
1. Sinh viên xác nhận.
1. Hệ thống trả kết quả Vé chính thức hoặc Danh sách chờ.

**Kết quả:** Đăng ký được ghi nhận.

**Thông tin giao diện chính:** Tên sự kiện, thời gian, trạng thái vé, số thứ tự, số ghế nếu có hoặc vị trí waitlist.

`STU-REG-02`

### Xem vé và chi tiết waitlist

**Mục đích:** Giúp Sinh viên theo dõi trạng thái sau đăng ký.

**Người sử dụng:** Sinh viên

**Điều kiện sử dụng:** Sinh viên đã đăng ký.

**Luồng chức năng chính:**
1. Hệ thống hiển thị vé chính thức hoặc waitlist.
1. Nếu có vé, hiển thị số thứ tự và số ghế nếu sự kiện phân ghế.
1. Nếu ở waitlist, hiển thị vị trí hiện tại và tổng số người chờ.
1. Khi được chuyển vé, hệ thống cập nhật giao diện và gửi thông báo.

**Kết quả:** Sinh viên luôn biết trạng thái của mình.

**Thông tin giao diện chính:** Mã vé, số thứ tự, số ghế, vị trí waitlist và thông báo.

`STU-REG-03`

### Hủy đăng ký trong 48 giờ

**Mục đích:** Cho phép Sinh viên chủ động hủy trong thời gian quy định.

**Người sử dụng:** Sinh viên

**Điều kiện sử dụng:** Đăng ký còn trong 48 giờ tính từ thời điểm đăng ký và còn hiệu lực hủy.

**Luồng chức năng chính:**
1. Sinh viên mở vé và chọn Hủy đăng ký.
1. Hệ thống hiển thị thời điểm đăng ký, hạn hủy và popup xác nhận.
1. Sinh viên xác nhận.
1. Hệ thống cập nhật trạng thái và trả chỗ trống cho waitlist.

**Kết quả:** Đăng ký được hủy và lịch sử hủy được ghi nhận.

**Thông tin giao diện chính:** Thời gian còn lại, lý do/cảnh báo và kết quả hủy.

## 7.3. Lịch trình và điểm danh

`STU-CAL-01`

### Lịch sự kiện cá nhân

**Mục đích:** Hiển thị các sự kiện đã đăng ký theo thời gian.

**Người sử dụng:** Sinh viên

**Điều kiện sử dụng:** Sinh viên có đăng ký.

**Luồng chức năng chính:**
1. Sinh viên mở Lịch trình.
1. Hệ thống hiển thị lịch theo ngày, tuần, khung giờ và ca.
1. Hệ thống cảnh báo các sự kiện trùng thời gian.

**Kết quả:** Sinh viên theo dõi được lịch sự kiện cá nhân.

**Thông tin giao diện chính:** Ngày, giờ, sự kiện, địa điểm và trạng thái vé.

`STU-ATT-01`

### Quét QR kết hợp GPS

**Mục đích:** Ghi nhận sự có mặt tại sự kiện.

**Người sử dụng:** Sinh viên

**Điều kiện sử dụng:** Có vé chính thức, thiết bị hỗ trợ camera và vị trí.

**Luồng chức năng chính:**
1. Sinh viên mở máy quét và cấp quyền camera/vị trí.
1. Sinh viên quét QR động.
1. Hệ thống kiểm tra QR còn hiệu lực 30 giây.
1. Hệ thống thử nghiệm xác thực vị trí trong bán kính 100 mét từ tọa độ sự kiện.
1. Hệ thống trả kết quả và thời điểm check-in.

**Kết quả:** Lượt điểm danh thành công được ghi nhận.

**Thông tin giao diện chính:** Camera, trạng thái GPS, tên sự kiện, thời điểm và kết quả.

## 7.4. Điểm và xếp loại rèn luyện

`STU-PTS-01`

### Bảng điểm tích lũy 3 năm

**Mục đích:** Cho phép Sinh viên theo dõi điểm được cộng liên tục trong toàn khóa 3 năm.

**Người sử dụng:** Sinh viên

**Điều kiện sử dụng:** Có dữ liệu điểm rèn luyện.

**Luồng chức năng chính:**
1. Hệ thống cộng điểm từ các sự kiện đã tham gia vào tổng tích lũy.
1. Điểm không reset khi chuyển học kỳ hoặc năm học.
1. Sinh viên lọc để xem chi tiết từng học kỳ/năm nhưng tổng tích lũy vẫn xuyên suốt 3 năm.
1. Hệ thống hiển thị tổng điểm toàn chu kỳ và lịch sử phát sinh.

**Kết quả:** Sinh viên xem được điểm theo kỳ và tổng cộng dồn 3 năm.

**Thông tin giao diện chính:** Tổng tích lũy, bộ lọc thời gian, điểm theo tiêu chí và lịch sử sự kiện.

`STU-PTS-02`

### Xếp loại rèn luyện

**Mục đích:** Hiển thị xếp loại theo tổng điểm áp dụng.

**Người sử dụng:** Sinh viên

**Điều kiện sử dụng:** Hệ thống có dữ liệu điểm.

**Luồng chức năng chính:**
1. Hệ thống tổng hợp điểm theo phạm vi được chọn.
1. Hệ thống đối chiếu thang điểm xếp loại.
1. Hệ thống hiển thị xếp loại và cập nhật khi có điểm mới.

**Kết quả:** Sinh viên xem được điểm và xếp loại.

**Thông tin giao diện chính:** 90-100 Xuất sắc; 80-dưới 90 Giỏi; 65-dưới 80 Khá; 50-dưới 65 Trung bình; 35-dưới 50 Yếu; dưới 35 Kém.

`STU-PTS-03`

### Lịch sử điểm chi tiết

**Mục đích:** Cho phép đối chiếu từng khoản điểm.

**Người sử dụng:** Sinh viên

**Điều kiện sử dụng:** Có lịch sử tham gia.

**Luồng chức năng chính:**
1. Hệ thống liệt kê sự kiện đã tham gia.
1. Mỗi dòng hiển thị tiêu chí, số điểm và thời điểm check-in.
1. Sinh viên lọc theo học kỳ/năm học hoặc xem toàn chu kỳ 3 năm.

**Kết quả:** Nguồn điểm được hiển thị minh bạch.

**Thông tin giao diện chính:** Sự kiện, tiêu chí, điểm, thời điểm và Mode tổ chức.

# 8. Chức năng hệ thống tự động

## 8.1. Email và thông báo

`SYS-NTF-01`

### Thông báo kết quả duyệt

Gửi cho Mode khi Admin duyệt, từ chối hoặc yêu cầu chỉnh sửa.

`SYS-NTF-02`

### Nhắc lịch trước một ngày

Gửi cho Sinh viên có vé chính thức.

`SYS-NTF-03`

### Xác nhận đăng ký/hủy

Gửi trạng thái vé, số thứ tự, ghế hoặc waitlist.

`SYS-NTF-04`

### Xác nhận điểm danh và điểm

Gửi sau khi check-in thành công.

`SYS-NTF-05`

### Thông báo waitlist

Gửi khi Sinh viên được chuyển lên vé chính thức.

`SYS-NTF-06`

### Thông báo khóa đăng ký

Gửi khi Sinh viên đạt ngưỡng vi phạm.

## 8.2. Waitlist và xử phạt

`SYS-WAI-01`

### Tự động đẩy waitlist

**Mục đích:** Lấp chỗ trống khi có vé bị hủy.

**Người sử dụng:** Hệ thống

**Điều kiện sử dụng:** Có chỗ trống và còn người chờ.

**Luồng chức năng chính:**
1. Hệ thống chọn người đầu tiên trong danh sách chờ.
1. Hệ thống chuyển sang vé chính thức.
1. Hệ thống cập nhật số thứ tự/ghế nếu áp dụng và gửi thông báo.

**Kết quả:** Chỗ trống được sử dụng và waitlist được cập nhật.

`SYS-PEN-01`

### Theo dõi hủy và no-show

**Mục đích:** Ghi nhận hành vi làm căn cứ hạn chế đăng ký.

**Người sử dụng:** Hệ thống

**Điều kiện sử dụng:** Có lịch sử hủy hoặc vắng mặt.

**Luồng chức năng chính:**
1. Hệ thống cộng dồn số lần đăng ký rồi hủy.
1. Khi đạt 2 lần hủy, hệ thống áp dụng trạng thái hạn chế theo chính sách.
1. Hệ thống đánh dấu no-show khi có vé nhưng không điểm danh.
1. Khi đạt 3 lần no-show, hệ thống khóa đăng ký sự kiện mới.

**Kết quả:** Trạng thái vi phạm và khóa đăng ký được cập nhật.

# 9. Danh mục màn hình

| Mã | Màn hình | Vai trò > **Chức năng** --- | --- | --- |
| SCR-ADM-01 | Sự kiện chờ duyệt | Admin | Duyệt, từ chối, yêu cầu chỉnh sửa. |
| SCR-ADM-02 | Chi tiết xét duyệt | Admin | Xem toàn bộ nội dung và quyết định. |
| SCR-ADM-03 | Quản lý xóa sự kiện | Admin | Tìm và xóa sự kiện. |
| SCR-MOD-01 | Sự kiện của Mode | Mode | Quản lý vòng đời sự kiện. |
| SCR-MOD-02 | Form tạo/chỉnh sửa | Mode | Banner, nội dung, ngành, số lượng, GPS, điểm. |
| SCR-MOD-03 | Cấu hình mẫu | Mode | Chọn cấu hình dùng lại. |
| SCR-MOD-04 | Danh sách đăng ký/waitlist | Mode | Theo dõi vé, vị trí chờ, ghế. |
| SCR-MOD-05 | Projector Mode | Mode | QR động 30 giây. |
| SCR-MOD-06 | Điểm danh/Báo cáo | Mode | Theo dõi và xuất Excel. |
| SCR-STU-01 | Danh sách sự kiện | Sinh viên | Xem và lọc sự kiện Public. |
| SCR-STU-02 | Chi tiết sự kiện | Sinh viên | Banner, nội dung, đăng ký/hủy. |
| SCR-STU-03 | Vé và waitlist | Sinh viên | Số thứ tự, ghế, vị trí chờ. |
| SCR-STU-04 | Lịch trình | Sinh viên | Xem lịch sự kiện. |
| SCR-STU-05 | Quét QR | Sinh viên | Camera, GPS và điểm danh. |
| SCR-STU-06 | Điểm rèn luyện | Sinh viên | Tích lũy 3 năm, xếp loại, lịch sử. |

# 10. Yêu cầu dữ liệu chức năng

| Nhóm > **Trường tối thiểu** --- |
| Sự kiện | Tên, banner, nội dung, thể loại, Mode tạo, thời gian, địa điểm, ngành, số lượng, sức chứa, trạng thái. |
| Duyệt | Sự kiện, Mode gửi, Admin xử lý, quyết định, ghi chú và thời điểm. |
| GPS | Tọa độ địa điểm, bán kính thử nghiệm 100 m, tọa độ/độ chính xác thiết bị và kết quả. |
| Đăng ký | Sinh viên, thời điểm, loại vé, số thứ tự, số ghế, vị trí waitlist, hạn hủy 48 giờ. |
| Điểm danh | Sự kiện, Sinh viên, QR, thời điểm check-in và kết quả vị trí. |
| Điểm rèn luyện | Sự kiện nguồn, tiêu chí, số điểm, ngày cộng, dữ liệu tích lũy xuyên suốt chu kỳ 3 năm. |
| Vi phạm | Số lần hủy, số lần no-show và trạng thái khóa đăng ký. |
| Cấu hình mẫu | Địa điểm, GPS, thể loại, ngành, số lượng, tiêu chí và điểm mặc định. |

# 11. Tiêu chí nghiệm thu

## 11.1. Admin

- Chỉ thực hiện đúng phạm vi chính: xem xét, duyệt/từ chối/yêu cầu chỉnh sửa và xóa sự kiện.
- Sự kiện chỉ Public sau khi Admin duyệt.
- Có thể xem đầy đủ dữ liệu do Mode gửi trước khi quyết định.

## 11.2. Mode

- Có thể tạo sự kiện với banner, nội dung, ngành, số lượng, GPS và điểm.
- Có thể dùng lại cấu hình đã lưu.
- Có thể gửi duyệt và nhận phản hồi Admin.
- Không thể tự duyệt, tự Public hoặc xóa sự kiện.
- Có thể cancel trong giới hạn 24 giờ.
- Có thể quản lý đăng ký, waitlist, QR, điểm danh và xuất Excel cho sự kiện của mình.

## 11.3. Sinh viên

- Chỉ xem được sự kiện đã Public.
- Popup đăng ký hiển thị đủ thông tin và kết quả có số thứ tự, ghế hoặc vị trí waitlist.
- Có thể hủy trong 48 giờ tính từ thời điểm đăng ký khi còn hiệu lực.
- Có thể quét QR động và xác thực GPS thử nghiệm 100 mét.
- Có thể xem điểm cộng dồn liên tục trong 3 năm, không reset theo từng năm.
- Có thể xem xếp loại và lịch sử điểm.

## 11.4. Hệ thống

- Tự động thông báo kết quả duyệt, đăng ký, hủy, waitlist, điểm danh và khóa.
- Tự động đẩy người đầu tiên từ waitlist khi có chỗ.
- Theo dõi 2 lần hủy và 3 lần no-show theo chính sách.
- Không reset tổng điểm rèn luyện khi chuyển năm học trong chu kỳ 3 năm.

# 12. Phụ thuộc và giả định

- Tài khoản được gán một trong ba vai trò Admin, Mode hoặc Sinh viên.
- Mode luôn thuộc phạm vi quản lý của Admin.
- Nguồn dữ liệu ngành, lớp, khoa, học kỳ và tiêu chí điểm đã tồn tại.
- Thiết bị Sinh viên hỗ trợ camera và định vị; hệ thống chạy qua HTTPS.
- Dịch vụ email và mẫu Excel do đơn vị triển khai cung cấp.
- Ý nghĩa cụ thể của giới hạn cancel 24 giờ được cấu hình trong Business Rules nhưng quyền được cố định là Mode có cancel, không có xóa.

# 13. Các tài liệu đặc tả tiếp theo

1. Business Rules: cách tính mốc 24 giờ, 48 giờ, 2 lần hủy, 3 lần no-show và phạm vi khóa.
1. Exception Handling: lỗi QR, GPS, camera, email, mất mạng và dữ liệu không đồng bộ.
1. API & Data Specification: API, trạng thái, database và ràng buộc.
1. Security & Privacy: QR, định vị, dữ liệu cá nhân và lưu trữ.
1. Test Plan: test case cho Admin, Mode, Sinh viên và System Jobs.
