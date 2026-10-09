"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Save, Send, ChevronLeft } from "lucide-react"

export default function ModeNewEventPage() {
  const [loading, setLoading] = useState(false)

  return (
    <div className="container py-6 flex flex-col gap-5 max-w-4xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Link href="/demo/mode/events">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-ink">Tạo sự kiện mới</h1>
            <p className="text-[13px] text-body mt-0.5">Điền thông tin và gửi yêu cầu duyệt tới Admin.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select className="h-9 px-3 text-[13px] bg-canvas border border-border rounded-md focus:outline-none focus:ring-1 focus:border-primary">
            <option value="">-- Dùng cấu hình mẫu --</option>
            <option value="seminar">Hội thảo tiêu chuẩn (100SV, 5đ)</option>
            <option value="volunteer">Hoạt động tình nguyện (50SV, 10đ)</option>
          </select>
          <Button variant="outline" className="h-9 text-[13px] px-3"><Save className="h-3.5 w-3.5 mr-1.5" /> Lưu nháp</Button>
          <Button variant="primary" className="h-9 text-[13px] px-3"><Send className="h-3.5 w-3.5 mr-1.5" /> Gửi duyệt</Button>
        </div>
      </header>

      <div className="grid gap-5 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 flex flex-col gap-5">
          <div className="bg-surface border border-border rounded-lg p-5 flex flex-col gap-4 shadow-sm">
            <h2 className="text-[14px] font-semibold text-ink uppercase tracking-wide border-b border-border pb-2">Thông tin cơ bản</h2>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-ink">Tên sự kiện <span className="text-error">*</span></label>
              <input type="text" className="w-full h-9 px-3 text-[13px] bg-canvas border border-border rounded-md focus:outline-none focus:ring-1 focus:border-primary" placeholder="Nhập tên sự kiện..." />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-ink">Mô tả ngắn</label>
              <textarea className="w-full h-24 p-3 text-[13px] bg-canvas border border-border rounded-md focus:outline-none focus:ring-1 focus:border-primary resize-none" placeholder="Nhập mô tả sự kiện..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-ink">Danh mục <span className="text-error">*</span></label>
                <select className="w-full h-9 px-3 text-[13px] bg-canvas border border-border rounded-md focus:outline-none focus:ring-1 focus:border-primary">
                  <option>Hội thảo</option>
                  <option>Workshop</option>
                  <option>Kỹ năng mềm</option>
                  <option>Tình nguyện</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-ink">Đơn vị tổ chức</label>
                <input type="text" className="w-full h-9 px-3 text-[13px] bg-canvas border border-border rounded-md focus:outline-none focus:ring-1 focus:border-primary" placeholder="Ví dụ: Khoa CNTT" />
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-lg p-5 flex flex-col gap-4 shadow-sm">
            <h2 className="text-[14px] font-semibold text-ink uppercase tracking-wide border-b border-border pb-2">Thời gian & Địa điểm</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-ink">Bắt đầu <span className="text-error">*</span></label>
                <input type="datetime-local" className="w-full h-9 px-3 text-[13px] bg-canvas border border-border rounded-md focus:outline-none focus:ring-1 focus:border-primary" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-ink">Kết thúc <span className="text-error">*</span></label>
                <input type="datetime-local" className="w-full h-9 px-3 text-[13px] bg-canvas border border-border rounded-md focus:outline-none focus:ring-1 focus:border-primary" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-ink">Địa điểm <span className="text-error">*</span></label>
              <input type="text" className="w-full h-9 px-3 text-[13px] bg-canvas border border-border rounded-md focus:outline-none focus:ring-1 focus:border-primary" placeholder="Ví dụ: Hội trường A" />
            </div>
          </div>
        </div>

        {/* Sidebar Config */}
        <div className="flex flex-col gap-5">
          <div className="bg-surface border border-border rounded-lg p-5 flex flex-col gap-4 shadow-sm">
            <h2 className="text-[14px] font-semibold text-ink uppercase tracking-wide border-b border-border pb-2">Cấu hình tham gia</h2>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-ink">Điểm rèn luyện <span className="text-error">*</span></label>
              <input type="number" className="w-full h-9 px-3 text-[13px] bg-canvas border border-border rounded-md focus:outline-none focus:ring-1 focus:border-primary" defaultValue={5} />
              <span className="text-[11px] text-muted">Số điểm SV nhận được khi tham gia.</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-ink">Sức chứa tối đa <span className="text-error">*</span></label>
              <input type="number" className="w-full h-9 px-3 text-[13px] bg-canvas border border-border rounded-md focus:outline-none focus:ring-1 focus:border-primary" defaultValue={100} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-ink">Cấu hình GPS (100m)</label>
              <label className="flex items-center gap-2 mt-1">
                <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" defaultChecked />
                <span className="text-[13px] text-body">Bắt buộc check-in tại vị trí</span>
              </label>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-lg p-5 flex flex-col gap-4 shadow-sm">
            <h2 className="text-[14px] font-semibold text-ink uppercase tracking-wide border-b border-border pb-2">Banner sự kiện</h2>
            <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-md bg-canvas hover:bg-canvas-soft transition-colors cursor-pointer">
              <span className="text-[13px] text-primary font-medium">Tải ảnh lên</span>
              <span className="text-[11px] text-muted mt-1">PNG, JPG (Tỷ lệ 16:9)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
