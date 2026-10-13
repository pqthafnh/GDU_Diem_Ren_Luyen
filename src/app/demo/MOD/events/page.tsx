"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { MOCK_EVENTS } from "@/mocks"
import { Event, EventCategory } from "@/types"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { 
  Plus, 
  Search, 
  Calendar, 
  Users, 
  CheckCircle2, 
  FileEdit, 
  Clock, 
  FileSpreadsheet, 
  ArrowRight,
  Filter,
  CheckCircle,
  AlertCircle,
  FileCheck,
  ChevronRight
} from "lucide-react"

// Các tab phân loại trạng thái sự kiện MOD
type EventTabType = "ALL" | "ACTIVE" | "DRAFT" | "COMPLETED"

export default function MODEventsPage() {
  const [activeTab, setActiveTab] = useState<EventTabType>("ACTIVE")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL")

  // Đọc danh sách sự kiện từ mock và localStorage nếu có
  const events: Event[] = useMemo(() => {
    try {
      const savedCreatedEvents = localStorage.getItem("gdu_mod_custom_events")
      if (savedCreatedEvents) {
        const customEvents: Event[] = JSON.parse(savedCreatedEvents)
        return [...customEvents, ...MOCK_EVENTS]
      }
    } catch {
      // Ignore
    }
    return MOCK_EVENTS
  }, [])

  // Phân loại nhóm sự kiện
  const activeEvents = useMemo(() => {
    return events.filter(e => e.status === "Public" || e.status === "Đang diễn ra")
  }, [events])

  const draftEvents = useMemo(() => {
    return events.filter(e => 
      e.status === "Bản nháp" || 
      e.status === "Chờ duyệt" || 
      e.status === "Yêu cầu chỉnh sửa"
    )
  }, [events])

  const completedEvents = useMemo(() => {
    return events.filter(e => e.status === "Đã kết thúc" || e.status === "Đã cancel")
  }, [events])

  // Lọc theo Tab + Search + Category
  const filteredEvents = useMemo(() => {
    let pool: Event[] = events
    if (activeTab === "ACTIVE") pool = activeEvents
    if (activeTab === "DRAFT") pool = draftEvents
    if (activeTab === "COMPLETED") pool = completedEvents

    return pool.filter(e => {
      const matchSearch = !searchQuery || 
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.location.toLowerCase().includes(searchQuery.toLowerCase())

      const matchCategory = selectedCategory === "ALL" || e.category === selectedCategory

      return matchSearch && matchCategory
    })
  }, [events, activeTab, activeEvents, draftEvents, completedEvents, searchQuery, selectedCategory])

  // Helper hàm chọn variant cho StatusBadge
  const getBadgeVariant = (status: string): "success" | "warning" | "error" | "info" | "default" => {
    switch (status) {
      case "Public":
        return "success"
      case "Đang diễn ra":
        return "info"
      case "Chờ duyệt":
        return "warning"
      case "Yêu cầu chỉnh sửa":
        return "error"
      case "Bản nháp":
        return "default"
      case "Đã kết thúc":
        return "default"
      default:
        return "default"
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-3.5 py-4 sm:px-6 sm:py-6 flex flex-col gap-4 sm:gap-6 pb-20">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3 sm:pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">Quản lý sự kiện (MOD)</h1>
          <p className="text-[12.5px] sm:text-[13.5px] text-body mt-0.5 sm:mt-1">
            Theo dõi và điều phối sự kiện theo từng giai đoạn vận hành.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/demo/MOD/reports">
            <Button variant="outline" className="w-full sm:w-auto h-9 sm:h-9.5 text-[12.5px] sm:text-[13px] font-semibold rounded-xl border-border hover:bg-canvas">
              <FileSpreadsheet className="h-4 w-4 mr-1.5 text-success" /> Báo cáo tổng hợp Excel
            </Button>
          </Link>
          <Link href="/demo/MOD/events/new">
            <Button variant="primary" className="w-full sm:w-auto h-9 sm:h-9.5 text-[12.5px] sm:text-[13px] font-bold rounded-xl shadow-xs">
              <Plus className="h-4 w-4 mr-1.5" /> Tạo sự kiện mới
            </Button>
          </Link>
        </div>
      </header>

      {/* KPI Cards Thống kê 3 nhóm sự kiện */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
        {/* Nhóm 1: Đang hoạt động */}
        <div 
          onClick={() => setActiveTab("ACTIVE")}
          className={`bg-surface border rounded-xl sm:rounded-2xl p-3.5 sm:p-4 transition-all cursor-pointer flex items-center justify-between ${
            activeTab === "ACTIVE" 
              ? "border-primary ring-2 ring-primary/10 shadow-sm bg-primary-soft/10" 
              : "border-border hover:border-border-strong hover:bg-canvas/50 shadow-xs"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-success/10 text-success flex items-center justify-center shrink-0">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11.5px] sm:text-[12px] font-semibold text-muted uppercase tracking-wider">
                Sự kiện đang hoạt động
              </p>
              <p className="text-xl sm:text-2xl font-bold text-ink mt-0.5">
                {activeEvents.length}
              </p>
            </div>
          </div>
          <span className="text-[11.5px] text-muted bg-canvas px-2.5 py-1 rounded-full border border-border">
            Public / Diễn ra
          </span>
        </div>

        {/* Nhóm 2: Bản nháp & Chờ duyệt */}
        <div 
          onClick={() => setActiveTab("DRAFT")}
          className={`bg-surface border rounded-xl sm:rounded-2xl p-3.5 sm:p-4 transition-all cursor-pointer flex items-center justify-between ${
            activeTab === "DRAFT" 
              ? "border-primary ring-2 ring-primary/10 shadow-sm bg-primary-soft/10" 
              : "border-border hover:border-border-strong hover:bg-canvas/50 shadow-xs"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-warning/10 text-[#A66A12] flex items-center justify-center shrink-0">
              <FileEdit className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11.5px] sm:text-[12px] font-semibold text-muted uppercase tracking-wider">
                Sự kiện nháp & Chờ duyệt
              </p>
              <p className="text-xl sm:text-2xl font-bold text-ink mt-0.5">
                {draftEvents.length}
              </p>
            </div>
          </div>
          <span className="text-[11.5px] text-muted bg-canvas px-2.5 py-1 rounded-full border border-border">
            Bản nháp / Xét duyệt
          </span>
        </div>

        {/* Nhóm 3: Đã hoàn tất */}
        <div 
          onClick={() => setActiveTab("COMPLETED")}
          className={`bg-surface border rounded-xl sm:rounded-2xl p-3.5 sm:p-4 transition-all cursor-pointer flex items-center justify-between ${
            activeTab === "COMPLETED" 
              ? "border-primary ring-2 ring-primary/10 shadow-sm bg-primary-soft/10" 
              : "border-border hover:border-border-strong hover:bg-canvas/50 shadow-xs"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11.5px] sm:text-[12px] font-semibold text-muted uppercase tracking-wider">
                Sự kiện đã hoàn tất
              </p>
              <p className="text-xl sm:text-2xl font-bold text-ink mt-0.5">
                {completedEvents.length}
              </p>
            </div>
          </div>
          <span className="text-[11.5px] text-muted bg-canvas px-2.5 py-1 rounded-full border border-border">
            Đã kết thúc
          </span>
        </div>
      </div>

      {/* Tabs Phân chia 3 Trạng thái sự kiện + Tất cả */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-1.5 sm:gap-2 border-b border-border/80 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveTab("ACTIVE")}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-[12.5px] sm:text-[13.5px] font-bold transition-all shrink-0 ${
              activeTab === "ACTIVE"
                ? "bg-primary text-white shadow-xs"
                : "bg-surface text-body hover:text-ink hover:bg-canvas"
            }`}
          >
            <span>Đang hoạt động</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full ${
              activeTab === "ACTIVE" ? "bg-white/20 text-white" : "bg-canvas text-muted border border-border"
            }`}>
              {activeEvents.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("DRAFT")}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-[12.5px] sm:text-[13.5px] font-bold transition-all shrink-0 ${
              activeTab === "DRAFT"
                ? "bg-primary text-white shadow-xs"
                : "bg-surface text-body hover:text-ink hover:bg-canvas"
            }`}
          >
            <span>Sự kiện nháp</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full ${
              activeTab === "DRAFT" ? "bg-white/20 text-white" : "bg-canvas text-muted border border-border"
            }`}>
              {draftEvents.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("COMPLETED")}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-[12.5px] sm:text-[13.5px] font-bold transition-all shrink-0 ${
              activeTab === "COMPLETED"
                ? "bg-primary text-white shadow-xs"
                : "bg-surface text-body hover:text-ink hover:bg-canvas"
            }`}
          >
            <span>Đã hoàn tất</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full ${
              activeTab === "COMPLETED" ? "bg-white/20 text-white" : "bg-canvas text-muted border border-border"
            }`}>
              {completedEvents.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-[12.5px] sm:text-[13.5px] font-bold transition-all shrink-0 ${
              activeTab === "ALL"
                ? "bg-primary text-white shadow-xs"
                : "bg-surface text-body hover:text-ink hover:bg-canvas"
            }`}
          >
            <span>Tất cả sự kiện</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full ${
              activeTab === "ALL" ? "bg-white/20 text-white" : "bg-canvas text-muted border border-border"
            }`}>
              {events.length}
            </span>
          </button>
        </div>

        {/* Thanh tìm kiếm & Bộ lọc phân loại */}
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
            <input 
              type="text" 
              placeholder="Tìm theo tên sự kiện, đơn vị tổ chức, địa điểm..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 sm:h-9.5 pl-9 pr-4 text-[12.5px] sm:text-[13px] bg-surface border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-ink"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 sm:h-9.5 px-3 text-[12.5px] sm:text-[13px] bg-surface border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-ink"
            >
              <option value="ALL">Tất cả phân loại</option>
              <option value="Ngoại khóa">Ngoại khóa</option>
              <option value="Học thuật">Học thuật</option>
              <option value="Thi đấu">Thi đấu</option>
              <option value="Tương tác">Tương tác</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DANH SÁCH SỰ KIỆN: MOBILE DATA CARDS (< 768px)                            */}
      {/* ========================================================================= */}
      <div className="flex flex-col gap-2.5 sm:hidden">
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center bg-surface border border-border rounded-2xl flex flex-col items-center gap-2">
            <AlertCircle className="h-7 w-7 text-muted" />
            <p className="font-semibold text-ink text-[14px]">Không có sự kiện nào</p>
            <p className="text-[12px] text-muted">Không tìm thấy sự kiện phù hợp trong danh mục này.</p>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const isCompleted = event.status === "Đã kết thúc"
            const isDraft = event.status === "Bản nháp" || event.status === "Chờ duyệt" || event.status === "Yêu cầu chỉnh sửa"

            return (
              <div key={event.id} className="bg-surface border border-border rounded-2xl p-3.5 shadow-xs flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="inline-block text-[10.5px] font-semibold text-primary bg-primary-soft px-2 py-0.5 rounded-md mb-1.5">
                      {event.category}
                    </span>
                    <h3 className="font-bold text-[13.5px] text-ink line-clamp-2 leading-snug">
                      {event.title}
                    </h3>
                  </div>
                  <StatusBadge 
                    status={event.status} 
                    variant={getBadgeVariant(event.status)} 
                    className="text-[10px] px-2 py-0.5 shrink-0 font-semibold" 
                  />
                </div>

                <div className="flex flex-col gap-1 text-[11.5px] text-body bg-canvas/60 p-2.5 rounded-xl border border-border/60">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{new Date(event.startTime).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-muted shrink-0" />
                    <span>
                      {isDraft ? "Dự kiến: " : "Đăng ký: "}
                      <strong className="text-ink">{event.registeredCount} / {event.capacity} SV</strong>
                    </span>
                  </div>
                </div>

                {/* Thao tác tùy theo trạng thái sự kiện */}
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/60">
                  {isDraft ? (
                    <Link href={`/demo/MOD/events/${event.id}`}>
                      <Button variant="outline" size="sm" className="h-8 text-[12px] px-3 font-semibold text-primary border-primary/30">
                        <FileEdit className="h-3.5 w-3.5 mr-1" /> Chỉnh sửa nháp
                      </Button>
                    </Link>
                  ) : isCompleted ? (
                    <>
                      <Link href={`/demo/MOD/events/${event.id}/report`}>
                        <Button variant="outline" size="sm" className="h-8 text-[12px] px-3 font-semibold text-success border-success/30">
                          <FileSpreadsheet className="h-3.5 w-3.5 mr-1" /> Báo cáo Excel
                        </Button>
                      </Link>
                      <Link href={`/demo/MOD/events/${event.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 text-[12px] px-2.5 text-body">
                          Chi tiết
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href={`/demo/MOD/events/${event.id}/attendance`}>
                        <Button variant="primary" size="sm" className="h-8 text-[12px] px-3 font-bold">
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Điểm danh
                        </Button>
                      </Link>
                      <Link href={`/demo/MOD/events/${event.id}/registrations`}>
                        <Button variant="outline" size="sm" className="h-8 text-[12px] px-2.5 text-body">
                          Vé ({event.registeredCount})
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* DANH SÁCH SỰ KIỆN: DESKTOP TABLE VIEW (>= 768px)                          */}
      {/* ========================================================================= */}
      <div className="hidden sm:block bg-surface border border-border rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left border-collapse">
            <thead>
              <tr className="bg-canvas border-b border-border text-muted font-semibold">
                <th className="p-3.5">Tên sự kiện</th>
                <th className="p-3.5 w-32">Phân loại</th>
                <th className="p-3.5 w-44">Thời gian</th>
                <th className="p-3.5 w-36">Trạng thái</th>
                <th className="p-3.5 w-36">Quy mô / Đăng ký</th>
                <th className="p-3.5 text-right w-52">Thao tác quản lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-muted">
                    <p className="font-semibold text-ink text-[14px]">Không tìm thấy sự kiện phù hợp</p>
                    <p className="text-[12.5px] mt-0.5">Vui lòng thử lại với từ khóa hoặc tab trạng thái khác.</p>
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => {
                  const isCompleted = event.status === "Đã kết thúc"
                  const isDraft = event.status === "Bản nháp" || event.status === "Chờ duyệt" || event.status === "Yêu cầu chỉnh sửa"

                  return (
                    <tr key={event.id} className="hover:bg-canvas/50 transition-colors">
                      {/* Tên sự kiện & Đơn vị tổ chức */}
                      <td className="p-3.5">
                        <Link href={`/demo/MOD/events/${event.id}`} className="font-bold text-ink hover:text-primary transition-colors line-clamp-1">
                          {event.title}
                        </Link>
                        <span className="text-[11.5px] text-muted block mt-0.5 truncate max-w-[280px]">
                          {event.organizer} • {event.location}
                        </span>
                      </td>

                      {/* Phân loại */}
                      <td className="p-3.5">
                        <span className="inline-block text-[11px] font-semibold text-primary bg-primary-soft px-2 py-0.5 rounded-md">
                          {event.category}
                        </span>
                      </td>

                      {/* Thời gian */}
                      <td className="p-3.5 text-body text-[12.5px]">
                        {new Date(event.startTime).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}
                      </td>

                      {/* Trạng thái */}
                      <td className="p-3.5">
                        <StatusBadge 
                          status={event.status} 
                          variant={getBadgeVariant(event.status)} 
                          className="text-[11px] px-2.5 py-0.5 font-bold" 
                        />
                      </td>

                      {/* Quy mô / Đăng ký */}
                      <td className="p-3.5 text-body">
                        {isDraft ? (
                          <span className="text-muted text-[12px]">Dự kiến: {event.capacity} SV</span>
                        ) : (
                          <div className="flex items-center gap-1.5 font-medium">
                            <span className="font-bold text-ink">{event.registeredCount}</span>
                            <span className="text-muted">/ {event.capacity} SV</span>
                          </div>
                        )}
                      </td>

                      {/* Thao tác theo trạng thái */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isDraft ? (
                            <Link href={`/demo/MOD/events/${event.id}`}>
                              <Button variant="outline" size="sm" className="h-8 text-[12px] px-3 font-semibold text-primary border-primary/30 rounded-xl hover:bg-primary-soft">
                                <FileEdit className="h-3.5 w-3.5 mr-1" /> Chỉnh sửa
                              </Button>
                            </Link>
                          ) : isCompleted ? (
                            <>
                              <Link href={`/demo/MOD/events/${event.id}/report`}>
                                <Button variant="outline" size="sm" className="h-8 text-[12px] px-2.5 font-semibold text-success border-success/30 rounded-xl hover:bg-success/5">
                                  <FileSpreadsheet className="h-3.5 w-3.5 mr-1" /> Báo cáo
                                </Button>
                              </Link>
                              <Link href={`/demo/MOD/events/${event.id}`}>
                                <Button variant="ghost" size="sm" className="h-8 text-[12px] px-2.5 rounded-xl text-body hover:text-ink">
                                  Chi tiết
                                </Button>
                              </Link>
                            </>
                          ) : (
                            <>
                              <Link href={`/demo/MOD/events/${event.id}/attendance`}>
                                <Button variant="primary" size="sm" className="h-8 text-[12px] px-3 font-bold rounded-xl shadow-2xs">
                                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Điểm danh
                                </Button>
                              </Link>
                              <Link href={`/demo/MOD/events/${event.id}/registrations`}>
                                <Button variant="outline" size="sm" className="h-8 text-[12px] px-2.5 rounded-xl text-body hover:bg-canvas">
                                  Vé
                                </Button>
                              </Link>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
