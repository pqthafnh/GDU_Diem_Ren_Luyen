"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Shield, Settings, User, ChevronRight } from "lucide-react"

export function RoleSwitcher() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Only show in demo routes, and hide in admin routes (admin is strictly isolated)
  if (!pathname.startsWith("/demo") || pathname.startsWith("/demo/admin")) return null

  const roles = [
    { name: "Admin", href: "/demo/admin", icon: Shield, desc: "Kiểm duyệt & Quản trị" },
    { name: "Mode", href: "/demo/mode", icon: Settings, desc: "Tổ chức & Vận hành sự kiện" },
    { name: "Sinh viên", href: "/demo/student", icon: User, desc: "Người tham gia" },
  ]

  const currentRole = roles.find(r => pathname.startsWith(r.href)) || roles[2]

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-[90]">
      <div className="relative">
        {isOpen && (
          <div className="absolute bottom-full right-0 mb-3 w-64 bg-surface border border-border shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2">
            <div className="p-3 bg-canvas border-b border-border">
              <p className="text-[12px] font-bold text-ink uppercase tracking-wider">Chuyển đổi phân quyền</p>
            </div>
            <div className="flex flex-col">
              {roles.map(role => {
                const isActive = pathname.startsWith(role.href)
                return (
                  <Link 
                    key={role.href} 
                    href={role.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 p-3 border-b border-border/50 hover:bg-canvas transition-colors ${isActive ? 'bg-primary-soft' : ''}`}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${isActive ? 'bg-primary text-white' : 'bg-canvas border border-border text-muted'}`}>
                      <role.icon className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-[13px] font-bold ${isActive ? 'text-primary' : 'text-ink'}`}>{role.name}</span>
                      <span className="text-[11px] text-muted">{role.desc}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
        
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-full shadow-xl border border-primary-hover hover:bg-primary-hover transition-all"
        >
          <currentRole.icon className="h-4 w-4" />
          <span className="text-[13px] font-bold hidden md:inline">Góc nhìn: {currentRole.name}</span>
          <span className="text-[13px] font-bold md:hidden">{currentRole.name}</span>
        </button>
      </div>
    </div>
  )
}
