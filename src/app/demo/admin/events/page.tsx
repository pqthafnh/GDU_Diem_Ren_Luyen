import { MOCK_EVENTS } from "@/mocks"
import { StatusBadge } from "@/components/ui/status-badge"
import { Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminEventsPage() {
  const allEvents = MOCK_EVENTS

  return (
    <div className="container py-6 flex flex-col gap-5">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-3">
        <div>
          <h1 className="text-xl font-bold text-ink">Quản lý sự kiện (Database)</h1>
          <p className="text-[13px] text-body mt-1">Tra cứu toàn bộ sự kiện trên hệ thống và xử lý vi phạm (Xóa sự kiện).</p>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input 
            type="text" 
            placeholder="Tìm kiếm sự kiện, đơn vị tổ chức..." 
            className="w-full h-9 pl-9 pr-4 text-[13px] bg-surface border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select className="h-9 px-3 text-[13px] bg-surface border border-border rounded-md focus:outline-none focus:ring-1 focus:border-primary">
            <option value="">Tất cả trạng thái</option>
            <option value="public">Đã Public</option>
            <option value="pending">Chờ duyệt</option>
            <option value="draft">Bản nháp</option>
          </select>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden shadow-sm">
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
