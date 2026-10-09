"use client"

import { useState } from "react"
import { Event } from "@/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { AlertCircle, Calendar, MapPin, Award } from "lucide-react"

export function RegistrationDialog({ event, className }: { event: Event, className?: string }) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle")
  
  const isWaitlist = event.registeredCount >= event.capacity

  const handleRegister = () => {
    setStatus("loading")
    setTimeout(() => {
      setStatus("success")
    }, 1500)
  }

  return (
    <>
      <Button variant="primary" className={className || "w-full md:w-auto"} onClick={() => setOpen(true)}>
        Đăng ký tham gia
      </Button>

      <Dialog open={open} onOpenChange={(val) => {
        if (!val && status === "loading") return
        setOpen(val)
        if (!val) setTimeout(() => setStatus("idle"), 300)
      }}>
        <DialogClose onOpenChange={setOpen} />
        
        {status === "idle" && (
          <>
            <DialogHeader>
              <DialogTitle>Xác nhận đăng ký</DialogTitle>
            </DialogHeader>
            <DialogContent className="flex flex-col gap-3">
              <p className="font-semibold text-ink text-[15px]">{event.title}</p>
              
              <div className="flex flex-col gap-2 p-3 bg-canvas rounded-xl border border-border text-[13px]">
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4 w-4 text-primary shrink-0" />
                  <span>{new Date(event.startTime).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Award className="h-4 w-4 text-accent shrink-0" />
                  <span className="font-semibold text-primary">+{event.points} điểm</span>
                </div>
              </div>

              {isWaitlist && (
                <div className="flex items-start gap-2 p-3 bg-warning/10 text-warning-dark rounded-xl border border-warning/20 text-[13px]">
                  <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                  <p>Sự kiện đã đủ chỗ. Đăng ký của bạn sẽ vào <strong>Danh sách chờ</strong>.</p>
                </div>
              )}

              <div className="text-[12px] text-muted mt-1 border-l-2 border-border pl-2.5">
                <p>Hạn hủy: {event.cancellationDeadline ? new Date(event.cancellationDeadline).toLocaleString("vi-VN") : "Không có"}</p>
                <p className="mt-0.5">Hủy quá hạn hoặc vắng mặt sẽ bị ghi nhận theo quy định.</p>
              </div>
            </DialogContent>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
              <Button variant="primary" onClick={handleRegister}>
                Xác nhận
              </Button>
            </DialogFooter>
          </>
        )}

        {status === "loading" && (
          <DialogContent className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-primary font-medium">Đang xử lý...</p>
          </DialogContent>
        )}

        {status === "success" && (
          <DialogContent className="flex flex-col items-center justify-center py-12 gap-4 text-center">
            <div className="h-16 w-16 rounded-full bg-success/10 text-success flex items-center justify-center mb-2">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-ink">Đăng ký thành công!</h3>
            <p className="text-body max-w-[280px]">
              {isWaitlist 
                ? "Bạn đang ở vị trí #5 trong danh sách chờ. Chúng tôi sẽ thông báo nếu có chỗ trống."
                : "Bạn đã nhận được vé chính thức. Vui lòng kiểm tra mục 'Vé của tôi'."}
            </p>
            <Button variant="primary" className="mt-4 w-full max-w-[200px]" onClick={() => setOpen(false)}>
              Đóng
            </Button>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}
