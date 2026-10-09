"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, CheckSquare, ListOrdered, LogOut, Database } from "lucide-react"

const ADMIN_NAV = [
  { href: "/demo/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/demo/admin/reviews", label: "Chờ duyệt", icon: CheckSquare },
  { href: "/demo/admin/events", label: "Tất cả sự kiện", icon: Database },
  { href: "/demo/admin/history", label: "Lịch sử xử lý", icon: ListOrdered },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-canvas">
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-surface shadow-sm h-screen sticky top-0 shrink-0">
        <div className="flex h-16 items-center px-6 border-b border-border">
          <span className="text-[18px] font-bold text-ink">GDU Admin</span>
        </div>
        <nav className="flex-1 flex flex-col gap-1 px-3 py-4">
          {ADMIN_NAV.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/demo/admin" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-[14px] font-medium transition-colors",
                  isActive ? "bg-accent-soft text-ink border border-accent/20" : "text-muted hover:bg-canvas hover:text-ink"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 text-[14px] font-medium text-muted hover:text-ink">
            <LogOut className="h-4 w-4" />
            Đổi vai trò
          </Link>
        </div>
      </aside>

      <header className="lg:hidden sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b border-border bg-surface px-4 shadow-sm">
        <span className="text-[16px] font-bold text-ink">GDU Admin</span>
        <Link href="/" className="text-[12px] font-medium text-muted hover:text-ink">Đổi vai trò</Link>
      </header>

      <main className="flex-1 overflow-x-hidden pb-16 lg:pb-0">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-14 w-full items-center justify-around border-t border-border bg-surface pb-safe lg:hidden">
        {ADMIN_NAV.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/demo/admin" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 text-[10px] font-medium transition-colors",
                isActive ? "text-ink font-bold" : "text-muted"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-accent-active" : "text-muted")} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
