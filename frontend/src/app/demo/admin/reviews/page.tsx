"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ApiEvent, listPendingReviews } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export default function AdminReviewsPage() {
  const [pendingEvents, setPendingEvents] = useState<ApiEvent[]>([])
  useEffect(() => {
    listPendingReviews().then(setPendingEvents).catch(() => setPendingEvents([]))
  }, [])

  return (
    <div className="w-full max-w-6xl mx-auto px-3.5 py-4 sm:px-6 sm:py-6 flex flex-col gap-3.5 sm:gap-5">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-ink">Chờ duyệt</h1>
          <p className="text-[12px] sm:text-[13px] text-body mt-0.5 sm:mt-1">Danh sách sự kiện yêu cầu phê duyệt từ MOD.</p>
        </div>
      </header>

      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <input 
          type="text" 
          placeholder="Tìm kiếm sự kiện, đơn vị..." 
          className="w-full h-8.5 sm:h-9 pl-9 pr-4 text-[12px] sm:text-[13px] bg-surface border border-border rounded-lg sm:rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
        />
      </div>

      {/* Mobile Card List View */}
      <div className="flex flex-col gap-2.5 sm:hidden">
        {pendingEvents.length > 0 ? pendingEvents.map((event) => (
          <div key={event.id} className="bg-surface border border-border rounded-xl p-3 shadow-sm flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="inline-block text-[10px] font-semibold text-primary bg-primary-soft px-1.5 py-0.5 rounded mb-1">
                  {event.category}
                </span>
                <h3 className="font-semibold text-[13px] text-ink line-clamp-2 leading-snug">{event.title}</h3>
              </div>
              <span className="font-bold text-accent-active bg-accent-soft px-2 py-0.5 rounded text-[11px] shrink-0">
                +{event.pointsReward} đ
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted border-t border-border/60 pt-2">
              <span className="truncate max-w-[200px]">MOD</span>
              <Link href={`/demo/admin/reviews/${event.id}`}>
                <Button variant="primary" size="sm" className="h-7 text-[11px] px-3">
                  Xét duyệt
                </Button>
              </Link>
            </div>
          </div>
        )) : (
          <div className="p-6 text-center text-[12px] text-muted bg-surface border border-border rounded-xl">
            Không có sự kiện nào đang chờ duyệt.
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left border-collapse">
            <thead>
              <tr className="bg-canvas-soft border-b border-border text-muted">
                <th className="p-3 font-medium">Sự kiện</th>
                <th className="p-3 font-medium">Đơn vị tổ chức</th>
                <th className="p-3 font-medium">Phân loại</th>
                <th className="p-3 font-medium">Điểm rèn luyện</th>
                <th className="p-3 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pendingEvents.length > 0 ? pendingEvents.map((event) => (
                <tr key={event.id} className="hover:bg-canvas-soft/50 transition-colors">
                  <td className="p-3 font-medium text-ink max-w-[250px] truncate" title={event.title}>{event.title}</td>
                  <td className="p-3 text-body">MOD</td>
                  <td className="p-3 text-body">{event.category}</td>
                  <td className="p-3 text-primary font-bold">+{event.pointsReward}</td>
                  <td className="p-3 text-right">
                    <Link href={`/demo/admin/reviews/${event.id}`}>
                      <Button variant="primary" size="sm" className="h-7 text-[12px] px-3">Xét duyệt</Button>
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted">Không có sự kiện nào đang chờ duyệt.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
