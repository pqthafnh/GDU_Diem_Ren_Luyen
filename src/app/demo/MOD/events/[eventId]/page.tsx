import Link from "next/link"
import { notFound } from "next/navigation"
import { MOCK_EVENTS } from "@/mocks"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { Users, QrCode, FileBarChart, ChevronLeft, Edit, AlertTriangle, ExternalLink, ThumbsUp, Share2, MessageCircle, Award, CheckCircle2 } from "lucide-react"

export default function MODventDetailPage({ params }: { params: { eventId: string } }) {
  const event = MOCK_EVENTS.find(e => e.id === params.eventId)
  
  if (!event) notFound()

  const isInteractive = event.eventType === "interactive"

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
              {isInteractive && (
                <span className="text-[11px] font-semibold text-[#1877F2] bg-[#1877F2]/10 px-2 py-0.5 rounded-full">
                  Sự kiện tương tác Facebook
                </span>
              )}
              <span className="text-[13px] text-body">• {new Date(event.startTime).toLocaleDateString("vi-VN")}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-9 text-[13px] px-3"><Edit className="h-3.5 w-3.5 mr-1.5" /> Chỉnh sửa</Button>
          <Button variant="danger" className="h-9 text-[13px] px-3"><AlertTriangle className="h-3.5 w-3.5 mr-1.5" /> Hủy sự kiện</Button>
        </div>
      </header>

      {/* Banner / Info if interactive */}
      {isInteractive && (
        <div className="p-4 rounded-xl bg-[#1877F2]/5 border border-[#1877F2]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#1877F2] text-white flex items-center justify-center font-bold text-xl shrink-0">
              f
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-ink text-[14.5px]">Chiến dịch tương tác Facebook</span>
                <span className="text-[12px] font-semibold text-accent-active bg-accent-soft px-2 py-0.5 rounded-md border border-accent/20">
                  +{event.points} điểm (1đ/hoạt động)
                </span>
              </div>
              <p className="text-[12.5px] text-muted font-mono truncate max-w-md mt-0.5">
                {event.interactiveConfig?.facebookPostUrl}
              </p>
            </div>
          </div>
          {event.interactiveConfig?.facebookPostUrl && (
            <a 
              href={event.interactiveConfig.facebookPostUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[#1877F2] hover:bg-[#1567d3] text-white text-[13px] font-semibold transition-colors shrink-0 self-start sm:self-auto"
            >
              <span>Xem bài viết gốc</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {/* Card 1: Người tham gia / Minh chứng */}
        <div className="bg-surface border border-border rounded-lg p-5 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-ink uppercase tracking-wide">
              {isInteractive ? "Lượt tương tác đã nộp" : "Đăng ký & Danh sách"}
            </h2>
            <div className="h-8 w-8 rounded-full bg-primary-soft text-primary flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-ink">{event.registeredCount}</span>
              <span className="text-[14px] text-muted">
                {isInteractive ? "sinh viên đã nộp" : `/ ${event.capacity} vé`}
              </span>
            </div>
            <p className="text-[12px] text-muted mt-1">
              {isInteractive ? "Chiến dịch mở toàn trường, không phát hành vé." : "Đã bao gồm danh sách chờ."}
            </p>
          </div>
          <Link href={`/demo/MOD/events/${event.id}/registrations`}>
            <Button variant="outline" className="w-full text-[13px] h-8 mt-2">
              {isInteractive ? "Duyệt minh chứng tương tác" : "Quản lý vé"}
            </Button>
          </Link>
        </div>

        {/* Card 2: Điểm danh (Live) hoặc Đối soát hành động */}
        <div className="bg-surface border border-border rounded-lg p-5 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-ink uppercase tracking-wide">
              {isInteractive ? "Đối soát 3 hành động" : "Điểm danh (Live)"}
            </h2>
            <div className={`h-8 w-8 rounded-full ${isInteractive ? "bg-[#1877F2]/10 text-[#1877F2]" : "bg-success/10 text-success"} flex items-center justify-center`}>
              {isInteractive ? <Award className="h-4 w-4" /> : <QrCode className="h-4 w-4" />}
            </div>
          </div>
          {isInteractive ? (
            <div>
              <div className="flex flex-col gap-1.5 text-[12.5px] mt-1">
                <div className="flex items-center justify-between">
                  <span className="text-body flex items-center gap-1.5">
                    <ThumbsUp className="h-3.5 w-3.5 text-[#1877F2]" /> Like bài viết:
                  </span>
                  <span className="font-semibold text-ink">846 lượt (+1đ)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-body flex items-center gap-1.5">
                    <Share2 className="h-3.5 w-3.5 text-[#21835A]" /> Share công khai:
                  </span>
                  <span className="font-semibold text-ink">812 lượt (+1đ)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-body flex items-center gap-1.5">
                    <MessageCircle className="h-3.5 w-3.5 text-[#A66A12]" /> Comment tag bạn:
                  </span>
                  <span className="font-semibold text-ink">790 lượt (+1đ)</span>
                </div>
              </div>
              <p className="text-[11.5px] text-muted mt-2 border-t border-border/60 pt-1.5">
                Mỗi hành động hợp lệ được cộng 1 điểm rèn luyện.
              </p>
            </div>
          ) : event.category === "Ngoại khóa" || event.checkInMethod === "manual_rollcall" ? (
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-success">1</span>
                <span className="text-[14px] text-muted">/ {event.registeredCount} đã điểm danh</span>
              </div>
              <p className="text-[12px] text-body mt-1 font-medium">
                Sự kiện ngoài trường: Điểm danh thủ công bằng checkbox danh sách.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-success">0</span>
                <span className="text-[14px] text-muted">/ {event.registeredCount} đã tới</span>
              </div>
              <p className="text-[12px] text-muted mt-1">Hỗ trợ Projector MOD & GPS.</p>
            </div>
          )}
          
          <div className="flex gap-2 mt-2">
            {isInteractive ? (
              <Button variant="outline" className="w-full text-[13px] h-8">
                Quét tự động Fanpage
              </Button>
            ) : event.category === "Ngoại khóa" || event.checkInMethod === "manual_rollcall" ? (
              <Link href={`/demo/MOD/events/${event.id}/attendance`} className="w-full">
                <Button variant="primary" className="w-full text-[13px] h-8 font-semibold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Điểm danh theo danh sách
                </Button>
              </Link>
            ) : (
              <>
                <Link href={`/demo/MOD/events/${event.id}/attendance`} className="flex-1">
                  <Button variant="outline" className="w-full text-[13px] h-8">Theo dõi</Button>
                </Link>
                <Link href={`/demo/MOD/events/${event.id}/projector`} className="flex-1">
                  <Button variant="primary" className="w-full text-[13px] h-8">Trình chiếu</Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Card 3: Báo cáo & Xuất file */}
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
            <p className="text-[12px] text-muted mt-1">
              {isInteractive ? "Xuất danh sách cộng điểm tương tác (3đ) ra Excel." : "Xuất danh sách điểm danh ra Excel."}
            </p>
          </div>
          <Link href={`/demo/MOD/events/${event.id}/report`}>
            <Button variant="outline" className="w-full text-[13px] h-8 mt-2">Xem báo cáo</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
