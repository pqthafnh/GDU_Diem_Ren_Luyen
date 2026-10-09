import { MOCK_TICKETS } from "@/mocks"
import { Calendar, MapPin, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export default function StudentTicketsPage() {
  return (
    <div className="container py-8 flex flex-col gap-6 max-w-4xl">
      <div className="flex items-center justify-between pb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-ink tracking-tight">Vé của tôi</h1>
          <p className="text-[14px] md:text-[15px] text-body mt-1">Quản lý vé tham dự và theo dõi trạng thái sự kiện.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {MOCK_TICKETS.map((ticket) => (
          <div key={ticket.id} className="flex flex-col md:flex-row bg-surface border border-black/5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-black/10 transition-all group overflow-hidden">
            
            {/* Event Info */}
            <div className="flex-1 p-4 md:p-6 flex flex-row gap-4 md:gap-5 items-center relative">
              {/* Thumbnail */}
              <div className="relative w-16 md:w-20 aspect-square rounded-[14px] overflow-hidden shrink-0 bg-canvas border border-black/5 shadow-sm">
                <Image 
                  src={ticket.event.banner} 
                  alt={ticket.event.title} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-500" 
                  sizes="80px"
                />
              </div>
              
              {/* Text Info */}
              <div className="flex flex-col justify-center flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[10px] md:text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${ticket.status === "Vé chính thức" ? "text-success bg-success/10" : "text-warning-dark bg-warning/15"}`}>
                    {ticket.status}
                  </span>
                  <span className="text-[11px] font-mono text-muted/60">#{ticket.id}</span>
                </div>
                
                <h3 className="text-[15px] md:text-[17px] font-bold text-ink leading-snug truncate pr-2">
                  <Link href={`/demo/student/events/${ticket.eventId}`} className="hover:text-primary transition-colors">
                    {ticket.event.title}
                  </Link>
                </h3>
                
                <div className="flex flex-row items-center gap-2 md:gap-3 mt-1.5 text-[12px] md:text-[13px] text-muted">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Calendar className="h-3.5 w-3.5 opacity-70 text-primary" />
                    <span className="font-medium">
                      {new Date(ticket.event.startTime).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}
                    </span>
                  </div>
                  <div className="hidden sm:block w-1 h-1 rounded-full bg-border shrink-0"></div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <MapPin className="h-3.5 w-3.5 opacity-70 text-primary shrink-0" />
                    <span className="font-medium truncate">{ticket.event.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Subtle Separator */}
            <div className="md:hidden h-px w-[calc(100%-32px)] mx-auto bg-black/5"></div>
            <div className="hidden md:block w-px bg-black/5 my-6"></div>

            {/* Ticket Stub */}
            <div className="p-4 md:p-6 w-full md:w-[160px] flex flex-row md:flex-col justify-between md:justify-center items-center shrink-0">
               {ticket.status === "Vé chính thức" ? (
                 <>
                   <div className="flex flex-col md:items-center">
                     <span className="text-[11px] text-muted font-semibold uppercase tracking-wider mb-0.5">Số ghế / STT</span>
                     <span className="text-2xl md:text-3xl font-bold text-primary tracking-tight">
                       {ticket.seatNumber || ticket.sequenceNumber}
                     </span>
                   </div>
                   <button className="text-[13px] md:text-[12px] font-medium text-error/70 hover:text-error transition-colors md:mt-2 px-3 md:px-0 py-1.5 md:py-0">
                     Hủy vé
                   </button>
                 </>
               ) : (
                 <>
                   <div className="flex flex-col md:items-center">
                     <span className="text-[11px] text-muted font-semibold uppercase tracking-wider mb-0.5">Hàng chờ</span>
                     <span className="text-2xl md:text-3xl font-bold text-warning tracking-tight">
                       #{ticket.waitlistPosition}
                     </span>
                   </div>
                   <button className="text-[13px] md:text-[12px] font-medium text-error/70 hover:text-error transition-colors md:mt-2 px-3 md:px-0 py-1.5 md:py-0">
                     Rời hàng
                   </button>
                 </>
               )}
            </div>
          </div>
        ))}
        
        {MOCK_TICKETS.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 rounded-3xl border border-black/5 bg-surface text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="h-14 w-14 bg-canvas rounded-2xl flex items-center justify-center mb-5 border border-black/5">
              <QrCode className="h-6 w-6 text-muted" />
            </div>
            <p className="text-[16px] font-bold text-ink">Chưa có vé nào</p>
            <p className="text-[14px] text-body mt-1 max-w-sm">
              Bạn chưa đăng ký tham gia sự kiện nào. Hãy khám phá các sự kiện đang mở nhé.
            </p>
            <Link href="/demo/student/events" className="mt-5">
               <Button className="bg-primary hover:bg-primary-hover shadow-sm">Tìm sự kiện</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
