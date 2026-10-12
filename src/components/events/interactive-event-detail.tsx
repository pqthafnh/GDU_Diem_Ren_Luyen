"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { 
  Award, 
  Calendar, 
  Building, 
  ExternalLink, 
  Copy, 
  Check, 
  ThumbsUp, 
  Share2, 
  MessageCircle, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Users,
  Sparkles,
  Send
} from "lucide-react"
import { Event } from "@/types"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"

interface InteractiveEventDetailProps {
  event: Event
}

export function InteractiveEventDetail({ event }: InteractiveEventDetailProps) {
  const config = event.interactiveConfig || {
    facebookPostUrl: "https://www.facebook.com/GiaDinhUniversity/posts/pfbid02V9xk7m8L3b4q",
    instruction: "Hoàn thành các hoạt động tương tác bắt buộc: Like/Thả cảm xúc (+1đ), Chia sẻ công khai (+1đ), Bình luận gắn thẻ bạn bè (+1đ). Dán link trang cá nhân hoặc bài chia sẻ để đối soát.",
    actions: [
      { id: "act-like", type: "like", label: "Like / Thả cảm xúc bài viết", description: "Bấm Thích hoặc Thả tim bài viết trên Fanpage Đại học Gia Định", points: 1 },
      { id: "act-share", type: "share", label: "Chia sẻ bài viết ở chế độ Công khai", description: "Chia sẻ về tường Facebook kèm hashtag #GDU_K18 #GiaDinhUniversity", points: 1 },
      { id: "act-comment", type: "comment", label: "Bình luận gắn thẻ 3 người bạn", description: "Để lại bình luận chào đón và tag ít nhất 3 bạn sinh viên", points: 1 },
    ]
  }

  // Initial completed actions
  const [completedActions, setCompletedActions] = useState<string[]>(["act-01", "act-02"])
  const [facebookProfileUrl, setFacebookProfileUrl] = useState("https://facebook.com/nguyenvanan.gdu")
  const [isCopied, setIsCopied] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const toggleAction = (actionId: string) => {
    if (completedActions.includes(actionId)) {
      setCompletedActions(completedActions.filter(id => id !== actionId))
    } else {
      setCompletedActions([...completedActions, actionId])
    }
  }

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(config.facebookPostUrl)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault()
    if (!facebookProfileUrl.trim()) return
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setToastMessage("Đã lưu minh chứng tương tác thành công! Hệ thống sẽ tiến hành đối soát.")
      setTimeout(() => setToastMessage(null), 4000)
    }, 1000)
  }

  // Calculate current earned points: 1 point per completed action
  const currentPoints = completedActions.reduce((total, id) => {
    const act = config.actions.find(a => a.id === id)
    return total + (act ? act.points : 1)
  }, 0)

  const maxPoints = config.actions.reduce((total, act) => total + act.points, 0) || 3

  const getActionIcon = (type: string) => {
    switch (type) {
      case "like":
        return <ThumbsUp className="h-4.5 w-4.5 text-[#1877F2]" />
      case "share":
        return <Share2 className="h-4.5 w-4.5 text-[#21835A]" />
      case "comment":
        return <MessageCircle className="h-4.5 w-4.5 text-[#A66A12]" />
      default:
        return <Sparkles className="h-4.5 w-4.5 text-primary" />
    }
  }

  return (
    <div className="min-h-screen bg-canvas pb-20 md:pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-success text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2.5 text-[14px] font-medium animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Banner with Distinctive Interactive Badge */}
      <section className="relative w-full h-[320px] md:h-[380px] flex items-end justify-center">
        <div className="absolute inset-0 z-0">
          <Image 
            src={event.banner}
            alt={event.title} 
            fill 
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-primary/20 mix-blend-multiply"></div>
          <div className="absolute inset-x-0 bottom-0 h-24 md:h-32 bg-gradient-to-t from-canvas via-canvas/80 to-transparent pointer-events-none"></div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 py-6 md:py-8 max-w-[1020px] relative z-10">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col gap-6 md:gap-7">
            
            {/* Header info */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <StatusBadge status={event.status} variant="default" className="text-[11.5px] px-2.5 py-0.5 font-semibold" />
                <span className="inline-flex items-center gap-1.5 text-[#1877F2] font-semibold text-[12.5px]">
                  <span className="h-2 w-2 rounded-full bg-[#1877F2]"></span>
                  Sự kiện tương tác Facebook
                </span>
                <span className="text-border-strong text-[11px]">•</span>
                <span className="inline-flex items-center gap-1 text-primary font-semibold text-[12.5px]">
                  <Award className="h-3.5 w-3.5 text-accent" />
                  3 điểm rèn luyện (1đ/hoạt động)
                </span>
              </div>

              <h1 className="text-2xl md:text-[30px] font-bold text-ink leading-tight tracking-tight">
                {event.title}
              </h1>

              <p className="text-[14.5px] text-body leading-relaxed">
                {event.content}
              </p>
            </div>

            {/* CARD 1: Khối bài viết Facebook cần tương tác */}
            <div className="bg-surface rounded-2xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 md:p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/80">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center font-bold text-xl shrink-0">
                    f
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-ink text-[15px]">Fanpage Đại học Gia Định</h3>
                      <ShieldCheck className="h-4 w-4 text-[#1877F2]" />
                    </div>
                    <span className="text-[12px] text-muted">Bài viết chiến dịch chính thức của Nhà trường</span>
                  </div>
                </div>
                <span className="hidden sm:inline-flex text-[11.5px] font-medium px-2 py-0.5 rounded-md bg-canvas text-muted border border-border">
                  Bài đăng công khai
                </span>
              </div>

              <div className="bg-canvas rounded-xl p-4 border border-border/70 flex flex-col gap-3">
                <div className="text-[13.5px] text-body font-mono break-all line-clamp-1 bg-surface px-3 py-2 rounded-lg border border-border/60">
                  {config.facebookPostUrl}
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <a 
                    href={config.facebookPostUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#1877F2] hover:bg-[#1567d3] text-white text-[13.5px] font-semibold transition-colors shadow-sm"
                  >
                    <span>Mở bài viết trên Facebook</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>

                  <Button 
                    variant="outline" 
                    onClick={handleCopyLink}
                    className="h-10 px-3.5 rounded-xl border-border hover:bg-canvas text-[13px] font-medium text-ink gap-1.5"
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-4 w-4 text-success" />
                        <span className="text-success">Đã sao chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 text-muted" />
                        <span>Sao chép link</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* CARD 2: Danh sách hành động cần làm & Tích điểm */}
            <div className="bg-surface rounded-2xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 md:p-6 flex flex-col gap-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/80">
                <div>
                  <h3 className="font-bold text-ink text-[16px] flex items-center gap-2">
                    <span>Nhiệm vụ tương tác cần làm</span>
                    <span className="text-[13px] font-normal text-muted">(3 hành động)</span>
                  </h3>
                  <p className="text-[12.5px] text-muted mt-0.5">
                    Mỗi hành động hoàn thành được tính <strong>1 điểm rèn luyện</strong> (tối đa 3 điểm).
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-primary-soft text-primary px-3 py-1.5 rounded-xl font-semibold text-[13.5px] self-start sm:self-auto">
                  <Award className="h-4 w-4 text-accent" />
                  <span>Điểm của bạn: {currentPoints} / {maxPoints} đ</span>
                </div>
              </div>

              {/* Action Checklist Items */}
              <div className="flex flex-col gap-3">
                {config.actions.map((action, index) => {
                  const isChecked = completedActions.includes(action.id)
                  return (
                    <div 
                      key={action.id}
                      onClick={() => toggleAction(action.id)}
                      className={`flex items-start gap-3.5 p-4 rounded-xl border transition-all cursor-pointer select-none ${
                        isChecked 
                          ? 'bg-canvas-soft border-primary/30 shadow-sm' 
                          : 'bg-surface border-border hover:border-border-strong hover:bg-canvas/50'
                      }`}
                    >
                      {/* Checkbox */}
                      <div className="pt-0.5 shrink-0">
                        <div className={`h-5 w-5 rounded-md border flex items-center justify-center transition-colors ${
                          isChecked ? 'bg-primary border-primary text-white' : 'border-border-strong bg-surface'
                        }`}>
                          {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        </div>
                      </div>

                      {/* Icon */}
                      <div className="h-9 w-9 rounded-xl bg-canvas border border-border/80 flex items-center justify-center shrink-0 mt-0.5">
                        {getActionIcon(action.type)}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <span className={`text-[14.5px] font-bold ${isChecked ? 'text-primary' : 'text-ink'}`}>
                            {index + 1}. {action.label}
                          </span>
                          <span className="text-[12px] font-semibold text-accent-active bg-accent-soft px-2 py-0.5 rounded-md border border-accent/20">
                            +{action.points} điểm rèn luyện
                          </span>
                        </div>
                        {action.description && (
                          <p className="text-[13px] text-body mt-1 leading-snug">
                            {action.description}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Hướng dẫn đối soát */}
              <div className="p-3.5 bg-canvas rounded-xl border border-border/80 flex items-start gap-2.5 text-[12.5px] text-muted">
                <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Quy tắc đối soát:</strong> Sinh viên cần mở công khai trang cá nhân hoặc danh sách bài chia sẻ trong suốt thời gian diễn ra chiến dịch để Ban tổ chức ghi nhận điểm rèn luyện chính xác.
                </p>
              </div>
            </div>

            {/* CARD 3: Nộp minh chứng & Xác nhận hoàn thành */}
            <div className="bg-surface rounded-2xl border border-border shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 md:p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/80">
                <div>
                  <h3 className="font-bold text-ink text-[16px]">Xác nhận & Nộp minh chứng tương tác</h3>
                  <p className="text-[12.5px] text-muted mt-0.5">
                    Cung cấp liên kết để Ban tổ chức đối soát tự động
                  </p>
                </div>
                {isSubmitted && (
                  <span className="inline-flex items-center gap-1 text-success text-[12.5px] font-semibold bg-success/10 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Đã nộp minh chứng
                  </span>
                )}
              </div>

              <form onSubmit={handleSubmitProof} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-ink">
                    Link Facebook cá nhân hoặc link bài chia sẻ của bạn <span className="text-error">*</span>
                  </label>
                  <input 
                    type="url" 
                    required
                    value={facebookProfileUrl}
                    onChange={(e) => setFacebookProfileUrl(e.target.value)}
                    placeholder="https://facebook.com/username..."
                    className="h-10 px-3.5 text-[13.5px] bg-canvas border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-ink"
                  />
                  <span className="text-[11.5px] text-muted">
                    Ví dụ: https://www.facebook.com/nguyenvanan.gdu hoặc link bài viết bạn đã chia sẻ
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="text-[13px] text-muted">
                    Tiến độ hoàn thành: <strong className="text-primary">{completedActions.length}/{config.actions.length} hành động</strong> (+{currentPoints} điểm)
                  </div>

                  <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={isSubmitting || completedActions.length === 0}
                    className="w-full sm:w-auto h-11 px-6 rounded-xl font-semibold text-[14px] shadow-sm gap-2"
                  >
                    {isSubmitting ? (
                      <span>Đang lưu...</span>
                    ) : isSubmitted ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Cập nhật minh chứng (+{currentPoints}đ)</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Xác nhận tham gia & Nộp (+{currentPoints}đ)</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>

          </div>

          {/* Sticky Sidebar Right Column */}
          <div className="w-full md:w-[320px] shrink-0 flex flex-col gap-5">
            <div className="sticky top-24 bg-surface border border-border rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col gap-5">
              
              <div className="flex flex-col items-center text-center pb-4 border-b border-border/80">
                <div className="h-12 w-12 rounded-2xl bg-accent-soft text-accent-active flex items-center justify-center mb-2.5">
                  <Award className="h-6 w-6" />
                </div>
                <span className="text-[18px] font-bold text-ink">Điểm rèn luyện</span>
                <span className="text-2xl font-bold text-primary mt-0.5">
                  3 điểm
                </span>
                <span className="text-[12px] text-muted mt-1">
                  1 điểm cho mỗi hoạt động hoàn thành
                </span>
              </div>

              {/* Information list */}
              <div className="flex flex-col gap-3.5 text-[13px]">
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-ink block">Thời gian chiến dịch</span>
                    <span className="text-muted text-[12.5px] leading-snug">
                      {new Date(event.startTime).toLocaleDateString("vi-VN")} - {new Date(event.endTime).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-ink block">Đơn vị chủ trì</span>
                    <span className="text-muted text-[12.5px] leading-snug">{event.organizer}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-ink block">Lượt sinh viên tham gia</span>
                    <span className="text-muted text-[12.5px] leading-snug">
                      {event.registeredCount} sinh viên đã nộp tương tác
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct Facebook Action CTA */}
              <div className="pt-2 border-t border-border/80 flex flex-col gap-2.5">
                <a 
                  href={config.facebookPostUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full"
                >
                  <Button 
                    className="w-full h-11 rounded-xl bg-[#1877F2] hover:bg-[#1567d3] text-white font-semibold text-[13.5px] shadow-sm gap-2"
                  >
                    <span>Vào bài viết Facebook</span>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>

                <div className="p-3 bg-canvas rounded-xl border border-border/70 text-[11.5px] text-muted text-center leading-relaxed">
                  Điểm rèn luyện sẽ được cập nhật vào hồ sơ cá nhân sau khi MOD đối soát hoàn tất.
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
