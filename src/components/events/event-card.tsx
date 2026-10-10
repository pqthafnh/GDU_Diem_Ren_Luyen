import Image from "next/image"
import Link from "next/link"
import { Calendar, MapPin, Users, Award } from "lucide-react"
import { Event } from "@/types"
import { StatusBadge } from "@/components/ui/status-badge"

interface EventCardProps {
  event: Event
  href: string
}

export function EventCard({ event, href }: EventCardProps) {
  return (
    <Link href={href} className="group flex flex-row sm:flex-col gap-3.5 sm:gap-0 bg-transparent sm:bg-surface border-none sm:border  transition-all sm:rounded-2xl sm:overflow-hidden sm:shadow-sm hover:shadow-none sm:hover:shadow-md hover: sm:hover:-translate-y-0.5">
      <div className="relative w-[90px] h-[90px] sm:h-auto sm:w-full shrink-0 sm:aspect-[16/10] overflow-hidden rounded-[14px] sm:rounded-t-2xl sm:rounded-b-none bg-canvas border border-border sm:border-none">
        <Image
          src={event.banner}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 90px, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 flex flex-col sm:flex-row gap-1 sm:gap-2 items-start">
          <StatusBadge status={event.status} variant="default" className="shadow-sm  text-ink backdrop-blur-md border border-border text-[9px] px-1.5 py-0.5 sm:text-[11px] sm:px-2 sm:py-0.5" />
          <StatusBadge status={event.category} variant="accent" className="hidden sm:inline-flex shadow-sm  text-ink backdrop-blur-md border border-border" />
        </div>
      </div>
      <div className="flex flex-1 flex-col py-0.5 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-[15px] sm:text-[16px] font-semibold text-ink leading-snug tracking-tight group-hover:text-primary transition-colors">
            {event.title}
          </h3>
        </div>
        
        <div className="mt-1.5 sm:mt-3 flex flex-col gap-1 sm:gap-2 text-[12px] sm:text-[13px] text-body">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-muted" />
            <span className="truncate">{new Date(event.startTime).toLocaleString("vi-VN", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-muted" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        <div className="hidden sm:flex mt-auto pt-4 items-center justify-between">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-canvas border ">
            <Users className="h-3.5 w-3.5 text-muted" />
            <span className="text-[12px] font-medium text-ink">
              {event.registeredCount} <span className="font-normal">/ {event.capacity}</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="h-4 w-4 text-accent" />
            <span className="text-[13px] font-medium text-primary">+{event.points} <span>Điểm</span></span>
          </div>
        </div>
      </div>
    </Link>
  )
}
