import Link from "next/link"
import { MOCK_EVENTS } from "@/mocks"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { Plus, Filter, Search } from "lucide-react"

export default function ModeEventsPage() {
  const modeEvents = MOCK_EVENTS

  return (
    <div className="container py-6 flex flex-col gap-5">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-3">
        <div>
          <h1 className="text-xl font-bold text-ink">Quản lý sự kiện</h1>
          <p className="text-[13px] text-body mt-1">Danh sách tất cả sự kiện do bạn tổ chức.</p>
        </div>
        <Link href="/demo/mode/events/new">
          <Button variant="primary" className="w-full md:w-auto h-9 text-[13px]">
            <Plus className="h-4 w-4 mr-1.5" /> Tạo sự kiện mới
          </Button>
        </Link>
      </header>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input 
            type="text" 
            placeholder="Tìm kiếm sự kiện..." 
            className="w-full h-9 pl-9 pr-4 text-[13px] bg-surface border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-9 text-[13px] px-3"><Filter className="h-4 w-4 mr-1.5" /> Bộ lọc</Button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left border-collapse">
            <thead>
              <tr className="bg-canvas-soft border-b border-border text-muted">
                <th className="p-3 font-medium">Tên sự kiện</th>
                <th className="p-3 font-medium">Phân loại</th>
                <th className="p-3 font-medium">Thời gian bắt đầu</th>
                <th className="p-3 font-medium">Trạng thái</th>
                <th className="p-3 font-medium">Vé</th>
                <th className="p-3 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {modeEvents.map((event) => (
                <tr key={event.id} className="hover:bg-canvas-soft/50 transition-colors">
                  <td className="p-3 font-medium text-ink max-w-[250px] truncate" title={event.title}>{event.title}</td>
                  <td className="p-3 text-body">{event.category}</td>
                  <td className="p-3 text-body">{new Date(event.startTime).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}</td>
                  <td className="p-3"><StatusBadge status={event.status} variant="default" className="text-[10px] px-1.5 py-0.5" /></td>
                  <td className="p-3 text-body">{event.registeredCount}/{event.capacity}</td>
                  <td className="p-3 text-right">
                    <Link href={`/demo/mode/events/${event.id}`}>
                      <Button variant="outline" size="sm" className="h-7 text-[12px] px-2.5">Chi tiết</Button>
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
