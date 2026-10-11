import { MOCK_STUDENT } from "@/mocks"
import { Mail, Calendar, BookOpen, Shield, ChevronRight, LogOut, Settings, Bell, User, Award, CheckCircle2, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function StudentProfilePage() {
  const studentInfoList = [
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
    <div className="container py-6 flex flex-col gap-6 pb-24 md:pb-8">
      <div className="flex flex-col gap-1 border-b border-border pb-3">
        <h1 className="text-xl md:text-2xl font-bold text-ink">Hồ sơ & Thông tin cá nhân</h1>
        <p className="text-[13px] text-body">
          Thông tin sinh viên chính quy được quản lý bởi Cổng Thông Tin Đại học Gia Định (GDU)
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Cột trái: Thẻ tóm tắt sinh viên & Điểm rèn luyện */}
        <div className="w-full lg:w-1/3 flex flex-col gap-5">
          <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 flex flex-col items-center text-center">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold shadow-md">
                {MOCK_STUDENT.firstName.charAt(0)}
              </div>
              <div className="absolute bottom-0 right-0 h-6 w-6 bg-success border-2 border-white rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
            
            <h2 className="mt-4 text-[20px] font-bold text-ink">{MOCK_STUDENT.fullName}</h2>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary text-[12.5px] font-semibold mt-1.5">
              <Shield className="h-3.5 w-3.5" />
              <span>MSSV: {MOCK_STUDENT.studentId}</span>
            </div>
            
            <div className="w-full h-px bg-border my-5"></div>
            
            {/* Box điểm rèn luyện tích lũy 3 năm */}
            <div className="w-full p-4 rounded-xl bg-accent-soft/60 border border-accent/30 flex flex-col gap-2 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold uppercase tracking-wider text-accent-active flex items-center gap-1.5">
                  <Award className="h-4 w-4" />
                  Điểm rèn luyện tích lũy
                </span>
                <span className="px-2 py-0.5 rounded-full bg-accent text-navy text-[11px] font-extrabold">
                  {MOCK_STUDENT.classification}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-ink">{MOCK_STUDENT.totalPoints}</span>
                <span className="text-[13px] text-muted font-medium">/ 100 điểm (3 năm liên tục)</span>
              </div>
              <p className="text-[11.5px] text-body mt-0.5 leading-tight">
                Theo QĐ 251/2023/GDU/QĐ-HT của Hiệu trưởng Trường Đại học Gia Định.
              </p>
            </div>
          </div>

          {/* Nút Đăng xuất */}
          <Link href="/demo/login" className="w-full">
            <Button variant="outline" className="w-full h-11 text-error border-error/30 hover:bg-error/5 hover:text-error font-medium shadow-sm rounded-xl">
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất khỏi hệ thống
            </Button>
          </Link>
        </div>

        {/* Cột phải: Bảng chi tiết 8 thông tin cá nhân & Cài đặt */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          {/* Card Bảng thông tin cá nhân theo đúng quy định */}
          <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-canvas flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-ink text-[15px]">Chi tiết thông tin sinh viên</h3>
              </div>
              <span className="text-[12px] text-muted">Hồ sơ chính quy</span>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studentInfoList.map((item, index) => (
                  <div 
                    key={index} 
                    className={`p-3.5 rounded-xl border flex flex-col gap-1 transition-all ${
                      item.highlight 
                        ? 'border-primary/25 bg-primary-soft/40' 
                        : 'border-border bg-canvas/60'
                    }`}
                  >
                    <span className="text-[11.5px] font-medium text-muted uppercase tracking-wider">
                      {item.label}
                    </span>
                    <span className={`text-[15px] text-ink ${
                      item.isMono ? 'font-mono' : ''
                    } ${
                      item.isBold || item.highlight ? 'font-bold' : 'font-semibold'
                    } ${
                      item.highlight ? 'text-primary' : ''
                    }`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 p-3.5 bg-canvas rounded-xl border border-border text-[12.5px] text-muted flex items-start gap-2.5">
                <Building2 className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <span className="leading-relaxed">
                  Thông tin cá nhân được trích xuất từ cơ sở dữ liệu Phòng Quản lý Đào tạo. Trường hợp có sai sót về Họ tên, Ngày sinh hoặc Lớp sinh hoạt, sinh viên vui lòng liên hệ Văn phòng Một cửa để cập nhật.
                </span>
              </div>
            </div>
          </div>

          {/* Card Cài đặt & Tiện ích */}
          <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-canvas">
              <h3 className="font-bold text-ink text-[15px]">Tùy chọn tài khoản</h3>
            </div>
            <div className="flex flex-col">
              <Link href="/demo/settings" className="flex items-center justify-between px-6 py-4 hover:bg-canvas transition-colors border-b border-border group">
                <div className="flex items-center gap-3.5">
                  <div className="h-10 w-10 rounded-full bg-canvas border border-border flex items-center justify-center group-hover:bg-primary-soft transition-colors">
                    <Settings className="h-5 w-5 text-ink group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-semibold text-ink text-[14.5px]">Cài đặt hệ thống & Giao diện</span>
                    <span className="text-[12.5px] text-muted">Tùy chỉnh chế độ sáng / tối (Light / Dark mode)</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted group-hover:text-primary transition-colors" />
              </Link>
              
              <div className="flex items-center justify-between px-6 py-4 hover:bg-canvas transition-colors group cursor-pointer">
                <div className="flex items-center gap-3.5">
                  <div className="h-10 w-10 rounded-full bg-canvas border border-border flex items-center justify-center group-hover:bg-primary-soft transition-colors">
                    <Bell className="h-5 w-5 text-ink group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-semibold text-ink text-[14.5px]">Thông báo hệ thống</span>
                    <span className="text-[12.5px] text-muted">Nhận thông báo sự kiện và cập nhật điểm rèn luyện</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted group-hover:text-primary transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
