"use client"

import { useState } from "react"
import { MOCK_EVENTS } from "@/mocks"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Search, Award } from "lucide-react"

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

const CATEGORIES = ["Tất cả", "Tương tác", "Học thuật", "Ngoại khóa", "Thi đấu", "Khác"]

export default function StudentEventsPage() {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredEvents = MOCK_EVENTS.filter(event => {
    // Only show Public events to students
    if (event.status !== "Public") return false
    
    // Category match
    let matchCategory = true
    if (selectedCategory === "Tất cả") {
      matchCategory = true
    } else if (selectedCategory === "Khác") {
      matchCategory = !["Tương tác", "Học thuật", "Ngoại khóa", "Thi đấu"].includes(event.category)
    } else {
      matchCategory = event.category === selectedCategory
    }
    
    // Search match
    const matchSearch = !searchQuery || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      event.location.toLowerCase().includes(searchQuery.toLowerCase())

    return matchCategory && matchSearch
  })

  const groupedEvents = groupEventsByDate(filteredEvents)

  return (
    <div className="container py-6 md:py-10 flex flex-col gap-8 max-w-4xl">
      {/* Header & Filters */}
      <div className="flex flex-col gap-5 px-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-ink tracking-tight">Lịch sự kiện</h1>
            <p className="text-[13.5px] text-muted mt-0.5">Khám phá các hoạt động phong trào và chiến dịch tích lũy điểm rèn luyện.</p>
          </div>
          
          <div className="relative">
            <input 
              type="text" 
              placeholder="Tìm kiếm sự kiện..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-9 pr-4 rounded-full bg-surface border border-border text-[13px] text-ink focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-60 shadow-sm"
            />
            <Search className="h-4 w-4 text-muted absolute left-3 top-3 pointer-events-none" />
          </div>
        </div>
        
        {/* Refined Segmented Filter Bar */}
        <div className="w-full sm:w-auto overflow-x-auto no-scrollbar pb-1">
          <div className="inline-flex items-center gap-1 p-1 bg-canvas border border-border/80 rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
            {CATEGORIES.map(cat => {
              const isSelected = selectedCategory === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`h-8.5 px-3.5 sm:px-4 rounded-xl text-[13px] transition-all whitespace-nowrap flex items-center gap-1.5 select-none ${
                    isSelected 
                      ? "bg-surface text-primary font-bold shadow-sm border border-border/70" 
                      : "text-muted hover:text-ink hover:bg-surface/60 font-medium"
                  }`}
                >
                  {cat === "Tương tác" && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1877F2]"></span>
                  )}
                  <span>{cat}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Timeline View */}
      <div className="flex flex-col mt-2">
        {Object.keys(groupedEvents).length === 0 ? (
          <div className="bg-surface rounded-2xl border border-border p-12 text-center flex flex-col items-center justify-center gap-2">
            <p className="font-semibold text-ink text-[15px]">Không tìm thấy sự kiện phù hợp</p>
            <p className="text-[13px] text-muted">Vui lòng thử chọn danh mục khác hoặc xóa từ khóa tìm kiếm.</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => { setSelectedCategory("Tất cả"); setSearchQuery(""); }}
              className="mt-2 text-[13px]"
            >
              Xem tất cả sự kiện
            </Button>
          </div>
        ) : (
          Object.entries(groupedEvents).map(([dateKey, events], dayIndex, arr) => (
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
                  const isInteractive = event.eventType === "interactive"
                  return (
                    <div key={event.id}>
                      <Link 
                        href={`/demo/student/events/${event.id}`} 
                        className="group flex items-start gap-3 md:gap-5 p-3 md:p-4 rounded-[20px] bg-surface transition-all border border-border shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-0.5"
                      >
                        {/* Time (Left column) */}
                        <div className="w-12 md:w-16 shrink-0 pt-1.5 md:pt-2">
                          <span className="text-[14px] md:text-[15px] font-semibold text-muted group-hover:text-ink transition-colors">{startTime}</span>
                        </div>
                        
                        {/* Content (Middle column) */}
                        <div className="flex-1 min-w-0 pt-1 md:pt-1.5">
                          <div className="flex items-center gap-2 mb-1">
                            {isInteractive && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1877F2] bg-[#1877F2]/10 px-2 py-0.5 rounded">
                                Tương tác Facebook
                              </span>
                            )}
                            <span className="text-[11px] font-semibold text-accent-active bg-accent-soft px-2 py-0.5 rounded flex items-center gap-1">
                              <Award className="h-3 w-3 text-accent" />
                              +{event.points} điểm
                            </span>
                          </div>

                          <h3 className="text-[16px] md:text-[17.5px] font-bold text-ink leading-snug mb-1.5 group-hover:text-primary transition-colors line-clamp-2 pr-2">
                            {event.title}
                          </h3>
                          
                          <div className="flex items-center gap-1.5 text-[13px] md:text-[13.5px] text-body">
                            <MapPin className="h-3.5 w-3.5 opacity-60 shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        </div>
                        
                        {/* Thumbnail (Right column) */}
                        <div className="w-16 h-16 md:w-24 md:h-24 shrink-0 rounded-xl md:rounded-[14px] overflow-hidden relative border border-border bg-canvas ml-1 md:ml-0">
                           <Image 
                             src={event.banner} 
                             alt={event.title} 
                             fill 
                             className="object-cover group-hover:scale-105 transition-transform duration-500" 
                             sizes="(max-width: 768px) 64px, 96px" 
                           />
                        </div>
                      </Link>
                      {/* Divider between items */}
                      {index !== events.length - 1 && (
                        <div className="ml-[60px] md:ml-[84px] mr-4 h-[1px] bg-black/5 my-1 md:my-1.5" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
