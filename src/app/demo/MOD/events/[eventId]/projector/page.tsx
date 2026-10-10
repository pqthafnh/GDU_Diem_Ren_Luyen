"use client"

import { useEffect, useState } from "react"
import { notFound } from "next/navigation"
import { MOCK_EVENTS } from "@/mocks"
import { QrCode, Users, CheckCircle2, ChevronLeft, MapPin, Maximize, Clock } from "lucide-react"

export default function ProjectorMODPage({ params }: { params: { eventId: string } }) {
  const event = MOCK_EVENTS.find(e => e.id === params.eventId)
  const [time, setTime] = useState<Date | null>(null)
  const [qrKey, setQrKey] = useState(0)
  
  if (!event) notFound()

  useEffect(() => {
    setTime(new Date())
    const timer = setInterval(() => setTime(new Date()), 1000)
    const qrTimer = setInterval(() => setQrKey(prev => prev + 1), 15000)
    return () => {
      clearInterval(timer)
      clearInterval(qrTimer)
    }
  }, [])

  return (
    <div className="min-h-screen bg-primary text-white flex flex-col p-4 md:p-8 fixed inset-0 z-[100] overflow-hidden font-sans">
      
      {/* Header */}
      <header className="flex items-center justify-between pb-6 border-b border-white/10 shrink-0">
        <div className="flex items-start gap-3 md:gap-5">
          <button onClick={() => window.history.back()} className="mt-0.5 h-10 w-10 md:h-12 md:w-12 rounded-full  hover: border border-white/10 flex items-center justify-center transition-colors shadow-sm shrink-0">
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-white" />
          </button>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white leading-tight drop-shadow-sm">{event.title}</h1>
            <div className="flex items-center gap-3 text-white/70 text-[14px] md:text-[15px] font-medium mt-1">
              <span className="flex items-center gap-1.5  px-2.5 py-1 rounded-full"><MapPin className="h-3.5 w-3.5 text-accent" /> {event.location}</span>
              <span className="hidden sm:inline text-accent/80 font-semibold tracking-wide uppercase text-xs md:text-sm">GDU Sinh viên • Quét mã điểm danh</span>
            </div>
          </div>
        </div>
        <div className="text-right flex flex-col items-end justify-center shrink-0">
          <div className="text-3xl md:text-5xl font-bold tracking-tighter text-white font-mono drop-shadow-md flex items-center gap-2 md:gap-3">
            <Clock className="h-7 w-7 md:h-9 md:w-9 text-accent opacity-80" />
            {time ? time.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "--:--:--"}
          </div>
          <p className="text-white/60 text-[14px] md:text-[16px] font-medium mt-1 md:mt-2 capitalize tracking-wide">
            {time ? time.toLocaleDateString("vi-VN", { weekday: 'long', day: 'numeric', month: 'long' }) : "Đang tải..."}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-20 pt-6">
        
        {/* QR Section */}
        <div className="flex flex-col items-center">
           <div className="bg-surface p-4 md:p-6 rounded-[24px] shadow-[0_20px_60px_rgb(0,0,0,0.3)] relative overflow-hidden">
             {/* Decorative corners */}
             <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-accent rounded-tl-[24px] opacity-20"></div>
             <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-accent rounded-br-[24px] opacity-20"></div>
             
             <div className="relative flex items-center justify-center bg-canvas rounded-xl p-3">
               <QrCode className="w-[200px] h-[200px] md:w-[320px] md:h-[320px] text-ink" strokeWidth={0.75} />
               
               {/* Scanning line animation */}
               <div key={qrKey} className="absolute top-0 left-0 w-full h-1 bg-accent/80 shadow-[0_0_15px_rgba(216,178,79,0.8)] animate-[scan_1.5s_ease-in-out_infinite_alternate]" />
             </div>
           </div>
           
           <div className="mt-8 flex flex-col items-center w-full max-w-[340px]">
             <div className="flex justify-between w-full text-[14px] font-bold mb-3 text-white/90 tracking-widest uppercase">
               <span>Mã động điểm danh</span>
               <span className="text-accent">Làm mới sau 15s</span>
             </div>
             <div className="w-full h-2  rounded-full overflow-hidden shadow-inner backdrop-blur-sm">
                <div key={qrKey} className="h-full bg-accent animate-[shrink_15s_linear_forwards] shadow-[0_0_10px_rgba(216,178,79,0.5)]" />
             </div>
           </div>
        </div>

        {/* Live Stats */}
        <div className="flex flex-col gap-4 w-full max-w-[420px]">
           <div className=" backdrop-blur-md border border-white/10 rounded-[24px] p-8 shadow-2xl">
             <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10">
               <div className="relative flex h-3 w-3">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
               </div>
               <h2 className="text-[18px] font-bold text-white uppercase tracking-widest">Trạng thái điểm danh</h2>
             </div>
             
             <div className="flex flex-col gap-8">
               <div className="flex items-center justify-between group">
                 <span className="text-white/70 text-[16px] font-medium uppercase tracking-wide group-hover:text-white transition-colors">Đã điểm danh</span>
                 <div className="flex items-center gap-2.5">
                   <CheckCircle2 className="w-8 h-8 text-success drop-shadow-[0_0_15px_rgba(33,131,90,0.5)]" />
                   <span className="text-5xl font-black text-white tracking-tighter drop-shadow-md">145</span>
                 </div>
               </div>
               
               <div className="flex items-center justify-between group">
                 <span className="text-white/70 text-[16px] font-medium uppercase tracking-wide group-hover:text-white transition-colors">Đăng ký tham gia</span>
                 <div className="flex items-center gap-2.5">
                   <Users className="w-6 h-6 text-white/40" />
                   <span className="text-4xl font-bold text-white/90 tracking-tighter">{event.registeredCount}</span>
                 </div>
               </div>
               
               <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-1"></div>
               
               <div className="flex items-center justify-between  p-4 rounded-xl border border-white/5">
                 <span className="text-white/90 text-[16px] font-bold uppercase tracking-wide">Tỷ lệ tham dự</span>
                 <span className="text-4xl font-black text-accent drop-shadow-[0_0_15px_rgba(216,178,79,0.3)]">{Math.round((145 / event.registeredCount) * 100)}%</span>
               </div>
             </div>
           </div>
           
           <div className="flex items-center justify-center gap-2 text-white/40 text-[12px] mt-2 font-medium uppercase tracking-widest">
             <Maximize className="w-3.5 h-3.5" /> Bấm F11 để xem toàn màn hình
           </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shrink {
          0% { width: 100%; }
          100% { width: 0%; }
        }
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </div>
  )
}
