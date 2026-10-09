"use client"

import { useState } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { MOCK_EVENTS } from "@/mocks"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Check, X, MessageSquareWarning } from "lucide-react"

export default function AdminReviewDetailPage({ params }: { params: { eventId: string } }) {
  const event = MOCK_EVENTS.find(e => e.id === params.eventId)
  const [feedback, setFeedback] = useState("")
  
  if (!event) notFound()

  return (
    <div className="container py-6 flex flex-col gap-5 max-w-4xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Link href="/demo/admin/reviews">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-ink">Xét duyệt sự kiện</h1>
            <p className="text-[13px] text-body mt-0.5">Kiểm tra thông tin trước khi phát hành lên hệ thống.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="danger" className="h-9 text-[13px] px-3"><X className="h-3.5 w-3.5 mr-1.5" /> Từ chối</Button>
          <Button variant="outline" className="h-9 text-[13px] px-3"><MessageSquareWarning className="h-3.5 w-3.5 mr-1.5" /> Yêu cầu sửa</Button>
          <Button variant="primary" className="h-9 text-[13px] px-3"><Check className="h-3.5 w-3.5 mr-1.5" /> Phê duyệt</Button>
        </div>
      </header>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="md:col-span-2 flex flex-col gap-5">
          <div className="bg-surface border border-border rounded-lg p-5 flex flex-col gap-4 shadow-sm">
            <h2 className="text-[14px] font-semibold text-ink uppercase tracking-wide border-b border-border pb-2">Chi tiết thông tin</h2>
            
            <div className="flex flex-col gap-4 text-[13px]">
              <div>
                <span className="text-muted block mb-1">Tên sự kiện</span>
                <p className="font-medium text-ink">{event.title}</p>
              </div>
              <div>
                <span className="text-muted block mb-1">Mô tả</span>
                <p className="text-body whitespace-pre-line">{event.content}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted block mb-1">Đơn vị tổ chức</span>
                  <p className="text-ink">{event.organizer}</p>
                </div>
                <div>
                  <span className="text-muted block mb-1">Phân loại</span>
                  <p className="text-ink">{event.category}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted block mb-1">Thời gian bắt đầu</span>
                  <p className="text-ink">{new Date(event.startTime).toLocaleString("vi-VN")}</p>
                </div>
                <div>
                  <span className="text-muted block mb-1">Thời gian kết thúc</span>
                  <p className="text-ink">{new Date(event.endTime).toLocaleString("vi-VN")}</p>
                </div>
              </div>
              <div>
                <span className="text-muted block mb-1">Địa điểm</span>
                <p className="text-ink">{event.location}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-surface border border-border rounded-lg p-5 flex flex-col gap-4 shadow-sm">
            <h2 className="text-[14px] font-semibold text-ink uppercase tracking-wide border-b border-border pb-2">Phản hồi xét duyệt</h2>
            <textarea 
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full h-24 p-3 text-[13px] bg-canvas border border-border rounded-md focus:outline-none focus:ring-1 focus:border-primary resize-none" 
              placeholder="Nhập lý do từ chối hoặc yêu cầu chỉnh sửa (tùy chọn khi phê duyệt)..." 
            />
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="bg-surface border border-border rounded-lg p-5 flex flex-col gap-4 shadow-sm">
            <h2 className="text-[14px] font-semibold text-ink uppercase tracking-wide border-b border-border pb-2">Cấu hình hệ thống</h2>
            
            <div className="flex flex-col gap-3 text-[13px]">
              <div className="flex justify-between items-center py-1 border-b border-dashed border-border">
                <span className="text-muted">Điểm rèn luyện</span>
                <span className="font-bold text-primary">+{event.points} điểm</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-dashed border-border">
                <span className="text-muted">Sức chứa</span>
                <span className="font-medium text-ink">{event.capacity} vé</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-dashed border-border">
                <span className="text-muted">Kiểm tra GPS</span>
                <span className="font-medium text-success">Bật (100m)</span>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-lg p-5 flex flex-col gap-3 shadow-sm">
            <h2 className="text-[14px] font-semibold text-ink uppercase tracking-wide border-b border-border pb-2">Lịch sử</h2>
            <div className="flex flex-col gap-2 text-[12px]">
              <div className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <div>
                  <p className="text-ink font-medium">Gửi yêu cầu duyệt</p>
                  <p className="text-muted">{new Date().toLocaleString("vi-VN")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
