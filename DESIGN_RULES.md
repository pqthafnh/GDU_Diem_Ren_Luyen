DESIGN_RULES.md
1. Mục tiêu thiết kế
Hệ thống GDU Event & Training là một ứng dụng vận hành dành cho môi trường đại học, không phải landing page marketing và không phải concept showcase.

Giao diện phải tạo cảm giác:

Chính thống.
Rõ ràng.
Thực dụng.
Dễ học.
Thân thiện với sinh viên.
Đủ nghiêm túc cho Admin và MOD.
Có mật độ thông tin hợp lý.
Có thể triển khai thực tế.
Giao diện không được mang cảm giác:

AI-generated template.
Startup SaaS dashboard chung chung.
Fintech dashboard.
Landing page marketing.
Website luxury.
Giao diện futuristic.
Concept Dribbble khó triển khai.
2. Thứ tự ưu tiên
Khi phải lựa chọn giữa thẩm mỹ và khả năng sử dụng, ưu tiên theo thứ tự:

Hoàn thành tác vụ.
Hiểu đúng trạng thái.
Đọc và quét thông tin nhanh.
Tính nhất quán.
Khả năng truy cập.
Responsive.
Tính thẩm mỹ.
Không hy sinh khả năng sử dụng để tạo giao diện bắt mắt.

3. Một màn hình, một mục tiêu chính
Mỗi màn hình phải có một nhiệm vụ chính rõ ràng.

Ví dụ:

Danh sách sự kiện: tìm và chọn sự kiện.
Chi tiết sự kiện: hiểu thông tin và đăng ký.
Vé của tôi: theo dõi trạng thái tham gia.
Điểm rèn luyện: hiểu tổng điểm và nguồn phát sinh điểm.
MOD tạo sự kiện: hoàn thành thông tin và gửi duyệt.
Admin xét duyệt: đọc, đối chiếu và quyết định.
Không đặt nhiều CTA cùng cấp trong cùng một màn hình.

Mỗi màn hình chỉ nên có một primary action nổi bật.

Các hành động còn lại dùng:

Secondary button.
Text button.
Overflow menu.
Contextual action.
4. Không biến mọi thứ thành card
Chỉ dùng card khi nội dung:

Có ranh giới độc lập.
Có thể được chọn.
Có hành động riêng.
Đại diện một thực thể.
Cần phân tách rõ khỏi nội dung xung quanh.
Không dùng card cho:

Một heading và một đoạn mô tả đơn giản.
Từng trường trong form.
Từng dòng metadata.
Nội dung vốn đã nằm trong một card.
Mỗi section của một trang dài.
Không lồng quá hai cấp card.

Ưu tiên dùng:

Section.
Divider.
Spacing.
Group label.
Table row.
List row.
thay vì đặt mọi nội dung trong card.

5. Giới hạn dashboard cards
Không mặc định tạo hàng 4 đến 6 statistical cards trên mọi dashboard.

Chỉ hiển thị chỉ số có tác dụng với quyết định hoặc thao tác tiếp theo.

Admin
Admin chỉ cần tập trung:

Sự kiện chờ duyệt.
Sự kiện cần chỉnh sửa.
Sự kiện đã xử lý gần đây.
Không hiển thị:

Tổng sinh viên toàn hệ thống.
Tổng check-in.
Tỷ lệ tham dự.
Các chart vận hành không thuộc công việc Admin.
MOD
MOD có thể xem:

Sự kiện sắp diễn ra.
Chờ duyệt.
Tổng đăng ký.
Lượt check-in gần nhất.
Không hiển thị chart nếu danh sách hoặc con số trực tiếp dễ hiểu hơn.

Sinh viên
Sinh viên có thể xem:

Sự kiện sắp tới.
Trạng thái vé.
Tổng điểm tích lũy.
Xếp loại hiện tại.
Không tạo dashboard doanh nghiệp cho Sinh viên.

6. Không dùng chart để trang trí
Chỉ dùng chart khi chart trả lời được một câu hỏi cụ thể.

Ví dụ hợp lý:

Tỷ lệ check-in của một sự kiện.
Phân bổ điểm theo tiêu chí.
Số người đăng ký so với sức chứa.
Tỷ lệ tham dự theo sự kiện.
Không dùng chart cho:

Một con số duy nhất.
Dữ liệu ít hơn ba điểm.
Dữ liệu có thể đọc nhanh bằng danh sách.
Mục đích lấp khoảng trống.
Mỗi chart phải có:

Tiêu đề mô tả câu hỏi.
Nhãn dễ hiểu.
Legend khi cần.
Giá trị hoặc tooltip.
Empty state.
Mô tả text thay thế khi phù hợp.
7. Mật độ thông tin
Ứng dụng phải có mật độ vừa phải, không quá thưa như landing page.

Không sử dụng:

Hero section lớn trong app.
Heading chiếm gần toàn màn hình.
Khoảng trống trang trí quá lớn.
Card cao nhưng chỉ chứa một dòng thông tin.
Section padding 96px trong dashboard hoặc form.
Trong màn hình ứng dụng:

Page title nên rõ nhưng không cạnh tranh với nội dung.
Nội dung chính phải xuất hiện trong viewport đầu tiên.
Primary action phải dễ tìm.
Filter không được chiếm nhiều chiều cao hơn dữ liệu.
8. Typography
Giữ typography theo design system.

Quy tắc bổ sung:

Không dùng display typography trong dashboard, form và table.
Page title chỉ dùng một cấp heading rõ ràng.
Không dùng uppercase dài cho heading.
Không dùng chữ nghiêng để tạo phong cách.
Không dùng quá ba mức font weight trên một màn hình.
Body copy phải ngắn, trực tiếp và cụ thể.
Label không được giống placeholder.
9. Màu sắc
Tuân thủ DESIGN-gia-dinh-university.md.

Quy tắc bổ sung:

Navy là primary UI color.
Gold là accent có kiểm soát.
Không dùng gold cho đoạn văn.
Không dùng navy background cho toàn bộ dashboard.
Không dùng gradient navy-gold cho các component thông thường.
Không dùng nhiều hơn một accent nổi bật trong cùng một card.
Không tô nền màu cho mọi section.
Nền ứng dụng chủ yếu là canvas và white.
Trạng thái phải dùng semantic color.
10. Shadow và border
Ưu tiên border nhẹ hơn shadow.

Card mặc định:

Nền trắng.
Border nhẹ.
Shadow rất nhẹ hoặc không có.
Chỉ dùng shadow rõ cho:

Dialog.
Dropdown.
Popover.
Sticky mobile action bar.
Element thực sự nổi phía trên mặt phẳng khác.
Không dùng:

Shadow đen đậm.
Shadow nhiều lớp.
Glow xanh.
Glow vàng.
Inner shadow trang trí.
11. Icon
Icon phải hỗ trợ nhận biết, không dùng để trang trí tràn lan.

Không đặt icon trước mọi heading.

Dùng icon cho:

Navigation.
Hành động quen thuộc.
Trạng thái.
Metadata cần quét nhanh.
Empty state có chủ đích.
Giữ một icon library thống nhất.

Không trộn:

Outline icon.
Filled icon.
Emoji.
3D icon.
Illustration icon.
trong cùng một luồng giao diện.

12. Badge và trạng thái
Badge chỉ dùng cho:

Trạng thái sự kiện.
Trạng thái đăng ký.
Vai trò khi thật sự cần.
Cảnh báo ngắn.
Xếp loại.
Không biến:

Thể loại.
Địa điểm.
Ngày giờ.
MOD tổ chức.
Mọi metadata.
thành badge.

Metadata thông thường nên dùng text hoặc icon + text.

Badge luôn có text, không chỉ có màu.

13. Button hierarchy
Mỗi khu vực action có tối đa:

Một primary button.
Một secondary button.
Các hành động phụ dạng text hoặc menu.
Không đặt ba button cùng độ nổi bật cạnh nhau.

Quy tắc:

Primary: navy.
Secondary: outline.
Tertiary: text.
Accent gold: chỉ dùng khi có lý do nghiệp vụ rõ ràng.
Delete hoặc reject: semantic error.
Cancel dialog: không dùng cùng màu và độ nổi bật với confirm action.
Label button phải dùng động từ rõ ràng:

Đăng ký.
Gửi duyệt.
Lưu bản nháp.
Yêu cầu chỉnh sửa.
Xác nhận hủy.
Xóa sự kiện.
Tránh label chung chung:

OK.
Submit.
Continue.
Click here.
Confirm.
14. Form design
Form phải được chia theo logic nghiệp vụ, không chia chỉ để tạo nhiều card.

MOD tạo sự kiện được chia thành:

Thông tin chung.
Thời gian và địa điểm.
Đối tượng và sức chứa.
Đăng ký.
Điểm rèn luyện.
Xem trước và gửi duyệt.
Quy tắc:

Label luôn hiển thị.
Required field được đánh dấu rõ.
Help text chỉ xuất hiện khi cần.
Error nằm ngay dưới trường.
Không dùng placeholder thay label.
Trường liên quan được đặt gần nhau.
Action form giữ vị trí nhất quán.
Mobile một cột.
Desktop chỉ dùng nhiều cột cho trường ngắn.
15. Tables và lists
Table chỉ dùng khi cần so sánh nhiều bản ghi theo cùng cấu trúc.

Mobile:

Không ép nguyên bảng desktop vào màn hình nhỏ.
Chuyển thành data card hoặc row summary.
Chỉ dùng horizontal scroll khi việc so sánh cột là quan trọng.
Action quan trọng không được nằm ngoài viewport mà không có dấu hiệu.
Desktop:

Giữ số cột cần thiết.
Cột action có chiều rộng tối thiểu.
Không để mọi giá trị thành badge.
Header ngắn và rõ.
Empty state nằm trong vùng dữ liệu.
16. Mobile-first thật sự
Mobile không phải desktop xếp lại thành một cột.

Trong mobile:

Ưu tiên nội dung thiết yếu.
Ẩn metadata phụ nhưng vẫn cho truy cập.
Dùng sticky action khi có một hành động chính.
Dùng bottom sheet cho filter và action ngắn.
Dùng bottom navigation cho Sinh viên nếu phù hợp.
Không sử dụng persistent sidebar.
Không thu nhỏ chart, table hoặc form đến mức khó sử dụng.
Không đặt action quan trọng chỉ trong hover state.
Không để bottom navigation che sticky action.
Kiểm tra tối thiểu ở:

320px.
360px.
390px.
768px.
1024px.
1440px.
17. Nội dung giao diện
Nội dung phải cụ thể, súc tích và giống sản phẩm thật.

Không dùng:

Lorem ipsum.
User Name.
Event Name.
Sample data.
Generic placeholder text.
Dùng dữ liệu như:

“Hội thảo Kỹ năng phỏng vấn và xây dựng CV”.
“Phòng A.805, cơ sở Tân Sơn Nhất”.
“15 điểm rèn luyện”.
“Còn 24/120 chỗ”.
“Vị trí chờ: 5/18”.
“Hạn hủy: 20:00, 18/10/2026”.
Không tạo số liệu hoàn hảo hoặc đối xứng một cách giả tạo.

18. Vai trò không phải theme
Admin, MOD và Sinh viên dùng cùng một design system.

Sự khác biệt nằm ở:

Navigation.
Thông tin ưu tiên.
Hành động được phép.
Mật độ dữ liệu.
Workflow.
Không tạo:

Admin theme tối.
MOD theme vàng.
Sinh viên theme xanh.
nếu không có yêu cầu riêng.

19. Trạng thái nghiệp vụ
Mỗi trạng thái phải có:

Label.
Màu semantic.
Mô tả ngắn khi cần.
Action phù hợp.
Ví dụ:

Bản nháp.
Chờ duyệt.
Yêu cầu chỉnh sửa.
Public.
Đang diễn ra.
Đã kết thúc.
Đã cancel.
Vé chính thức.
Waitlist.
Đã check-in.
No-show.
Không sử dụng cùng một màu cho các trạng thái có ý nghĩa khác nhau.

20. Không tự phát minh chức năng
Agent không được tự thêm chức năng chỉ để làm giao diện phong phú.

Không tự thêm:

Chatbot.
AI assistant.
Social feed.
Leaderboard.
Achievement system.
Dark MOD.
Gamification.
Calendar integration.
Recommendation AI.
Analytics chart.
trừ khi có trong PRD hoặc được yêu cầu trực tiếp.

21. Quy trình duyệt thiết kế
Mỗi phase phải tạo screenshot tại:

Mobile 390px.
Tablet 768px.
Desktop 1440px.
Screenshot bắt buộc gồm:

Màn hình mặc định.
Một trạng thái empty hoặc loading.
Một dialog hoặc bottom sheet.
Một màn hình có dữ liệu dày.
Một màn hình có primary action.
Agent phải tự kiểm tra:

Màn hình có giống SaaS template chung chung không?
Có quá nhiều card không?
Có quá nhiều badge không?
Có dùng chart không cần thiết không?
Có quá nhiều khoảng trống không?
Mobile có thực sự được thiết kế lại không?
CTA có đúng hierarchy không?
Admin có bị biến thành dashboard vận hành không?
Có chức năng nào agent tự phát minh không?
Nếu câu trả lời là có, agent phải sửa trước khi gửi duyệt.

22. Checklist chống giao diện AI-generated
Trước khi hoàn thành một màn hình, kiểm tra:

Có đúng một mục tiêu chính.
Có tối đa một primary CTA trong mỗi action area.
Không đặt mọi nội dung trong card.
Không lồng card quá hai cấp.
Không thêm chart chỉ để trang trí.
Không có gradient hoặc glow không cần thiết.
Không dùng quá nhiều badge.
Không đặt icon trước mọi heading.
Không dùng heading quá lớn trong app.
Dữ liệu demo cụ thể và hợp lý.
Empty state có nội dung và next action hữu ích.
Mobile không phải desktop bị ép nhỏ.
Không có chức năng ngoài PRD.
Vai trò đúng quyền.
Màu trạng thái đúng semantic.
Typography, spacing và radius không bị tự ý thay đổi.