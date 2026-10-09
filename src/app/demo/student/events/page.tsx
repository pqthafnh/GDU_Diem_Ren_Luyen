import { MOCK_EVENTS } from "@/mocks"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Search } from "lucide-react"

const groupEventsByDate = (events: typeof MOCK_EVENTS) => {
  const grouped: Record<string, typeof MOCK_EVENTS> = {}
  
  // Sort events by date first
  const sortedEvents = [...events].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  
  sortedEvents.forEach(event => {
    const date = new Date(event.startTime)
    // Format: "Thứ Tư, 15 tháng 10"
    const dateKey = date.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })
    if (!grouped[dateKey]) {
      grouped[dateKey] = []
    }
    grouped[dateKey].push(event)
  })
  
  return grouped
}

export default function StudentEventsPage() {
  const groupedEvents = groupEventsByDate(MOCK_EVENTS)

  return (
    <div className="container py-6 md:py-10 flex flex-col gap-8 max-w-4xl">
      {/* Header & Filters */}
      <div className="flex flex-col gap-5 px-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-ink tracking-tight">Lịch sự kiện</h1>
          <button className="h-10 w-10 rounded-full bg-surface border border-black/5 flex items-center justify-center hover:bg-canvas transition-colors shadow-sm">
            <Search className="h-5 w-5 text-ink" />
          </button>
        </div>
        
        {/* Luma-style Pill Filters */}
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" size="sm" className="h-9 rounded-full text-[14px] px-5 font-semibold">Tất cả</Button>
          <Button variant="outline" size="sm" className="h-9 rounded-full border-black/5 bg-surface text-ink font-medium hover:bg-canvas text-[14px] px-5 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">Học thuật</Button>
          <Button variant="outline" size="sm" className="h-9 rounded-full border-black/5 bg-surface text-ink font-medium hover:bg-canvas text-[14px] px-5 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">Kỹ năng mềm</Button>
          <Button variant="outline" size="sm" className="h-9 rounded-full border-black/5 bg-surface text-ink font-medium hover:bg-canvas text-[14px] px-5 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">Tình nguyện</Button>
        </div>
      </div>

      {/* Timeline View */}
      <div className="flex flex-col mt-4">
        
        {Object.entries(groupedEvents).map(([dateKey, events], dayIndex, arr) => (
          <div key={dateKey} className="relative pb-8 md:pb-10">
            {/* The vertical line connecting this day to the next */}
            {dayIndex !== arr.length - 1 && (
              <div className="absolute left-[6.5px] md:left-[8.5px] top-0 bottom-0 border-l-[3px] border-dashed border-slate-300 z-0"></div>
            )}
            
            {/* Date Header with Timeline Node */}
            <div className="flex items-center gap-4 mb-2 md:mb-3">
              <div className="relative z-10 w-[16px] h-[16px] md:w-[20px] md:h-[20px] rounded-full bg-canvas border-[4px] border-primary flex items-center justify-center shadow-sm">
              </div>
              <h2 className="text-[13px] md:text-[14px] font-bold text-ink uppercase tracking-widest pt-0.5 relative z-10">
                {dateKey}
              </h2>
            </div>
            
            {/* Events List */}
            <div className="flex flex-col pl-4 md:pl-9 relative z-10">
              {events.map((event, index) => {
                const startTime = new Date(event.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                return (
                  <div key={event.id}>
                    <Link 
                      href={`/demo/student/events/${event.id}`} 
                      className="group flex items-start gap-3 md:gap-5 p-3 md:p-4 rounded-[20px] hover:bg-surface transition-colors border border-transparent hover:border-black/5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                    >
                      {/* Time (Left column) */}
                      <div className="w-12 md:w-16 shrink-0 pt-1.5 md:pt-2">
                        <span className="text-[14px] md:text-[15px] font-semibold text-muted group-hover:text-ink transition-colors">{startTime}</span>
                      </div>
                      
                      {/* Content (Middle column) */}
                      <div className="flex-1 min-w-0 pt-1 md:pt-1.5">
                        <h3 className="text-[16px] md:text-[18px] font-bold text-ink leading-snug mb-1 md:mb-1.5 group-hover:text-primary transition-colors line-clamp-2 pr-2">
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[13px] md:text-[14px] text-body">
                          <MapPin className="h-3.5 w-3.5 opacity-60 shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      </div>
                      
                      {/* Thumbnail (Right column) */}
                      <div className="w-16 h-16 md:w-24 md:h-24 shrink-0 rounded-xl md:rounded-[14px] overflow-hidden relative border border-black/5 bg-canvas ml-1 md:ml-0">
                         <Image 
                           src={event.banner} 
                           alt={event.title} 
                           fill 
                           className="object-cover group-hover:scale-105 transition-transform duration-500" 
                           sizes="(max-width: 768px) 64px, 96px" 
                         />
                      </div>
                    </Link>
                    {/* Divider (liner) between times */}
                    {index !== events.length - 1 && (
                      <div className="ml-[60px] md:ml-[84px] mr-4 h-[1px] bg-black/5 my-1 md:my-1.5" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
