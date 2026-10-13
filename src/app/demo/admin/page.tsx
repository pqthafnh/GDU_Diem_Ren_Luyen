import Link from "next/link"
import { MOCK_EVENTS } from "@/mocks"
import { ShieldCheck, Clock, CheckSquare, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"

export default function AdminDashboardPage() {
  const pendingEvents = MOCK_EVENTS.filter(e => e.status === "Chờ duyệt").slice(0, 5)

  return (
    <div className="w-full max-w-6xl mx-auto px-3.5 py-4 sm:px-6 sm:py-6 flex flex-col gap-4 sm:gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-lg sm:text-xl font-bold text-ink flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-accent-active" /> Quản trị viên
        </h1>
        <p className="text-[12px] sm:text-[13px] text-muted">Duyệt sự kiện, cấu hình điểm rèn luyện và quản lý hệ thống.</p>
      </header>

      <section className="grid gap-2.5 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        <div className="bg-surface border border-border rounded-xl p-3 sm:p-4 shadow-sm flex items-center gap-3">
          <div className="h-8.5 w-8.5 sm:h-10 sm:w-10 rounded-full bg-warning/10 text-warning-dark flex items-center justify-center shrink-0">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <p className="text-[10px] sm:text-[11px] font-medium text-muted uppercase tracking-wider">Chờ duyệt</p>
            <p className="text-lg sm:text-xl font-bold text-ink mt-0.5">{MOCK_EVENTS.filter(e => e.status === "Chờ duyệt").length}</p>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-3 sm:p-4 shadow-sm flex items-center gap-3">
          <div className="h-8.5 w-8.5 sm:h-10 sm:w-10 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0">
            <CheckSquare className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <p className="text-[10px] sm:text-[11px] font-medium text-muted uppercase tracking-wider">Đã duyệt (Tháng)</p>
            <p className="text-lg sm:text-xl font-bold text-ink mt-0.5">24</p>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-3 sm:p-4 shadow-sm flex items-center gap-3">
          <div className="h-8.5 w-8.5 sm:h-10 sm:w-10 rounded-full bg-error/10 text-error flex items-center justify-center shrink-0">
            <XCircle className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <p className="text-[10px] sm:text-[11px] font-medium text-muted uppercase tracking-wider">Đã từ chối</p>
            <p className="text-lg sm:text-xl font-bold text-ink mt-0.5">3</p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-2.5 sm:gap-3">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h2 className="text-[14px] sm:text-[15px] font-semibold text-ink">Danh sách chờ duyệt</h2>
          <Link href="/demo/admin/reviews" className="text-[12px] sm:text-[13px] font-medium text-primary hover:underline">
            Xem tất cả
          </Link>
        </div>

        {/* Mobile Card List View */}
        <div className="flex flex-col gap-2 sm:hidden">
          {pendingEvents.length > 0 ? pendingEvents.map((event) => (
            <div key={event.id} className="bg-surface border border-border rounded-xl p-3 shadow-sm flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="inline-block text-[10px] font-semibold text-warning-dark bg-warning/10 px-1.5 py-0.5 rounded mb-1">
                    Chờ duyệt
                  </span>
                  <h3 className="font-semibold text-[13px] text-ink line-clamp-2 leading-snug">{event.title}</h3>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted border-t border-border/60 pt-2">
                <span>{event.organizer} • {new Date(event.startTime).toLocaleDateString("vi-VN")}</span>
                <Link href={`/demo/admin/reviews/${event.id}`}>
                  <Button variant="outline" size="sm" className="h-7 text-[11px] px-2.5 text-primary border-primary/30">
                    Xét duyệt
                  </Button>
                </Link>
              </div>
            </div>
          )) : (
            <div className="p-4 text-center text-[12px] text-muted bg-surface border border-border rounded-xl">
              Không có sự kiện nào đang chờ duyệt.
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] text-left border-collapse">
              <thead>
                <tr className="bg-canvas-soft border-b border-border text-muted">
                  <th className="p-3 font-medium">Sự kiện</th>
                  <th className="p-3 font-medium">Đơn vị</th>
                  <th className="p-3 font-medium">Thời gian</th>
                  <th className="p-3 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pendingEvents.length > 0 ? pendingEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-canvas-soft/50 transition-colors">
                    <td className="p-3 font-medium text-ink max-w-[200px] truncate">{event.title}</td>
                    <td className="p-3 text-body">{event.organizer}</td>
                    <td className="p-3 text-body">{new Date(event.startTime).toLocaleDateString("vi-VN")}</td>
                    <td className="p-3 text-right">
                      <Link href={`/demo/admin/reviews/${event.id}`}>
                        <Button variant="outline" size="sm" className="h-7 text-[12px] px-3">Xét duyệt</Button>
                      </Link>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-muted">Không có sự kiện nào đang chờ duyệt.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
