"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Calendar, CreditCard, Home, QrCode, User, Bell, Search, X, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/demo/student", icon: Home, label: "Trang chủ" },
  { href: "/demo/student/events", icon: Calendar, label: "Sự kiện" },
  { href: "/demo/student/tickets", icon: CreditCard, label: "Vé của tôi" },
  { href: "/demo/student/attendance", icon: QrCode, label: "Điểm danh" },
  { href: "/demo/student/training-points", icon: User, label: "Điểm rèn luyện" },
]

export function AppHeader() {
  const pathname = usePathname()
  const [showNotifications, setShowNotifications] = useState(false)
  const [isSearchActive, setIsSearchActive] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div className="container flex h-14 md:h-16 items-center justify-between relative">
        
        {isSearchActive ? (
          /* Mobile Expanded Search Bar */
          <div className="flex items-center w-full gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
            <Search className="h-5 w-5 text-muted ml-2 shrink-0" />
            <input 
              autoFocus
              type="text" 
              placeholder="Tìm kiếm sự kiện, câu lạc bộ..." 
              className="flex-1 h-10 bg-transparent border-none focus:outline-none text-[14px]"
            />
            <button 
              onClick={() => setIsSearchActive(false)}
              className="p-2 text-muted hover:text-ink text-[13px] font-medium"
            >
              Hủy
            </button>
          </div>
        ) : (
          <>
            <Link href="/demo/student" className="flex items-center gap-2">
              <Image 
                src="/img/gdu-logo.png" 
                alt="GDU Logo" 
                width={160} 
                height={50} 
                className="h-9 w-auto object-contain"
              />
            </Link>
            
            <nav className="hidden md:flex items-center gap-6 text-[14px] font-medium">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "transition-colors hover:text-primary",
                    pathname === item.href ? "text-primary font-bold" : "text-muted"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            
            <div className="flex items-center gap-2 md:gap-5">
              {/* Desktop Search Bar */}
              <div className="hidden md:flex relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm sự kiện..." 
                  className="h-9 w-[180px] lg:w-[240px] rounded-full bg-canvas border border-transparent focus:border-border-strong focus:bg-surface focus:outline-none focus:ring-4 focus:ring-black/5 transition-all pl-9 pr-4 text-[13px]"
                />
              </div>
              
              {/* Mobile Search Icon */}
              <button 
                onClick={() => setIsSearchActive(true)}
                className="md:hidden p-2 text-muted hover:text-primary transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-muted hover:text-primary transition-colors relative"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-error border border-white"></span>
                </button>
                
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40 md:hidden" onClick={() => setShowNotifications(false)}></div>
                    <div className="absolute right-[-20px] sm:right-0 mt-2 w-[300px] sm:w-[340px] md:w-[400px] bg-surface rounded-[16px] shadow-[0_12px_40px_rgb(0,0,0,0.08)] border border-border z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-w-[95vw]">
                      <div className="flex items-center justify-between p-4 border-b border-border">
                        <h4 className="font-bold text-ink text-[16px]">Thông báo</h4>
                        <button className="text-[12px] text-muted hover:text-primary transition-colors font-medium">Đánh dấu đã đọc</button>
                      </div>
                      
                      <div className="flex flex-col max-h-[350px] overflow-y-auto">
                        <Link href="/demo/student/tickets" className="flex items-start gap-4 p-4 border-b border-border hover:bg-canvas transition-colors relative group">
                          {/* Unread dot */}
                          <div className="absolute left-1.5 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary opacity-80"></div>
                          
                          {/* Icon */}
                          <div className="h-10 w-10 shrink-0 rounded-full bg-primary-soft flex items-center justify-center text-primary mt-0.5">
                            <Calendar className="h-4 w-4" />
                          </div>
                          
                          {/* Content */}
                          <div className="flex flex-col gap-1 w-full">
                            <span className="text-[14px] font-bold text-ink leading-snug group-hover:text-primary transition-colors">
                              Hội thảo Sinh viên 5 tốt & Khởi nghiệp
                            </span>
                            <span className="text-[13px] text-muted leading-relaxed line-clamp-2">
                              Sự kiện bạn đăng ký sẽ bắt đầu vào 08:00 sáng mai. Vui lòng mang theo thẻ sinh viên để điểm danh.
                            </span>
                            <span className="text-[11px] font-bold text-warning mt-1 uppercase tracking-wide">
                              Sắp diễn ra • Còn 1 ngày
                            </span>
                          </div>
                        </Link>
                        
                        <Link href="/demo/student/tickets" className="flex items-start gap-4 p-4 border-b border-border hover:bg-canvas transition-colors relative group">
                          <div className="absolute left-1.5 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary opacity-80"></div>
                          
                          <div className="h-10 w-10 shrink-0 rounded-full bg-primary-soft flex items-center justify-center text-primary mt-0.5">
                            <Calendar className="h-4 w-4" />
                          </div>
                          
                          <div className="flex flex-col gap-1 w-full">
                            <span className="text-[14px] font-bold text-ink leading-snug group-hover:text-primary transition-colors">
                              Kỹ năng quản lý tài chính cá nhân
                            </span>
                            <span className="text-[13px] text-muted leading-relaxed line-clamp-2">
                              Vé #042 của bạn đã sẵn sàng. Sự kiện diễn ra lúc 14:00 chiều mai tại Hội trường A.
                            </span>
                            <span className="text-[11px] font-bold text-warning mt-1 uppercase tracking-wide">
                              Sắp diễn ra • Còn 1 ngày
                            </span>
                          </div>
                        </Link>
                      </div>
                      <div className="p-3 text-center bg-surface hover:bg-canvas cursor-pointer transition-colors border-t border-border">
                        <span className="text-[13px] font-semibold text-primary">Xem tất cả thông báo</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Profile */}
              <Link href="/demo/student/profile" className="h-8 w-8 rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold text-[12px] hover:bg-primary hover:text-white transition-colors" title="Trang cá nhân">
                SV
              </Link>
            </div>
          </>
        )}
      </div>
    </header>
  )
}

export function MobileNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-14 w-full items-center justify-around bg-primary pb-safe md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/demo/student" && pathname.startsWith(item.href))
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full gap-1 text-[10px] font-medium transition-colors",
              isActive ? "text-accent" : "text-white/60 hover:text-white/80"
            )}
          >
            <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-accent" : "text-white/60")} />
            <span className="whitespace-nowrap tracking-tight max-[375px]:text-[9px]">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
