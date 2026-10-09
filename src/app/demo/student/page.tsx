import Link from "next/link"
import Image from "next/image"
import { MOCK_STUDENT, MOCK_EVENTS, MOCK_TICKETS } from "@/mocks"
import { EventCard } from "@/components/events/event-card"
import { Button } from "@/components/ui/button"
import { Award, CreditCard, ChevronRight, Sparkles } from "lucide-react"

export default function StudentHomePage() {
  // Filter upcoming events: closest 2 dates, max 3 events
  const sortedEvents = [...MOCK_EVENTS].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  const uniqueDates = Array.from(new Set(sortedEvents.map(e => new Date(e.startTime).toDateString())))
  const closestTwoDates = uniqueDates.slice(0, 2)
  
  const upcomingEvents = sortedEvents
    .filter(e => closestTwoDates.includes(new Date(e.startTime).toDateString()))
    .slice(0, 3)
    
  const myTicketsCount = MOCK_TICKETS.length

  return (
    <div className="flex flex-col min-h-screen pb-10">
      {/* Full-bleed Hero Banner */}
      <section className="relative w-full h-[320px] md:h-[400px] flex items-end justify-center pb-10 md:pb-12">
        {/* Background Image with Gradient Fade */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/img/banner.jpg" 
            alt="Banner sự kiện" 
            fill 
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40 mix-blend-multiply"></div>
          {/* Gradient that fades to the page background color at the bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#f6f8fb] via-ink/80 to-ink/50"></div>
        </div>
        
        {/* Banner Content inside container to align with page content */}
        <div className="container relative z-10 flex flex-col gap-3 w-full">
          <div className="inline-flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full bg-accent/20 text-accent text-[11px] font-bold uppercase tracking-wide backdrop-blur-md border border-accent/20">
            <Sparkles className="h-3 w-3" /> Nổi bật
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight text-balance">
            Tuần lễ định hướng sinh viên khóa mới
          </h1>
          <p className="text-white/90 text-[14px] md:text-[16px] max-w-lg">
            Khám phá các câu lạc bộ, tham gia hội thảo và tích lũy những điểm rèn luyện đầu tiên.
          </p>
          <Button className="w-fit mt-2 bg-accent text-primary hover:bg-accent-hover border-none font-bold h-9 md:h-10 px-5 md:px-6">
            Khám phá ngay
          </Button>
        </div>
      </section>

      {/* Main Content */}
      <div className="container flex-1 flex flex-col gap-10 relative z-10 -mt-2">
        {/* Recommended Events */}
        <section className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-semibold text-ink tracking-tight">Sự kiện sắp diễn ra</h2>
            <Link href="/demo/student/events" className="text-[14px] font-medium text-muted hover:text-primary transition-colors flex items-center">
              Xem tất cả <ChevronRight className="h-4 w-4 ml-0.5" />
            </Link>
          </div>
          
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} href={`/demo/student/events/${event.id}`} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
