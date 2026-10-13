"use client"

import { useState } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { MOCK_EVENTS, MOCK_EXCEL_RECORDS } from "@/mocks"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Download, CheckCircle2, Users, AlertCircle, FileSpreadsheet, Check } from "lucide-react"

export default function MODReportPage({ params }: { params: { eventId: string } }) {
  const event = MOCK_EVENTS.find(e => e.id === params.eventId)
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)

  if (!event) notFound()

  // Dữ liệu danh sách xuất Excel đúng 10 cột theo quy định
  const records = MOCK_EXCEL_RECORDS.map(r => ({
    ...r,
    activityTitle: event.title,
    totalPoints: event.points,
  }))

  // Hàm xuất file Excel (định dạng CSV UTF-8 có BOM để Microsoft Excel đọc tiếng Việt hoàn hảo)
  const handleExportExcel = () => {
    setIsExporting(true)

    // 10 cột bắt buộc theo yêu cầu: STT, MSSV, Họ, Tên, Giới tính, Ngày sinh, Lớp, Ngành, Tên hoạt động, Tổng
    const headers = ["STT", "MSSV", "Họ", "Tên", "Giới tính", "Ngày sinh", "Lớp", "Ngành", "Tên hoạt động", "Tổng"]

    const csvRows = [
      headers.join(","),
      ...records.map(row => [
        row.stt,
        `"${row.studentId}"`,
        `"${row.lastName}"`,
        `"${row.firstName}"`,
        `"${row.gender}"`,
        `"${row.birthDate}"`,
        `"${row.className}"`,
        `"${row.major}"`,
        `"${row.activityTitle.replace(/"/g, '""')}"`,
        row.totalPoints
      ].join(","))
    ]

    // Thêm BOM UTF-8 (\uFEFF) để Excel hiển thị đúng tiếng Việt có dấu
    const csvContent = "\uFEFF" + csvRows.join("\r\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `GDU_Bao_cao_diem_danh_${event.id}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setIsExporting(false)
    setExportSuccess(true)
    setTimeout(() => setExportSuccess(false), 3000)
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-3.5 py-4 sm:px-6 sm:py-6 flex flex-col gap-4 sm:gap-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2.5">
          <Link href={`/demo/MOD/events/${event.id}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted hover:text-ink hover:bg-canvas rounded-xl shrink-0">
              <ChevronLeft className="h-4.5 w-4.5" />
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-ink">Báo cáo & Xuất dữ liệu điểm danh</h1>
            <p className="text-[12px] sm:text-[13px] text-body mt-0.5 truncate">{event.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={handleExportExcel}
            disabled={isExporting}
            className={`w-full sm:w-auto h-9 sm:h-10 text-[12px] sm:text-[13px] px-3.5 font-bold rounded-xl transition-all ${
              exportSuccess ? 'bg-success hover:bg-success text-white' : 'bg-primary hover:bg-primary-hover text-white'
            }`}
          >
            {exportSuccess ? (
              <>
                <Check className="h-4 w-4 mr-1.5" />
                Đã tải file Excel (.csv)
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-1.5" />
                Xuất file Excel báo cáo
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Thống kê nhanh */}
      <div className="grid gap-2.5 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        <div className="bg-surface border border-border rounded-xl p-3.5 sm:p-5 shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
            <Users className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
          </div>
          <div>
            <p className="text-[10px] sm:text-[11.5px] font-medium text-muted uppercase tracking-wider">Tổng vé đăng ký</p>
            <p className="text-xl sm:text-2xl font-black text-ink mt-0.5">{event.registeredCount}</p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-3.5 sm:p-5 shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl bg-success/10 text-success flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
          </div>
          <div>
            <p className="text-[10px] sm:text-[11.5px] font-medium text-muted uppercase tracking-wider">Đã điểm danh hợp lệ</p>
            <div className="flex items-baseline gap-1.5 sm:gap-2 mt-0.5">
              <p className="text-xl sm:text-2xl font-black text-success">145</p>
              <p className="text-[11px] sm:text-[12.5px] text-success font-semibold">({Math.round(145 / event.registeredCount * 100)}%)</p>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-3.5 sm:p-5 shadow-sm flex items-center gap-3 sm:gap-4">
          <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl bg-error/10 text-error flex items-center justify-center shrink-0">
            <AlertCircle className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
          </div>
          <div>
            <p className="text-[10px] sm:text-[11.5px] font-medium text-muted uppercase tracking-wider">Vắng mặt (No-show)</p>
            <p className="text-xl sm:text-2xl font-black text-error mt-0.5">{event.registeredCount - 145}</p>
          </div>
        </div>
      </div>

      {/* Bảng xem trước dữ liệu xuất Excel (Đúng 10 cột theo quy định) */}
      <div className="bg-surface border border-border rounded-xl sm:rounded-2xl overflow-hidden shadow-sm flex flex-col">
        <div className="p-3.5 sm:p-4 md:px-6 md:py-4 bg-canvas border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <FileSpreadsheet className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-primary shrink-0" />
            <div>
              <h3 className="font-bold text-ink text-[13px] sm:text-[15px]">Xem trước dữ liệu danh sách xuất Excel</h3>
              <p className="text-[11px] sm:text-[12px] text-muted">Cấu trúc 10 cột chuẩn: STT, MSSV, Họ, Tên, Giới tính, Ngày sinh, Lớp, Ngành, Tên hoạt động, Tổng</p>
            </div>
          </div>
          <span className="text-[11px] sm:text-[12px] font-medium text-primary bg-primary-soft px-2.5 py-1 rounded-lg self-start sm:self-auto">
            + {event.points} điểm rèn luyện / SV
          </span>
        </div>

        {/* Mobile card list */}
        <div className="flex flex-col gap-2 p-3 sm:hidden">
          {records.map((row) => (
            <div key={row.stt} className="bg-canvas/50 border border-border/80 rounded-xl p-2.5 flex flex-col gap-1.5 text-[12px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-ink">
                  <span className="text-[10px] text-muted font-mono w-5">#{row.stt}</span>
                  <span>{row.lastName} {row.firstName}</span>
                </div>
                <span className="font-bold text-success text-[12px]">+{row.totalPoints} đ</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted">
                <span className="font-mono text-primary font-semibold">{row.studentId}</span>
                <span>{row.className} • {row.major}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-[13px] text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-canvas/50 border-b border-border text-muted uppercase text-[11px] tracking-wider">
                <th className="p-3.5 text-center font-bold w-12">STT</th>
                <th className="p-3.5 font-bold">MSSV</th>
                <th className="p-3.5 font-bold">Họ</th>
                <th className="p-3.5 font-bold">Tên</th>
                <th className="p-3.5 font-bold">Giới tính</th>
                <th className="p-3.5 font-bold">Ngày sinh</th>
                <th className="p-3.5 font-bold">Lớp</th>
                <th className="p-3.5 font-bold">Ngành</th>
                <th className="p-3.5 font-bold">Tên hoạt động</th>
                <th className="p-3.5 text-right font-bold w-20">Tổng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {records.map((row) => (
                <tr key={row.stt} className="hover:bg-canvas/60 transition-colors">
                  <td className="p-3.5 text-center font-medium text-muted">{row.stt}</td>
                  <td className="p-3.5 font-mono font-bold text-primary">{row.studentId}</td>
                  <td className="p-3.5 font-medium text-ink">{row.lastName}</td>
                  <td className="p-3.5 font-bold text-ink">{row.firstName}</td>
                  <td className="p-3.5 text-body">{row.gender}</td>
                  <td className="p-3.5 font-mono text-body text-[12.5px]">{row.birthDate}</td>
                  <td className="p-3.5 font-mono text-body">{row.className}</td>
                  <td className="p-3.5 text-body">{row.major}</td>
                  <td className="p-3.5 font-medium text-ink max-w-xs truncate" title={row.activityTitle}>
                    {row.activityTitle}
                  </td>
                  <td className="p-3.5 text-right font-black text-success">+{row.totalPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 sm:p-4 bg-canvas border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] sm:text-[12.5px] text-muted">
          <span>Hiển thị danh sách sinh viên hoàn thành điểm danh hợp lệ tại hoạt động.</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportExcel}
            className="h-8 text-[11px] sm:text-[12px] font-semibold border-border hover:bg-surface rounded-lg self-start sm:self-auto"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Tải tệp .csv (Excel)
          </Button>
        </div>
      </div>
    </div>
  )
}

