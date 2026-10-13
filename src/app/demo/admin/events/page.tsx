import { MOCK_EVENTS } from "@/mocks"
import { StatusBadge } from "@/components/ui/status-badge"
import { Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminEventsPage() {
  const allEvents = MOCK_EVENTS

  return (
    <div className="w-full max-w-6xl mx-auto px-3.5 py-4 sm:px-6 sm:py-6 flex flex-col gap-3.5 sm:gap-5">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-ink">Quản lý sự kiện (Database)</h1>
          <p className="text-[12px] sm:text-[13px] text-body mt-0.5 sm:mt-1">Tra cứu toàn bộ sự kiện trên hệ thống và xử lý vi phạm (Xóa sự kiện).</p>
        </div>
      </header>

      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input 
            type="text" 
            placeholder="Tìm kiếm sự kiện, đơn vị tổ chức..." 
            className="w-full h-8.5 sm:h-9 pl-9 pr-4 text-[12px] sm:text-[13px] bg-surface border border-border rounded-lg sm:rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select className="h-8.5 sm:h-9 px-3 text-[12px] sm:text-[13px] bg-surface border border-border rounded-lg sm:rounded-md focus:outline-none focus:ring-1 focus:border-primary">
            <option value="">Tất cả trạng thái</option>
            <option value="public">Đã Public</option>
            <option value="pending">Chờ duyệt</option>
            <option value="draft">Bản nháp</option>
          </select>
        </div>
      </div>

      {/* Mobile Card List View */}
      <div className="flex flex-col gap-2.5 sm:hidden">
        {allEvents.map((event) => (
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
              <span className="truncate max-w-[200px]">{event.organizer}</span>
              <Button variant="ghost" size="sm" className="h-7 text-[11px] px-2 text-error hover:bg-error/10">
                <Trash2 className="h-3 w-3 mr-1" /> Xóa
              </Button>
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
                <th className="p-3 font-medium">Đơn vị / MOD</th>
                <th className="p-3 font-medium">Trạng thái</th>
                <th className="p-3 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allEvents.map((event) => (
                <tr key={event.id} className="hover:bg-canvas-soft/50 transition-colors">
                  <td className="p-3 font-medium text-ink max-w-[250px] truncate" title={event.title}>{event.title}</td>
                  <td className="p-3 text-body">{event.organizer}</td>
                  <td className="p-3"><StatusBadge status={event.status} variant="default" className="text-[10px] px-1.5 py-0.5" /></td>
                  <td className="p-3 text-right">
                    <Button variant="danger" size="icon" className="h-7 w-7 bg-error/10 text-error hover:bg-error hover:text-white" title="Xóa sự kiện">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
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
