import Link from "next/link"
import { notFound } from "next/navigation"
import { MOCK_EVENTS, MOCK_TICKETS } from "@/mocks"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { ChevronLeft, Search, Download, Trash2 } from "lucide-react"

export default function MODRegistrationsPage({ params }: { params: { eventId: string } }) {
  const event = MOCK_EVENTS.find(e => e.id === params.eventId)
  if (!event) notFound()

  // MOCK_TICKETS usually associates with multiple events, but here we just mock
  const registrations = MOCK_TICKETS

  return (
    <div className="container py-6 flex flex-col gap-5">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Link href={`/demo/MOD/events/${event.id}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-ink">Quản lý vé & Đăng ký</h1>
            <p className="text-[13px] text-body mt-0.5">{event.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-9 text-[13px] px-3"><Download className="h-3.5 w-3.5 mr-1.5" /> Xuất Excel</Button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input 
            type="text" 
            placeholder="Tìm theo MSSV, tên..." 
            className="w-full h-9 pl-9 pr-4 text-[13px] bg-surface border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select className="h-9 px-3 text-[13px] bg-surface border border-border rounded-md focus:outline-none focus:ring-1 focus:border-primary text-ink">
            <option>Tất cả trạng thái</option>
            <option>Vé chính thức</option>
            <option>Danh sách chờ</option>
          </select>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left border-collapse">
            <thead>
              <tr className="bg-canvas-soft border-b border-border text-muted">
                <th className="p-3 font-medium">MSSV</th>
                <th className="p-3 font-medium">Họ và tên</th>
                <th className="p-3 font-medium">Lớp</th>
                <th className="p-3 font-medium">Thời gian đăng ký</th>
                <th className="p-3 font-medium">Trạng thái</th>
                <th className="p-3 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {registrations.map((ticket, idx) => (
                <tr key={ticket.id} className="hover:bg-canvas-soft/50 transition-colors">
                  <td className="p-3 font-mono text-ink">202400{idx + 1}</td>
                  <td className="p-3 font-medium text-ink">Nguyễn Văn {String.fromCharCode(65 + idx)}</td>
                  <td className="p-3 text-body">CNTT_K18</td>
                  <td className="p-3 text-body">{new Date().toLocaleString("vi-VN")}</td>
                  <td className="p-3">
                    <StatusBadge 
                      status={ticket.status} 
                      variant={ticket.status === "Vé chính thức" ? "success" : "warning"} 
                      className="text-[10px] px-1.5 py-0.5" 
                    />
                  </td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-error hover:bg-error/10">
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
