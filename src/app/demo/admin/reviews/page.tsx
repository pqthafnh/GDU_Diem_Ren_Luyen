import Link from "next/link"
import { MOCK_EVENTS } from "@/mocks"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export default function AdminReviewsPage() {
  const pendingEvents = MOCK_EVENTS.filter(e => e.status === "Chờ duyệt")

  return (
    <div className="container py-6 flex flex-col gap-5">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-3">
        <div>
          <h1 className="text-xl font-bold text-ink">Chờ duyệt</h1>
          <p className="text-[13px] text-body mt-1">Danh sách sự kiện yêu cầu phê duyệt từ Mode.</p>
        </div>
      </header>

      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <input 
          type="text" 
          placeholder="Tìm kiếm sự kiện, đơn vị..." 
          className="w-full h-9 pl-9 pr-4 text-[13px] bg-surface border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
        />
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left border-collapse">
            <thead>
              <tr className="bg-canvas-soft border-b border-border text-muted">
                <th className="p-3 font-medium">Sự kiện</th>
                <th className="p-3 font-medium">Đơn vị tổ chức</th>
                <th className="p-3 font-medium">Phân loại</th>
                <th className="p-3 font-medium">Điểm rèn luyện</th>
                <th className="p-3 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pendingEvents.length > 0 ? pendingEvents.map((event) => (
                <tr key={event.id} className="hover:bg-canvas-soft/50 transition-colors">
                  <td className="p-3 font-medium text-ink max-w-[250px] truncate" title={event.title}>{event.title}</td>
                  <td className="p-3 text-body">{event.organizer}</td>
                  <td className="p-3 text-body">{event.category}</td>
                  <td className="p-3 text-primary font-bold">+{event.points}</td>
                  <td className="p-3 text-right">
                    <Link href={`/demo/admin/reviews/${event.id}`}>
                      <Button variant="primary" size="sm" className="h-7 text-[12px] px-3">Xét duyệt</Button>
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted">Không có sự kiện nào đang chờ duyệt.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
