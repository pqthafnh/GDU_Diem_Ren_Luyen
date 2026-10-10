import Link from "next/link"
import { notFound } from "next/navigation"
import { MOCK_EVENTS } from "@/mocks"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { Users, QrCode, FileBarChart, ChevronLeft, Edit, AlertTriangle } from "lucide-react"

export default function MODventDetailPage({ params }: { params: { eventId: string } }) {
  const event = MOCK_EVENTS.find(e => e.id === params.eventId)
  
  if (!event) notFound()

  return (
    <div className="container py-6 flex flex-col gap-5">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Link href="/demo/MOD/events">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-ink flex items-center gap-2">
              {event.title}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={event.status} variant="default" className="text-[10px]" />
              <span className="text-[13px] text-body">• {new Date(event.startTime).toLocaleDateString("vi-VN")}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-9 text-[13px] px-3"><Edit className="h-3.5 w-3.5 mr-1.5" /> Chỉnh sửa</Button>
          <Button variant="danger" className="h-9 text-[13px] px-3"><AlertTriangle className="h-3.5 w-3.5 mr-1.5" /> Hủy sự kiện</Button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-surface border border-border rounded-lg p-5 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-ink uppercase tracking-wide">Đăng ký & Danh sách</h2>
            <div className="h-8 w-8 rounded-full bg-primary-soft text-primary flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-ink">{event.registeredCount}</span>
              <span className="text-[14px] text-muted">/ {event.capacity} vé</span>
            </div>
            <p className="text-[12px] text-muted mt-1">Đã bao gồm danh sách chờ.</p>
          </div>
          <Link href={`/demo/MOD/events/${event.id}/registrations`}>
            <Button variant="outline" className="w-full text-[13px] h-8 mt-2">Quản lý vé</Button>
          </Link>
        </div>

        <div className="bg-surface border border-border rounded-lg p-5 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-ink uppercase tracking-wide">Điểm danh (Live)</h2>
            <div className="h-8 w-8 rounded-full bg-success/10 text-success flex items-center justify-center">
              <QrCode className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-success">0</span>
              <span className="text-[14px] text-muted">/ {event.registeredCount} đã tới</span>
            </div>
            <p className="text-[12px] text-muted mt-1">Hỗ trợ Projector MOD & GPS.</p>
          </div>
          <div className="flex gap-2 mt-2">
            <Link href={`/demo/MOD/events/${event.id}/attendance`} className="flex-1">
              <Button variant="outline" className="w-full text-[13px] h-8">Theo dõi</Button>
            </Link>
            <Link href={`/demo/MOD/events/${event.id}/projector`} className="flex-1">
              <Button variant="primary" className="w-full text-[13px] h-8">Trình chiếu</Button>
            </Link>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-5 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-ink uppercase tracking-wide">Báo cáo & Xuất file</h2>
            <div className="h-8 w-8 rounded-full bg-info/10 text-info flex items-center justify-center">
              <FileBarChart className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-info">Sẵn sàng</span>
            </div>
            <p className="text-[12px] text-muted mt-1">Xuất danh sách điểm danh ra Excel.</p>
          </div>
          <Link href={`/demo/MOD/events/${event.id}/report`}>
            <Button variant="outline" className="w-full text-[13px] h-8 mt-2">Xem báo cáo</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
