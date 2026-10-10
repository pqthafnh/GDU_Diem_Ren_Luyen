import Link from "next/link"
import { notFound } from "next/navigation"
import { MOCK_EVENTS } from "@/mocks"
import { Button } from "@/components/ui/button"
import { ChevronLeft, QrCode, Search, RefreshCw } from "lucide-react"

export default function MODLiveAttendancePage({ params }: { params: { eventId: string } }) {
  const event = MOCK_EVENTS.find(e => e.id === params.eventId)
  if (!event) notFound()

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
            <h1 className="text-xl font-bold text-ink">Điểm danh trực tiếp</h1>
            <p className="text-[13px] text-body mt-0.5">{event.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/demo/MOD/events/${event.id}/projector`}>
            <Button variant="primary" className="h-9 text-[13px] px-3"><QrCode className="h-3.5 w-3.5 mr-1.5" /> Mở Projector MOD</Button>
          </Link>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-1 flex flex-col gap-4">
          <div className="bg-surface border border-border rounded-lg p-5 shadow-sm">
            <h3 className="text-[12px] font-semibold text-muted uppercase tracking-wider">Trạng thái Live</h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-success">145</span>
              <span className="text-[14px] text-body font-medium">/ {event.registeredCount}</span>
            </div>
            <p className="text-[12px] text-muted mt-1">Check-in hợp lệ</p>
            
            <div className="w-full bg-canvas rounded-full h-2 mt-4 overflow-hidden">
              <div className="bg-success h-full" style={{ width: '80%' }}></div>
            </div>
          </div>
          
          <div className="bg-surface border border-border rounded-lg p-5 shadow-sm text-center">
            <p className="text-[13px] text-ink font-medium">Mã QR đang hoạt động</p>
            <p className="text-[11px] text-success mt-1 flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Đang nhận dữ liệu
            </p>
          </div>
        </div>

        <div className="md:col-span-3 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input 
                type="text" 
                placeholder="Tìm MSSV để check-in thủ công..." 
                className="w-full h-9 pl-9 pr-4 text-[13px] bg-surface border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
            <Button variant="outline" className="h-9 text-[13px] px-3"><RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Làm mới</Button>
          </div>

          <div className="bg-surface border border-border rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] text-left border-collapse">
                <thead>
                  <tr className="bg-canvas-soft border-b border-border text-muted">
                    <th className="p-3 font-medium">Thời gian</th>
                    <th className="p-3 font-medium">MSSV</th>
                    <th className="p-3 font-medium">Họ và tên</th>
                    <th className="p-3 font-medium">Phương thức</th>
                    <th className="p-3 font-medium text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[1, 2, 3, 4, 5].map((_, idx) => (
                    <tr key={idx} className="hover:bg-canvas-soft/50 transition-colors">
                      <td className="p-3 text-body">{new Date().toLocaleTimeString("vi-VN")}</td>
                      <td className="p-3 font-mono text-ink">202400{idx + 1}</td>
                      <td className="p-3 font-medium text-ink">Nguyễn Văn {String.fromCharCode(65 + idx)}</td>
                      <td className="p-3 text-body">Quét QR + GPS</td>
                      <td className="p-3 text-right text-success font-medium">Hợp lệ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
