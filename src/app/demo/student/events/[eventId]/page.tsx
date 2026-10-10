import Image from "next/image"
import { notFound } from "next/navigation"
import { Calendar, MapPin, Users, Award, Building } from "lucide-react"
import { MOCK_EVENTS, MOCK_TICKETS } from "@/mocks"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { RegistrationDialog } from "@/components/events/registration-dialog"

export default function EventDetailPage({ params }: { params: { eventId: string } }) {
  const event = MOCK_EVENTS.find(e => e.id === params.eventId)
  
  if (!event) {
    notFound()
  }

  // Check if user already registered
  const ticket = MOCK_TICKETS.find(t => t.eventId === event.id)

  return (
    <div className="min-h-screen bg-canvas pb-20 md:pb-12">
      {/* Full-bleed Hero Banner */}
      <section className="relative w-full h-[320px] md:h-[400px] flex items-end justify-center">
        <div className="absolute inset-0 z-0">
          <Image 
            src={event.banner}
            alt={event.title} 
            fill 
            className="object-cover"
            priority
          />
          {/* Subtle overlay for image depth */}
          <div className="absolute inset-0 bg-black/5 mix-blend-multiply"></div>
          {/* Gradient that fades to the page background color at the bottom (short and soft) */}
          <div className="absolute inset-x-0 bottom-0 h-20 md:h-28 bg-gradient-to-t from-canvas via-canvas/70 to-transparent pointer-events-none"></div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 py-6 md:py-8 max-w-[1000px] relative z-10">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col gap-6 md:gap-8">
            
            {/* Event Header Info */}
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={event.status} variant="default" className="text-[12px] px-2.5 py-1" />
                  <StatusBadge status={event.category} variant="accent" className="text-[12px] px-2.5 py-1" />
                </div>
                <h1 className="text-2xl md:text-[32px] font-bold text-ink leading-tight tracking-tight">
                  {event.title}
                </h1>
              </div>

              {/* Time & Location blocks (Luma style) */}
              <div className="flex flex-col gap-4 mt-1">
                <div className="flex gap-4 items-center">
                  <div className="h-12 w-12 shrink-0 bg-surface rounded-xl border  shadow-sm flex items-center justify-center">
                    <Calendar className="text-primary h-5 w-5" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="font-bold text-ink text-[15px]">
                      {new Date(event.startTime).toLocaleString("vi-VN", { dateStyle: "full" })}
                    </p>
                    <p className="text-muted text-[14px]">
                      {new Date(event.startTime).toLocaleString("vi-VN", { timeStyle: "short" })} - {new Date(event.endTime).toLocaleString("vi-VN", { timeStyle: "short" })}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-center">
                  <div className="h-12 w-12 shrink-0 bg-surface rounded-xl border  shadow-sm flex items-center justify-center">
                    <MapPin className="text-primary h-5 w-5" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="font-bold text-ink text-[15px]">Địa điểm</p>
                    <p className="text-muted text-[14px]">{event.location}</p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-center">
                  <div className="h-12 w-12 shrink-0 bg-surface rounded-xl border  shadow-sm flex items-center justify-center">
                    <Building className="text-primary h-5 w-5" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="font-bold text-ink text-[15px]">Đơn vị tổ chức</p>
                    <p className="text-muted text-[14px]">{event.organizer}</p>
                  </div>
                </div>
              </div>

              {/* About Event */}
              <div className="mt-4 pt-6 border-t border-border">
                <h2 className="text-[18px] font-bold text-ink mb-4">Về sự kiện</h2>
                <div className="text-body text-[15px] leading-relaxed whitespace-pre-wrap">
                  {event.content}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar / Sticky Card */}
          <div className="w-full md:w-[340px] shrink-0">
            <div className="sticky top-24 bg-surface border  rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col gap-6">
              
              <div className="flex flex-col text-center items-center">
                <span className="text-[20px] font-bold text-ink tracking-tight mb-2">Đăng ký tham gia</span>
                <span className="text-[13px] text-muted font-medium bg-canvas px-3 py-1 rounded-full border ">
                  {event.registeredCount} / {event.capacity} người
                </span>
              </div>
              
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-canvas border ">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-accent" />
                    <span className="text-[14px] font-semibold text-ink">Điểm rèn luyện</span>
                  </div>
                  <span className="font-bold text-primary text-[15px]">+{event.points}</span>
                </div>
                
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-canvas border ">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted" />
                    <span className="text-[14px] font-semibold text-ink">Đối tượng</span>
                  </div>
                  <span className="font-medium text-body text-[13px] text-right truncate max-w-[120px]" title={event.targetAudience}>{event.targetAudience}</span>
                </div>
              </div>
              
              <div className="pt-2 border-t ">
                {ticket ? (
                  <Button disabled variant="outline" className="w-full h-12 font-semibold text-[15px] border-border-strong text-ink bg-canvas">
                    Đã đăng ký ({ticket.status})
                  </Button>
                ) : (
                  <RegistrationDialog event={event} className="w-full h-12 font-semibold text-[15px]" />
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
