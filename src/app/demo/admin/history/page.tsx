import Link from "next/link"
import { MOCK_EVENTS } from "@/mocks"
import { StatusBadge } from "@/components/ui/status-badge"
import { Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminHistoryPage() {
  const processedEvents = MOCK_EVENTS.filter(e => e.status !== "Chờ duyệt" && e.status !== "Bản nháp")

  return (
    <div className="w-full max-w-6xl mx-auto px-3.5 py-4 sm:px-6 sm:py-6 flex flex-col gap-3.5 sm:gap-5">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-ink">Lịch sử xử lý</h1>
          <p className="text-[12px] sm:text-[13px] text-body mt-0.5 sm:mt-1">Danh sách các sự kiện đã được Admin phê duyệt hoặc từ chối.</p>
        </div>
      </header>

      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input 
            type="text" 
            placeholder="Tìm kiếm sự kiện, đơn vị..." 
            className="w-full h-8.5 sm:h-9 pl-9 pr-4 text-[12px] sm:text-[13px] bg-surface border border-border rounded-lg sm:rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-8.5 sm:h-9 text-[12px] sm:text-[13px] px-3"><Filter className="h-4 w-4 mr-1.5" /> Lọc trạng thái</Button>
        </div>
      </div>

      {/* Mobile Card List View */}
      <div className="flex flex-col gap-2.5 sm:hidden">
        {processedEvents.map((event) => (
          <div key={event.id} className="bg-surface border border-border rounded-xl p-3 shadow-sm flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="inline-block text-[10px] font-semibold text-primary bg-primary-soft px-1.5 py-0.5 rounded mb-1">
                  {event.category}
                </span>
                <h3 className="font-semibold text-[13px] text-ink line-clamp-2 leading-snug">{event.title}</h3>
              </div>
              <StatusBadge status={event.status} variant="default" className="text-[10px] px-1.5 py-0.5 shrink-0" />
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted border-t border-border/60 pt-2">
              <span className="truncate max-w-[200px]">{event.organizer} • {new Date(event.startTime).toLocaleDateString("vi-VN")}</span>
              <Link href={`/demo/admin/reviews/${event.id}`}>
                <Button variant="outline" size="sm" className="h-7 text-[11px] px-2.5 text-primary border-primary/30">
                  Xem
                </Button>
              </Link>
            </div>
          </div>
        ))}
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
                <th className="p-3 font-medium">Trạng thái</th>
                <th className="p-3 font-medium text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {processedEvents.map((event) => (
                <tr key={event.id} className="hover:bg-canvas-soft/50 transition-colors">
                  <td className="p-3 font-medium text-ink max-w-[250px] truncate" title={event.title}>{event.title}</td>
                  <td className="p-3 text-body">{event.organizer}</td>
                  <td className="p-3 text-body">{new Date(event.startTime).toLocaleDateString("vi-VN")}</td>
                  <td className="p-3"><StatusBadge status={event.status} variant="default" className="text-[10px] px-1.5 py-0.5" /></td>
                  <td className="p-3 text-right">
                    <Link href={`/demo/admin/reviews/${event.id}`}>
                      <Button variant="ghost" size="sm" className="h-7 text-[12px] px-2 text-primary">Xem</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
