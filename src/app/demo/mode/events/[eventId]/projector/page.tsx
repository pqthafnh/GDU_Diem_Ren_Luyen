"use client"

import { useEffect, useState } from "react"
import { notFound } from "next/navigation"
import { MOCK_EVENTS } from "@/mocks"
import { QrCode, Users, CheckCircle2, ChevronLeft, MapPin } from "lucide-react"

export default function ProjectorModePage({ params }: { params: { eventId: string } }) {
  const event = MOCK_EVENTS.find(e => e.id === params.eventId)
  const [time, setTime] = useState(new Date())
  const [qrKey, setQrKey] = useState(0)
  const [mounted, setMounted] = useState(false)
  
  if (!event) notFound()

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setTime(new Date()), 1000)
    const qrTimer = setInterval(() => setQrKey(prev => prev + 1), 15000)
    return () => {
      clearInterval(timer)
      clearInterval(qrTimer)
    }
  }, [])

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col p-6 md:p-12 fixed inset-0 z-[100] overflow-hidden font-sans">
      
      {/* Header */}
      <header className="flex items-center justify-between pb-8 border-b border-border">
        <div className="flex items-start gap-4 md:gap-6">
          <button onClick={() => window.history.back()} className="mt-1 h-12 w-12 rounded-full bg-surface hover:bg-canvas border border-border flex items-center justify-center transition-colors shadow-sm shrink-0">
            <ChevronLeft className="h-6 w-6 text-ink" />
          </button>
          <div className="flex flex-col gap-1.5">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary leading-tight">{event.title}</h1>
            <div className="flex items-center gap-3 text-muted text-[15px] font-medium mt-1">
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {event.location}</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline text-ink font-semibold">Mở ứng dụng GDU Sinh viên để quét mã điểm danh</span>
            </div>
          </div>
        </div>
        <div className="text-right flex flex-col items-end justify-center shrink-0">
          <div className="text-4xl md:text-5xl font-bold tracking-tight text-ink font-mono">
            {mounted ? time.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "--:--:--"}
          </div>
          <p className="text-muted text-[16px] font-medium mt-2 capitalize">
            {mounted ? time.toLocaleDateString("vi-VN", { weekday: 'long', day: 'numeric', month: 'long' }) : "Đang tải..."}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-32 pt-8">
        
        {/* QR Section */}
        <div className="flex flex-col items-center">
           <div className="bg-surface p-10 md:p-12 rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-black/5">
             <div className="relative flex items-center justify-center">
               <QrCode className="w-[280px] h-[280px] md:w-[380px] md:h-[380px] text-ink" strokeWidth={1} />
             </div>
           </div>
           
           <div className="mt-10 flex flex-col items-center w-full max-w-[380px]">
             <div className="flex justify-between w-full text-[15px] font-bold mb-3 text-ink tracking-wide uppercase">
               <span>Mã động điểm danh</span>
               <span className="text-muted">Làm mới sau 15s</span>
             </div>
             <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                <div key={qrKey} className="h-full bg-primary animate-[shrink_15s_linear_forwards]" />
             </div>
           </div>
        </div>

        {/* Live Stats */}
        <div className="flex flex-col gap-6 w-full max-w-[420px]">
           <div className="bg-surface border border-black/5 rounded-[32px] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
             <div className="flex items-center gap-3 mb-10 pb-8 border-b border-border">
               <div className="relative flex h-3.5 w-3.5">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-success"></span>
               </div>
               <h2 className="text-[20px] font-bold text-ink uppercase tracking-wider">Trạng thái điểm danh</h2>
             </div>
             
             <div className="flex flex-col gap-8">
               <div className="flex items-center justify-between">
                 <span className="text-muted text-[17px] font-medium">Đã điểm danh</span>
                 <div className="flex items-center gap-2">
                   <CheckCircle2 className="w-8 h-8 text-success" />
                   <span className="text-5xl font-extrabold text-ink tracking-tight">145</span>
                 </div>
               </div>
               
               <div className="flex items-center justify-between mt-2">
                 <span className="text-muted text-[17px] font-medium">Đăng ký tham gia</span>
                 <div className="flex items-center gap-2">
                   <Users className="w-6 h-6 text-muted" />
                   <span className="text-4xl font-bold text-ink tracking-tight">{event.registeredCount}</span>
                 </div>
               </div>
               
               <div className="w-full h-px bg-border my-4"></div>
               
               <div className="flex items-center justify-between">
                 <span className="text-ink text-[17px] font-bold">Tỷ lệ tham dự</span>
                 <span className="text-4xl font-extrabold text-primary">{Math.round((145 / event.registeredCount) * 100)}%</span>
               </div>
             </div>
           </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shrink {
          0% { width: 100%; }
          100% { width: 0%; }
        }
      `}} />
    </div>
  )
}
