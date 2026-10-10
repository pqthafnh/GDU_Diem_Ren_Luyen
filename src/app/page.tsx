import Link from "next/link"
import { Users, LayoutDashboard, ShieldCheck } from "lucide-react"

export default function RoleSelectorPage() {
  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full flex flex-col gap-8">
        <div className="text-center flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-ink">GDU Event & Training</h1>
          <p className="text-body">Vui lòng chọn vai trò để trải nghiệm bản demo</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/demo/student" className="bg-surface border border-border rounded-xl p-6 flex flex-col items-center text-center gap-4 hover:border-primary hover:shadow-md transition-all">
            <div className="h-16 w-16 rounded-full bg-primary-soft text-primary flex items-center justify-center">
              <Users className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink">Sinh viên</h2>
              <p className="text-[13px] text-muted mt-1">Xem, đăng ký sự kiện, quét QR và theo dõi điểm rèn luyện.</p>
            </div>
          </Link>

          <Link href="/demo/MOD" className="bg-surface border border-border rounded-xl p-6 flex flex-col items-center text-center gap-4 hover:border-primary hover:shadow-md transition-all">
            <div className="h-16 w-16 rounded-full bg-primary-soft text-primary flex items-center justify-center">
              <LayoutDashboard className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink">MOD (Tổ chức)</h2>
              <p className="text-[13px] text-muted mt-1">Tạo sự kiện, vận hành, điểm danh và quản lý người tham gia.</p>
            </div>
          </Link>

          <Link href="/demo/admin" className="bg-surface border border-border rounded-xl p-6 flex flex-col items-center text-center gap-4 hover:border-accent hover:shadow-md transition-all">
            <div className="h-16 w-16 rounded-full bg-accent-soft text-accent-active flex items-center justify-center">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink">Admin</h2>
              <p className="text-[13px] text-muted mt-1">Duyệt sự kiện, cấu hình điểm rèn luyện và giám sát hệ thống.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
