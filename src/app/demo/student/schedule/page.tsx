import { MOCK_TICKETS } from "@/mocks"
import { Calendar as CalendarIcon, MapPin, Clock } from "lucide-react"
import { StatusBadge } from "@/components/ui/status-badge"

export default function StudentSchedulePage() {
  const scheduledEvents = [...MOCK_TICKETS]
    .filter(t => t.status === "Vé chính thức")
    .sort((a, b) => new Date(a.event.startTime).getTime() - new Date(b.event.startTime).getTime())

  const groupedEvents = scheduledEvents.reduce((acc, ticket) => {
    const dateStr = new Date(ticket.event.startTime).toLocaleDateString("vi-VN", {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
    if (!acc[dateStr]) acc[dateStr] = []
    acc[dateStr].push(ticket)
    return acc
  }, {} as Record<string, typeof scheduledEvents>)

  return (
    <div className="container py-6 max-w-3xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col gap-2 border-b border-border pb-3">
        <h1 className="text-xl font-bold text-ink">Lịch trình cá nhân</h1>
        <p className="text-[14px] text-body">Danh sách các sự kiện sắp tham gia.</p>
      </div>

      <div className="flex flex-col gap-6">
        {Object.entries(groupedEvents).map(([dateStr, tickets]) => (
          <div key={dateStr} className="flex flex-col gap-3">
            <h2 className="text-[15px] font-bold text-primary flex items-center gap-1.5 sticky top-14  backdrop-blur py-2 z-10 uppercase tracking-wide">
              <CalendarIcon className="h-4 w-4" />
              {dateStr}
            </h2>
            
            <div className="flex flex-col gap-3 pl-2 md:pl-4 border-l-2 ">
              {tickets.map(ticket => {
                const startTime = new Date(ticket.event.startTime).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })
                const endTime = new Date(ticket.event.endTime).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })
                
                return (
                  <div key={ticket.id} className="relative p-4 bg-surface border border-border rounded-xl ml-3 shadow-sm hover:border-primary-muted transition-colors">
                    <div className="absolute top-5 -left-[23px] h-3 w-3 rounded-full bg-primary ring-[3px] ring-canvas" />
                    
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        <StatusBadge status={ticket.event.category} variant="accent" className="text-[10px]" />
                      </div>
                      
                      <h3 className="font-semibold text-ink text-[15px] leading-snug">{ticket.event.title}</h3>
                      
                      <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-4 text-[13px] text-body mt-1">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="font-medium">{startTime} - {endTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">{ticket.event.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {scheduledEvents.length === 0 && (
          <div className="text-center p-8 bg-surface rounded-xl border border-dashed border-border">
            <p className="text-[14px] text-body">Bạn chưa có sự kiện nào sắp diễn ra.</p>
          </div>
        )}
      </div>
    </div>
  )
}
