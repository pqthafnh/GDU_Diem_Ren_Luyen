"use client"

import { useState } from "react"
import Link from "next/link"
import { MOCK_EVENTS } from "@/mocks"
import { Event } from "@/types"
import { 
  Calendar, 
  Users, 
  FileEdit, 
  FileCheck, 
  Plus, 
  CheckCircle2, 
  FileSpreadsheet, 
  ArrowRight,
  Clock,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"

export default function MODDashboardPage() {
  const [filterTab, setFilterTab] = useState<"ALL" | "ACTIVE" | "DRAFT" | "COMPLETED">("ACTIVE")

  const events = MOCK_EVENTS

  const activeEvents = events.filter(e => e.status === "Public" || e.status === "Đang diễn ra")
  const draftEvents = events.filter(e => e.status === "Bản nháp" || e.status === "Chờ duyệt" || e.status === "Yêu cầu chỉnh sửa")
  const completedEvents = events.filter(e => e.status === "Đã kết thúc" || e.status === "Đã cancel")

  let displayedEvents = events
  if (filterTab === "ACTIVE") displayedEvents = activeEvents
  if (filterTab === "DRAFT") displayedEvents = draftEvents
  if (filterTab === "COMPLETED") displayedEvents = completedEvents

  const getBadgeVariant = (status: string): "success" | "warning" | "error" | "info" | "default" => {
    switch (status) {
      case "Public": return "success"
      case "Đang diễn ra": return "info"
      case "Chờ duyệt": return "warning"
      case "Yêu cầu chỉnh sửa": return "error"
      case "Bản nháp": return "default"
      case "Đã kết thúc": return "default"
      default: return "default"
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-3.5 py-4 sm:px-6 sm:py-6 flex flex-col gap-4 sm:gap-6 pb-20">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">Không gian làm việc (MOD)</h1>
          <p className="text-[12.5px] sm:text-[13.5px] text-body mt-0.5 sm:mt-1">
            Tổng quan điều hành sự kiện, kiểm soát người tham dự và báo cáo điểm danh.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/demo/MOD/reports">
            <Button variant="outline" className="w-full sm:w-auto h-9 sm:h-9.5 text-[12.5px] sm:text-[13px] font-semibold rounded-xl border-border hover:bg-canvas">
              <FileSpreadsheet className="h-4 w-4 mr-1.5 text-success" /> Báo cáo tổng hợp
            </Button>
          </Link>
          <Link href="/demo/MOD/events/new">
            <Button variant="primary" className="w-full sm:w-auto h-9 sm:h-9.5 text-[12.5px] sm:text-[13px] font-bold rounded-xl shadow-xs">
              <Plus className="h-4 w-4 mr-1.5" /> Tạo sự kiện mới
            </Button>
          </Link>
        </div>
      </header>

      {/* 3 Thẻ thống kê chuẩn theo 3 nhóm trạng thái: Đang hoạt động, Bản nháp, Đã hoàn tất */}
      <section className="grid gap-2.5 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        {/* Thẻ 1: Đang hoạt động */}
        <div 
          onClick={() => setFilterTab("ACTIVE")}
          className={`bg-surface border rounded-xl sm:rounded-2xl p-4 shadow-xs transition-all cursor-pointer flex items-center justify-between ${
            filterTab === "ACTIVE" ? "border-primary ring-2 ring-primary/10 bg-primary-soft/10" : "border-border hover:border-border-strong hover:bg-canvas/50"
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-success/10 text-success flex items-center justify-center shrink-0">
              <Calendar className="h-5 w-5 sm:h-5.5 sm:w-5.5" />
            </div>
            <div>
              <p className="text-[11px] sm:text-[11.5px] font-bold text-muted uppercase tracking-wider">
                Đang hoạt động
              </p>
              <p className="text-xl sm:text-2xl font-bold text-ink mt-0.5">
                {activeEvents.length} <span className="text-[12px] font-medium text-muted">sự kiện</span>
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full border border-success/20">
            Public
          </span>
        </div>

        {/* Thẻ 2: Bản nháp & Chờ duyệt */}
        <div 
          onClick={() => setFilterTab("DRAFT")}
          className={`bg-surface border rounded-xl sm:rounded-2xl p-4 shadow-xs transition-all cursor-pointer flex items-center justify-between ${
            filterTab === "DRAFT" ? "border-primary ring-2 ring-primary/10 bg-primary-soft/10" : "border-border hover:border-border-strong hover:bg-canvas/50"
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-warning/10 text-[#A66A12] flex items-center justify-center shrink-0">
              <FileEdit className="h-5 w-5 sm:h-5.5 sm:w-5.5" />
            </div>
            <div>
              <p className="text-[11px] sm:text-[11.5px] font-bold text-muted uppercase tracking-wider">
                Bản nháp & Xét duyệt
              </p>
              <p className="text-xl sm:text-2xl font-bold text-ink mt-0.5">
                {draftEvents.length} <span className="text-[12px] font-medium text-muted">sự kiện</span>
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-[#A66A12] bg-[#FBF5E5] px-2 py-0.5 rounded-full border border-[#D8B24F]/30">
            Chờ xử lý
          </span>
        </div>

        {/* Thẻ 3: Đã hoàn tất */}
        <div 
          onClick={() => setFilterTab("COMPLETED")}
          className={`bg-surface border rounded-xl sm:rounded-2xl p-4 shadow-xs transition-all cursor-pointer flex items-center justify-between ${
            filterTab === "COMPLETED" ? "border-primary ring-2 ring-primary/10 bg-primary-soft/10" : "border-border hover:border-border-strong hover:bg-canvas/50"
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
              <FileCheck className="h-5 w-5 sm:h-5.5 sm:w-5.5" />
            </div>
            <div>
              <p className="text-[11px] sm:text-[11.5px] font-bold text-muted uppercase tracking-wider">
                Đã hoàn tất
              </p>
              <p className="text-xl sm:text-2xl font-bold text-ink mt-0.5">
                {completedEvents.length} <span className="text-[12px] font-medium text-muted">sự kiện</span>
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-primary bg-primary-soft px-2 py-0.5 rounded-full border border-primary/20">
            Đã kết thúc
          </span>
        </div>
      </section>

      {/* Danh sách sự kiện có Tabs lọc */}
      <section className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setFilterTab("ACTIVE")}
              className={`px-3 py-1.5 rounded-xl text-[12px] sm:text-[13px] font-bold transition-all shrink-0 ${
                filterTab === "ACTIVE" ? "bg-primary text-white shadow-xs" : "bg-canvas text-body hover:text-ink"
              }`}
            >
              Đang hoạt động ({activeEvents.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("DRAFT")}
              className={`px-3 py-1.5 rounded-xl text-[12px] sm:text-[13px] font-bold transition-all shrink-0 ${
                filterTab === "DRAFT" ? "bg-primary text-white shadow-xs" : "bg-canvas text-body hover:text-ink"
              }`}
            >
              Sự kiện nháp ({draftEvents.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("COMPLETED")}
              className={`px-3 py-1.5 rounded-xl text-[12px] sm:text-[13px] font-bold transition-all shrink-0 ${
                filterTab === "COMPLETED" ? "bg-primary text-white shadow-xs" : "bg-canvas text-body hover:text-ink"
              }`}
            >
              Đã hoàn tất ({completedEvents.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("ALL")}
              className={`px-3 py-1.5 rounded-xl text-[12px] sm:text-[13px] font-bold transition-all shrink-0 ${
                filterTab === "ALL" ? "bg-primary text-white shadow-xs" : "bg-canvas text-body hover:text-ink"
              }`}
            >
              Tất cả ({events.length})
            </button>
          </div>

          <Link href="/demo/MOD/events" className="text-[12.5px] font-semibold text-primary hover:underline flex items-center gap-1 shrink-0">
            <span>Mở trang Quản lý sự kiện</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Mobile Card List View */}
        <div className="flex flex-col gap-2.5 sm:hidden">
          {displayedEvents.map((event) => (
            <div key={event.id} className="bg-surface border border-border rounded-xl p-3 shadow-sm flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="inline-block text-[10px] font-semibold text-primary bg-primary-soft px-1.5 py-0.5 rounded mb-1">
                    {event.category}
                  </span>
                  <h3 className="font-semibold text-[13px] text-ink line-clamp-2 leading-snug">{event.title}</h3>
                </div>
                <StatusBadge status={event.status} variant={getBadgeVariant(event.status)} className="text-[10px] px-1.5 py-0.5 shrink-0" />
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted border-t border-border/60 pt-2">
                <span>{new Date(event.startTime).toLocaleDateString("vi-VN")}</span>
                <span className="font-medium text-body">{event.registeredCount} / {event.capacity} SV</span>
                <Link href={`/demo/MOD/events/${event.id}`}>
                  <Button variant="outline" size="sm" className="h-7 text-[11px] px-2.5 text-primary border-primary/30">
                    Chi tiết
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block bg-surface border border-border rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] text-left border-collapse">
              <thead>
                <tr className="bg-canvas border-b border-border text-muted font-semibold">
                  <th className="p-3.5 font-semibold">Sự kiện</th>
                  <th className="p-3.5 font-semibold w-28">Phân loại</th>
                  <th className="p-3.5 font-semibold w-36">Thời gian</th>
                  <th className="p-3.5 font-semibold w-32">Trạng thái</th>
                  <th className="p-3.5 font-semibold w-32">Đăng ký</th>
                  <th className="p-3.5 font-semibold text-right w-44">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {displayedEvents.map((event) => {
                  const isCompleted = event.status === "Đã kết thúc"
                  const isDraft = event.status === "Bản nháp" || event.status === "Chờ duyệt" || event.status === "Yêu cầu chỉnh sửa"

                  return (
                    <tr key={event.id} className="hover:bg-canvas/50 transition-colors">
                      <td className="p-3.5 font-semibold text-ink max-w-[220px] truncate" title={event.title}>
                        <Link href={`/demo/MOD/events/${event.id}`} className="hover:text-primary transition-colors">
                          {event.title}
                        </Link>
                      </td>
                      <td className="p-3.5">
                        <span className="inline-block text-[11px] font-semibold text-primary bg-primary-soft px-2 py-0.5 rounded-md">
                          {event.category}
                        </span>
                      </td>
                      <td className="p-3.5 text-body text-[12px]">{new Date(event.startTime).toLocaleDateString("vi-VN")}</td>
                      <td className="p-3.5">
                        <StatusBadge status={event.status} variant={getBadgeVariant(event.status)} className="text-[10.5px] px-2 py-0.5 font-bold" />
                      </td>
                      <td className="p-3.5 text-body">
                        {isDraft ? (
                          <span className="text-muted text-[12px]">{event.capacity} dự kiến</span>
                        ) : (
                          `${event.registeredCount} / ${event.capacity}`
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isDraft ? (
                            <Link href={`/demo/MOD/events/${event.id}`}>
                              <Button variant="outline" size="sm" className="h-7.5 text-[12px] px-2.5 font-semibold text-primary border-primary/30 rounded-lg">
                                Chỉnh sửa
                              </Button>
                            </Link>
                          ) : isCompleted ? (
                            <Link href={`/demo/MOD/events/${event.id}/report`}>
                              <Button variant="outline" size="sm" className="h-7.5 text-[12px] px-2.5 font-semibold text-success border-success/30 rounded-lg">
                                Báo cáo
                              </Button>
                            </Link>
                          ) : (
                            <Link href={`/demo/MOD/events/${event.id}/attendance`}>
                              <Button variant="primary" size="sm" className="h-7.5 text-[12px] px-2.5 font-bold rounded-lg shadow-2xs">
                                Điểm danh
                              </Button>
                            </Link>
                          )}
                          <Link href={`/demo/MOD/events/${event.id}`}>
                            <Button variant="ghost" size="sm" className="h-7.5 text-[12px] px-2 rounded-lg text-body">
                              Chi tiết
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
