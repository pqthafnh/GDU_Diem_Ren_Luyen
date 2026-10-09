"use client"

import { useState } from "react"
import { QrCode, MapPin, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function StudentAttendancePage() {
  const [status, setStatus] = useState<"idle" | "scanning" | "success">("idle")

  const handleScan = () => {
    setStatus("scanning")
    // Mock successful scan after 2 seconds
    setTimeout(() => {
      setStatus("success")
    }, 2000)
  }

  return (
    <div className="container py-6 max-w-sm mx-auto flex flex-col gap-6 h-full min-h-[calc(100vh-8rem)] justify-center">
      <div className="flex flex-col items-center text-center gap-2">
        <h1 className="text-xl font-bold text-ink">Điểm danh sự kiện</h1>
        <p className="text-[14px] text-body">Quét QR tại màn hình để xác nhận.</p>
      </div>

      <div className="flex flex-col items-center justify-center p-6 bg-surface border border-border rounded-2xl shadow-sm relative overflow-hidden min-h-[280px]">
        {status === "idle" && (
          <div className="flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in duration-300">
            <div className="h-20 w-20 rounded-2xl bg-primary-soft text-primary flex items-center justify-center">
              <QrCode className="h-10 w-10" />
            </div>
            <p className="text-[13px] text-body max-w-[200px]">Hướng camera vào mã QR đang được chiếu bởi Ban tổ chức.</p>
          </div>
        )}

        {status === "scanning" && (
          <div className="flex flex-col items-center text-center gap-5 w-full animate-in fade-in duration-300">
            <div className="relative h-40 w-40 border-2 border-primary rounded-xl overflow-hidden flex items-center justify-center bg-black/5">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-primary animate-[scan_2s_ease-in-out_infinite]" />
              <QrCode className="h-12 w-12 text-primary/30" />
            </div>
            <div className="flex items-center gap-1.5 text-[13px] text-primary font-medium">
              <MapPin className="h-4 w-4 animate-pulse" />
              Đang xác định GPS...
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in slide-in-from-bottom-4 duration-500">
            <div className="h-20 w-20 rounded-full bg-success/10 text-success flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div>
              <p className="text-[16px] font-bold text-success mb-1">Thành công!</p>
              <p className="text-[13px] text-body font-medium">Kỹ năng phỏng vấn</p>
              <p className="text-[11px] text-muted mt-0.5">{new Date().toLocaleString("vi-VN")}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {status === "idle" ? (
          <Button size="default" onClick={handleScan} className="w-full h-11">
            Bắt đầu quét
          </Button>
        ) : status === "success" ? (
          <Button size="default" variant="outline" onClick={() => setStatus("idle")} className="w-full h-11">
            Quét mã khác
          </Button>
        ) : null}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </div>
  )
}
