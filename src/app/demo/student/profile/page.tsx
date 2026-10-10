import { MOCK_STUDENT } from "@/mocks"
import { Mail, Phone, MapPin, Calendar, BookOpen, Shield, ChevronRight, LogOut, Settings, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function StudentProfilePage() {
  return (
    <div className="container py-6 flex flex-col gap-6 pb-24 md:pb-8">
      <div className="flex flex-col gap-2 border-b border-border pb-3">
        <h1 className="text-xl font-bold text-ink">Thông tin cá nhân</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile Card */}
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 flex flex-col items-center text-center">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-primary text-white flex items-center justify-center text-4xl font-bold shadow-md">
                {MOCK_STUDENT.fullName.charAt(0)}
              </div>
              <div className="absolute bottom-0 right-0 h-6 w-6 bg-success border-2 border-white rounded-full"></div>
            </div>
            
            <h2 className="mt-4 text-[20px] font-bold text-ink">{MOCK_STUDENT.fullName}</h2>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full  text-primary text-[12px] font-semibold mt-2">
              <Shield className="h-3.5 w-3.5" />
              Sinh viên
            </div>
            
            <div className="w-full h-px bg-border my-5"></div>
            
            <div className="flex flex-col gap-3 w-full">
              <div className="flex items-center gap-3 text-body text-[14px]">
                <Mail className="h-4 w-4 text-muted shrink-0" />
                <span className="truncate font-medium">{MOCK_STUDENT.studentId}@gdu.edu.vn</span>
              </div>
              <div className="flex items-center gap-3 text-body text-[14px]">
                <BookOpen className="h-4 w-4 text-muted shrink-0" />
                <span className="truncate font-medium">{MOCK_STUDENT.major}</span>
              </div>
              <div className="flex items-center gap-3 text-body text-[14px]">
                <Calendar className="h-4 w-4 text-muted shrink-0" />
                <span className="font-medium">Khóa 2024 - 2027</span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings & Info */}
        <div className="w-full md:w-2/3 flex flex-col gap-6">
          <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-canvas">
              <h3 className="font-semibold text-ink text-[15px]">Tùy chọn tài khoản</h3>
            </div>
            <div className="flex flex-col">
              <Link href="/demo/settings" className="flex items-center justify-between px-5 py-4 hover:bg-canvas transition-colors border-b border-border group">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-canvas border border-border flex items-center justify-center group-hover: transition-colors">
                    <Settings className="h-5 w-5 text-ink group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-ink text-[15px]">Cài đặt hệ thống</span>
                    <span className="text-[13px] text-muted">Ngôn ngữ, giao diện sáng/tối</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted group-hover:text-primary transition-colors" />
              </Link>
              
              <button className="flex items-center justify-between px-5 py-4 hover:bg-canvas transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-canvas border border-border flex items-center justify-center group-hover: transition-colors">
                    <Bell className="h-5 w-5 text-ink group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-ink text-[15px]">Thông báo</span>
                    <span className="text-[13px] text-muted">Quản lý nhận thông báo sự kiện</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted group-hover:text-primary transition-colors" />
              </button>
            </div>
          </div>

          <Link href="/demo/login" className="w-full">
            <Button variant="outline" className="w-full h-12 text-error border-error/30 hover:bg-error/5 hover:text-error font-medium shadow-sm">
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
