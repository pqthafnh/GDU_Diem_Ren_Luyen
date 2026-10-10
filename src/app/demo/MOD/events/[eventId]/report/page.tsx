import Link from "next/link"
import { notFound } from "next/navigation"
import { MOCK_EVENTS } from "@/mocks"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Download, FileBarChart, CheckCircle2, Users, AlertCircle } from "lucide-react"

export default function MODReportPage({ params }: { params: { eventId: string } }) {
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
            <h1 className="text-xl font-bold text-ink">Báo cáo tổng kết</h1>
            <p className="text-[13px] text-body mt-0.5">{event.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="primary" className="h-9 text-[13px] px-3"><Download className="h-3.5 w-3.5 mr-1.5" /> Xuất báo cáo (Excel)</Button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-surface border border-border rounded-lg p-5 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-primary-soft text-primary flex items-center justify-center shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted uppercase tracking-wider">Tổng vé phát hành</p>
            <p className="text-2xl font-bold text-ink mt-0.5">{event.registeredCount}</p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-5 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted uppercase tracking-wider">Đã tham gia hợp lệ</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <p className="text-2xl font-bold text-success">145</p>
              <p className="text-[13px] text-success font-medium">({Math.round(145/event.registeredCount * 100)}%)</p>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-5 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-error/10 text-error flex items-center justify-center shrink-0">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted uppercase tracking-wider">Vắng mặt (Trừ điểm)</p>
            <p className="text-2xl font-bold text-error mt-0.5">{event.registeredCount - 145}</p>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6 shadow-sm flex flex-col items-center justify-center py-16 gap-4 mt-2">
        <FileBarChart className="h-16 w-16 text-muted/30" />
        <h3 className="text-lg font-medium text-ink">Báo cáo đã sẵn sàng</h3>
        <p className="text-[14px] text-body text-center max-w-md">
          Hệ thống đã chốt danh sách điểm danh. Bạn có thể xuất file Excel để gửi lên Admin cập nhật điểm rèn luyện chính thức.
        </p>
      </div>
    </div>
  )
}
