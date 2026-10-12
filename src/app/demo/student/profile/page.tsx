import { MOCK_STUDENT } from "@/mocks"
import { Mail, Calendar, BookOpen, Shield, ChevronRight, LogOut, Settings, Bell, User, CheckCircle2, GraduationCap, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function StudentProfilePage() {
  const academicFields = [
    { label: "Mã số sinh viên (MSSV)", value: MOCK_STUDENT.studentId, isMono: true, highlight: true },
    { label: "Họ và tên đệm", value: MOCK_STUDENT.lastName },
    { label: "Tên sinh viên", value: MOCK_STUDENT.firstName, isBold: true },
    { label: "Giới tính", value: MOCK_STUDENT.gender },
    { label: "Ngày sinh", value: MOCK_STUDENT.birthDate },
    { label: "Lớp sinh hoạt", value: MOCK_STUDENT.className, isMono: true },
    { label: "Ngành đào tạo", value: MOCK_STUDENT.major },
    { label: "Email trường (Email GDU)", value: MOCK_STUDENT.schoolEmail, isMono: true, highlight: true },
  ]

  return (
    <div className="container max-w-5xl py-6 md:py-8 flex flex-col gap-6 pb-24 md:pb-10">
      {/* Tiêu đề trang */}
      <div className="flex flex-col gap-1 border-b border-border/80 pb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-ink tracking-tight">Hồ sơ cá nhân</h1>
        <p className="text-[13.5px] text-muted">
          Thông tin sinh viên chính quy được quản lý bởi Cổng Thông Tin Đại học Gia Định (GDU)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Cột trái: Thẻ nhận diện sinh viên */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <div className="bg-surface rounded-2xl border border-border/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative mb-3">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-[#2a558c] text-white flex items-center justify-center text-3xl font-bold shadow-md ring-4 ring-primary-soft">
                {MOCK_STUDENT.firstName.charAt(0)}
              </div>
              <div className="absolute bottom-1 right-1 h-5 w-5 bg-success border-2 border-white rounded-full flex items-center justify-center shadow-sm" title="Tài khoản đang hoạt động">
                <CheckCircle2 className="h-3 w-3 text-white" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-ink">{MOCK_STUDENT.fullName}</h2>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary text-[12px] font-semibold mt-2">
              <Shield className="h-3.5 w-3.5" />
              <span>MSSV: {MOCK_STUDENT.studentId}</span>
            </div>

            <div className="w-full h-px bg-border/70 my-5"></div>

            {/* Thông tin vắn tắt */}
            <div className="w-full flex flex-col gap-3 text-left text-[13.5px]">
              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted">Bậc đào tạo</span>
                <span className="font-medium text-ink">Đại học Chính quy</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted">Khóa học</span>
                <span className="font-medium text-ink">K18 (2024 - 2027)</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted">Tình trạng</span>
                <span className="inline-flex items-center gap-1.5 text-success font-semibold text-[13px]">
                  <span className="h-2 w-2 rounded-full bg-success"></span>
                  Đang học
                </span>
              </div>
            </div>
          </div>

          {/* Nút Đăng xuất */}
          <Link href="/demo/login" className="w-full">
            <Button 
              variant="outline" 
              className="w-full h-11 text-error border-border hover:bg-error/5 hover:border-error/30 hover:text-error text-[13.5px] font-medium rounded-xl transition-colors shadow-sm"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất khỏi hệ thống
            </Button>
          </Link>
        </div>

        {/* Cột phải: Chi tiết thông tin sinh viên & Cài đặt */}
        <div className="md:col-span-8 flex flex-col gap-6">
          {/* Card Thông tin sinh viên (Thiết kế thanh lịch, không border từng ô) */}
          <div className="bg-surface rounded-2xl border border-border/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="px-6 py-5 sm:py-6 border-b border-border/80 flex items-center justify-between bg-canvas/40 min-h-[72px]">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0">
                  <User className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-ink text-[15.5px] leading-snug">Thông tin sinh viên</h3>
                  <p className="text-[12.5px] text-muted leading-relaxed">Dữ liệu hồ sơ gốc theo hệ thống quản lý đào tạo</p>
                </div>
              </div>
            </div>

            {/* Danh sách thông tin dạng phẳng 2 cột tinh tế */}
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 sm:gap-y-6">
                {academicFields.map((field, idx) => (
                  <div key={idx} className="flex flex-col gap-1.5 pb-3.5 sm:pb-4 border-b border-border/50">
                    <span className="text-[12px] font-medium text-muted uppercase tracking-wider">
                      {field.label}
                    </span>
                    <span className={`text-[15px] leading-normal break-words ${
                      field.highlight ? 'text-primary font-bold' : 'text-ink font-semibold'
                    } ${field.isMono ? 'font-mono' : ''}`}>
                      {field.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Ghi chú chân trang nhẹ nhàng */}
              <div className="mt-8 pt-5 border-t border-border/60 flex items-start gap-2.5 text-[12.5px] text-muted">
                <GraduationCap className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <p className="leading-relaxed">
                  Để yêu cầu điều chỉnh các thông tin lý lịch cá nhân (Họ tên, Ngày sinh, CCCD), sinh viên vui lòng liên hệ trực tiếp <strong>Văn phòng Một cửa (Phòng Quản lý Đào tạo)</strong> của Nhà trường.
                </p>
              </div>
            </div>
          </div>

          {/* Card Cài đặt & Tiện ích */}
          <div className="bg-surface rounded-2xl border border-border/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="px-6 py-5 border-b border-border/80 bg-canvas/40">
              <h3 className="font-bold text-ink text-[15px]">Tùy chọn tài khoản</h3>
            </div>
            <div className="divide-y divide-border/60">
              <Link 
                href="/demo/settings" 
                className="flex items-center justify-between px-6 py-4 hover:bg-canvas/50 transition-colors group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="h-9 w-9 rounded-xl bg-canvas border border-border/80 flex items-center justify-center text-muted group-hover:text-primary group-hover:bg-primary-soft transition-colors">
                    <Settings className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-ink text-[14.5px] group-hover:text-primary transition-colors">
                      Cài đặt hệ thống & Giao diện
                    </span>
                    <span className="text-[12.5px] text-muted">Tùy chỉnh chế độ sáng / tối (Light / Dark mode)</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </Link>
              
              <div className="flex items-center justify-between px-6 py-4 hover:bg-canvas/50 transition-colors group cursor-pointer">
                <div className="flex items-center gap-3.5">
                  <div className="h-9 w-9 rounded-xl bg-canvas border border-border/80 flex items-center justify-center text-muted group-hover:text-primary group-hover:bg-primary-soft transition-colors">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-ink text-[14.5px] group-hover:text-primary transition-colors">
                      Thông báo hệ thống
                    </span>
                    <span className="text-[12.5px] text-muted">Nhận thông báo sự kiện và cập nhật điểm rèn luyện</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
