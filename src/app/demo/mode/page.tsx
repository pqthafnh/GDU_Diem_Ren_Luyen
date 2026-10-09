import Link from "next/link"
import { MOCK_EVENTS } from "@/mocks"
import { Calendar, Users, FileText, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"

export default function ModeDashboardPage() {
  const modeEvents = MOCK_EVENTS.slice(0, 5) // Mock events managed by this Mode

  return (
    <div className="container py-6 flex flex-col gap-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-ink">Không gian làm việc (Mode)</h1>
          <p className="text-[13px] text-muted mt-1">Quản lý và vận hành sự kiện, kiểm soát người tham dự và điểm danh.</p>
        </div>
        <Link href="/demo/mode/events/new">
          <Button variant="primary" className="w-full md:w-auto h-9 text-[13px]">
            <Plus className="h-4 w-4 mr-1.5" /> Tạo sự kiện mới
          </Button>
        </Link>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="bg-surface border border-border rounded-lg p-4 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-primary-soft text-primary flex items-center justify-center shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted uppercase tracking-wider">Sự kiện đang quản lý</p>
            <p className="text-xl font-bold text-ink mt-0.5">12</p>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted uppercase tracking-wider">Lượt sinh viên đăng ký</p>
            <p className="text-xl font-bold text-ink mt-0.5">3,450</p>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-warning/10 text-warning-dark flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted uppercase tracking-wider">Chờ Admin duyệt</p>
            <p className="text-xl font-bold text-ink mt-0.5">2</p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h2 className="text-[15px] font-semibold text-ink">Sự kiện gần đây</h2>
          <Link href="/demo/mode/events" className="text-[13px] font-medium text-primary hover:underline">
            Xem tất cả
          </Link>
        </div>

        <div className="bg-surface border border-border rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] text-left border-collapse">
              <thead>
                <tr className="bg-canvas-soft border-b border-border text-muted">
                  <th className="p-3 font-medium">Sự kiện</th>
                  <th className="p-3 font-medium">Thời gian</th>
                  <th className="p-3 font-medium">Trạng thái</th>
                  <th className="p-3 font-medium">Đăng ký</th>
                  <th className="p-3 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {modeEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-canvas-soft/50 transition-colors">
                    <td className="p-3 font-medium text-ink max-w-[200px] truncate" title={event.title}>{event.title}</td>
                    <td className="p-3 text-body">{new Date(event.startTime).toLocaleDateString("vi-VN")}</td>
                    <td className="p-3"><StatusBadge status={event.status} variant="default" className="text-[10px] px-1.5 py-0.5" /></td>
                    <td className="p-3 text-body">{event.registeredCount} / {event.capacity}</td>
                    <td className="p-3 text-right">
                      <Link href={`/demo/mode/events/${event.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 text-[12px] px-2 text-primary">Quản lý</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
