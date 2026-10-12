"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { MOCK_EVENTS, MOCK_EXTRACURRICULAR_REGISTRATIONS, EventRegistrationItem } from "@/mocks"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { 
  ChevronLeft, 
  QrCode, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  CheckSquare, 
  Square, 
  Users, 
  Award, 
  MapPin, 
  Info, 
  Check, 
  X,
  AlertCircle
} from "lucide-react"

export default function MODLiveAttendancePage({ params }: { params: { eventId: string } }) {
  const event = MOCK_EVENTS.find(e => e.id === params.eventId)
  if (!event) notFound()

  const isOffCampus = event.category === "Ngoại khóa" || event.checkInMethod === "manual_rollcall"

  // Danh sách sinh viên đăng ký để điểm danh
  const [students, setStudents] = useState<EventRegistrationItem[]>(() => {
    // Khởi tạo từ mock data
    return MOCK_EXTRACURRICULAR_REGISTRATIONS
  })

  // Danh sách ID sinh viên đang được tick chọn checkbox
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"ALL" | "CHECKED_IN" | "UNATTENDED">("ALL")
  
  // State Dialog xác nhận
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  // State Toast thông báo thành công
  const [successToast, setSuccessToast] = useState<{ message: string; points: number; count: number } | null>(null)

  // Đọc trạng thái đã lưu từ localStorage nếu có
  useEffect(() => {
    try {
      const savedAttendance = localStorage.getItem(`gdu_attendance_${event.id}`)
      if (savedAttendance) {
        setStudents(JSON.parse(savedAttendance))
      }
    } catch {
      // Ignore JSON error
    }
  }, [event.id])

  // Lọc danh sách sinh viên
  const filteredStudents = students.filter(student => {
    const matchSearch = !searchQuery || 
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.includes(searchQuery) ||
      student.className.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchSearch) return false

    if (filterStatus === "CHECKED_IN") return student.status === "Đã check-in"
    if (filterStatus === "UNATTENDED") return student.status === "Chưa điểm danh"
    return true
  })

  const checkedInCount = students.filter(s => s.status === "Đã check-in").length
  const unattendedCount = students.filter(s => s.status === "Chưa điểm danh").length
  const pendingFilteredStudents = filteredStudents.filter(s => s.status === "Chưa điểm danh")

  // Toggle tick chọn 1 sinh viên
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  // Toggle chọn tất cả sinh viên chưa điểm danh trong danh sách đang lọc
  const handleToggleSelectAll = () => {
    const pendingIds = pendingFilteredStudents.map(s => s.id)
    const isAllSelected = pendingIds.length > 0 && pendingIds.every(id => selectedIds.includes(id))

    if (isAllSelected) {
      setSelectedIds(prev => prev.filter(id => !pendingIds.includes(id)))
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...pendingIds])))
    }
  }

  // Bấm xác nhận điểm danh trong Modal
  const handleConfirmAttendance = () => {
    const nowTimeStr = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    
    // Cập nhật danh sách sinh viên
    const updated = students.map(student => {
      if (selectedIds.includes(student.id)) {
        return {
          ...student,
          status: "Đã check-in" as const,
          checkInTime: nowTimeStr,
          verifiedBy: "Cán bộ MOD"
        }
      }
      return student
    })

    setStudents(updated)
    try {
      localStorage.setItem(`gdu_attendance_${event.id}`, JSON.stringify(updated))

      // Nếu trong các sinh viên được chọn có MSSV 2024001 (Nguyễn Văn An), cập nhật sổ cái của An
      const hasStudentAn = selectedIds.some(id => {
        const s = students.find(item => item.id === id)
        return s?.studentId === "2024001"
      })

      if (hasStudentAn) {
        // Lưu lịch sử cộng điểm mới cho sinh viên An
        const existingHistory = JSON.parse(localStorage.getItem("gdu_training_points_history") || "[]")
        const newEntry = {
          id: `tp-${event.id}-${Date.now()}`,
          eventId: event.id,
          eventTitle: event.title,
          category: "Ngoại khóa",
          points: event.points,
          earnedAt: new Date().toISOString(),
          organizer: event.organizer,
        }
        localStorage.setItem("gdu_training_points_history", JSON.stringify([newEntry, ...existingHistory]))

        // Tăng tổng điểm rèn luyện
        const currentPoints = parseInt(localStorage.getItem("gdu_student_total_points") || "85", 10)
        localStorage.setItem("gdu_student_total_points", String(currentPoints + event.points))
      }
    } catch {
      // Ignore localStorage error
    }

    const count = selectedIds.length
    setSelectedIds([])
    setShowConfirmModal(false)

    // Hiển thị thông báo Toast
    setSuccessToast({
      message: `Đã xác nhận điểm danh thành công cho ${count} sinh viên.`,
      points: event.points,
      count
    })

    setTimeout(() => {
      setSuccessToast(null)
    }, 4000)
  }

  return (
    <div className="container py-6 flex flex-col gap-5 max-w-6xl">
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-[#173A67] text-white p-4 rounded-2xl shadow-xl border border-white/20 flex items-start gap-3 max-w-md animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="h-8 w-8 rounded-full bg-success text-white flex items-center justify-center shrink-0 mt-0.5">
            <Check className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-[14px]">Điểm danh & Cộng điểm thành công!</p>
            <p className="text-[12.5px] text-white/90 mt-0.5 leading-snug">
              {successToast.message} Đã cộng <span className="font-bold text-accent">+{successToast.points} điểm rèn luyện</span> vào sổ cái và lịch sử tích lũy của sinh viên.
            </p>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-white/60 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link href={`/demo/MOD/events/${event.id}`}>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted hover:text-ink">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-ink tracking-tight">
                {isOffCampus ? "Điểm danh danh sách sinh viên" : "Điểm danh trực tiếp"}
              </h1>
              {isOffCampus ? (
                <span className="text-[11px] font-semibold text-[#A66A12] bg-[#FBF5E5] px-2.5 py-0.5 rounded-full border border-[#D8B24F]/30">
                  Ngoại khóa ngoài trường
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-primary bg-primary-soft px-2.5 py-0.5 rounded-full">
                  Quét QR + GPS
                </span>
              )}
            </div>
            <p className="text-[13px] text-body mt-0.5 font-medium flex items-center gap-2">
              <span>{event.title}</span>
              <span className="text-muted">•</span>
              <span className="text-accent-active font-semibold">+{event.points} điểm rèn luyện</span>
            </p>
          </div>
        </div>

        {!isOffCampus && (
          <div className="flex items-center gap-2">
            <Link href={`/demo/MOD/events/${event.id}/projector`}>
              <Button variant="primary" className="h-9 text-[13px] px-3 font-semibold">
                <QrCode className="h-3.5 w-3.5 mr-1.5" /> Mở Projector MOD
              </Button>
            </Link>
          </div>
        )}
      </header>

      {/* Thông báo phân loại nghiệp vụ Ngoại khóa ngoài trường */}
      {isOffCampus && (
        <div className="p-4 rounded-2xl bg-canvas border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[13.5px] font-bold text-ink flex items-center gap-2">
                <span>Quy trình điểm danh sự kiện Ngoại khóa ngoài trường</span>
                <span className="text-[11px] font-medium text-muted bg-surface px-2 py-0.5 rounded-md border border-border">
                  Không dùng QR
                </span>
              </p>
              <p className="text-[12.5px] text-body mt-0.5 leading-relaxed">
                Do sự kiện tổ chức ngoài khuôn viên trường ({event.location}), hệ thống không yêu cầu quét mã QR hay xác thực GPS. 
                Cán bộ MOD <strong>tích chọn checkbox</strong> những sinh viên có mặt thực tế và bấm nút <strong>Xác nhận điểm danh</strong> bên dưới để tự động cộng điểm rèn luyện vào hồ sơ.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cards thống kê */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-surface border border-border rounded-xl p-4 shadow-sm flex flex-col">
          <span className="text-[12px] font-semibold text-muted uppercase tracking-wider">Tổng đăng ký</span>
          <span className="text-2xl md:text-3xl font-bold text-ink mt-1">{students.length}</span>
          <span className="text-[11.5px] text-muted mt-0.5">Sinh viên đã nhận vé</span>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4 shadow-sm flex flex-col">
          <span className="text-[12px] font-semibold text-muted uppercase tracking-wider">Đã check-in</span>
          <span className="text-2xl md:text-3xl font-bold text-success mt-1">{checkedInCount}</span>
          <span className="text-[11.5px] text-muted mt-0.5">Đã ghi nhận điểm rèn luyện</span>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4 shadow-sm flex flex-col">
          <span className="text-[12px] font-semibold text-muted uppercase tracking-wider">Chưa điểm danh</span>
          <span className="text-2xl md:text-3xl font-bold text-[#A66A12] mt-1">{unattendedCount}</span>
          <span className="text-[11.5px] text-muted mt-0.5">Đang chờ MOD xác nhận</span>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4 shadow-sm flex flex-col">
          <span className="text-[12px] font-semibold text-muted uppercase tracking-wider">Đang chọn</span>
          <span className="text-2xl md:text-3xl font-bold text-primary mt-1">{selectedIds.length}</span>
          <span className="text-[11.5px] text-muted mt-0.5">Sẵn sàng để xác nhận</span>
        </div>
      </div>

      {/* Danh sách sinh viên & Công cụ điểm danh */}
      <div className="bg-surface border border-border rounded-2xl p-4 md:p-5 flex flex-col gap-4 shadow-sm">
        {/* Thanh công cụ lọc & Nút Xác nhận điểm danh */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border/80 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
              <input 
                type="text" 
                placeholder="Tìm theo MSSV, Họ tên hoặc Lớp..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9.5 pl-9 pr-3 text-[13px] bg-canvas border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-ink"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="h-9.5 px-3 text-[13px] bg-canvas border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-ink"
            >
              <option value="ALL">Tất cả ({students.length})</option>
              <option value="UNATTENDED">Chưa điểm danh ({unattendedCount})</option>
              <option value="CHECKED_IN">Đã check-in ({checkedInCount})</option>
            </select>
          </div>

          {/* Action Button: XÁC NHẬN ĐIỂM DANH */}
          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="primary"
              disabled={selectedIds.length === 0}
              onClick={() => setShowConfirmModal(true)}
              className="h-10 px-4.5 rounded-xl font-bold text-[13.5px] shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Xác nhận điểm danh ({selectedIds.length} SV)</span>
            </Button>
          </div>
        </div>

        {/* Thanh chọn tất cả & Báo cáo số lượng đang chọn */}
        <div className="flex items-center justify-between px-2 py-1 bg-canvas/70 rounded-xl text-[12.5px] text-body">
          <button 
            type="button"
            onClick={handleToggleSelectAll}
            className="flex items-center gap-2 font-semibold text-ink hover:text-primary transition-colors py-1 px-1 rounded"
          >
            {pendingFilteredStudents.length > 0 && pendingFilteredStudents.every(s => selectedIds.includes(s.id)) ? (
              <CheckSquare className="h-4.5 w-4.5 text-primary" />
            ) : (
              <Square className="h-4.5 w-4.5 text-muted" />
            )}
            <span>Chọn tất cả sinh viên chưa điểm danh ({pendingFilteredStudents.length})</span>
          </button>

          <span className="text-muted font-medium">
            Đã chọn <strong className="text-primary font-bold">{selectedIds.length}</strong> / {students.length} sinh viên
          </span>
        </div>

        {/* Bảng danh sách sinh viên */}
        <div className="overflow-x-auto rounded-xl border border-border/70">
          <table className="w-full text-[13px] text-left border-collapse">
            <thead>
              <tr className="bg-canvas border-b border-border/80 text-muted font-semibold">
                <th className="p-3 w-12 text-center">Chọn</th>
                <th className="p-3 w-14">STT</th>
                <th className="p-3">MSSV</th>
                <th className="p-3">Họ và tên</th>
                <th className="p-3">Lớp & Ngành</th>
                <th className="p-3">Thời gian đăng ký</th>
                <th className="p-3">Trạng thái điểm danh</th>
                <th className="p-3 text-right">Giờ check-in</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted">
                    Không tìm thấy sinh viên phù hợp với từ khóa tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const isChecked = selectedIds.includes(student.id)
                  const isDone = student.status === "Đã check-in"

                  return (
                    <tr 
                      key={student.id} 
                      className={`transition-colors select-none ${
                        isDone 
                          ? "bg-success/5 hover:bg-success/10" 
                          : isChecked 
                            ? "bg-primary-soft/60 hover:bg-primary-soft" 
                            : "hover:bg-canvas/50"
                      }`}
                    >
                      {/* Cột Checkbox */}
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSelect(student.id)}
                          className="p-1 rounded text-primary hover:bg-primary-soft transition-colors inline-flex items-center justify-center"
                          title={isChecked ? "Bỏ chọn" : "Tích chọn để điểm danh"}
                        >
                          {isChecked ? (
                            <CheckSquare className="h-4.5 w-4.5 text-primary" />
                          ) : (
                            <Square className="h-4.5 w-4.5 text-muted" />
                          )}
                        </button>
                      </td>

                      {/* STT */}
                      <td className="p-3 text-muted font-medium">{idx + 1}</td>

                      {/* MSSV */}
                      <td className="p-3 font-mono font-bold text-ink">
                        {student.studentId}
                      </td>

                      {/* Họ và tên */}
                      <td className="p-3 font-semibold text-ink">
                        {student.fullName}
                      </td>

                      {/* Lớp & Ngành */}
                      <td className="p-3 text-body">
                        <span className="font-medium text-ink">{student.className}</span>
                        <span className="text-muted block text-[11.5px]">{student.major}</span>
                      </td>

                      {/* Thời gian đăng ký */}
                      <td className="p-3 text-muted text-[12px]">
                        {new Date(student.registeredAt).toLocaleDateString("vi-VN")}
                      </td>

                      {/* Trạng thái điểm danh */}
                      <td className="p-3">
                        {isDone ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11.5px] font-bold bg-success/15 text-success border border-success/30">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Đã check-in</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11.5px] font-medium bg-canvas text-muted border border-border">
                            <span>Chưa điểm danh</span>
                          </span>
                        )}
                      </td>

                      {/* Giờ check-in */}
                      <td className="p-3 text-right font-mono text-[12px] text-body">
                        {student.checkInTime ? (
                          <span className="font-semibold text-success">{student.checkInTime}</span>
                        ) : (
                          <span className="text-muted/60">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DIALOG XÁC NHẬN ĐIỂM DANH */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-2xl max-w-lg w-full flex flex-col gap-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-ink">
                    Xác nhận điểm danh {selectedIds.length} sinh viên
                  </h3>
                  <p className="text-[12.5px] text-muted mt-0.5">
                    Sự kiện: {event.title}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="text-muted hover:text-ink p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-canvas border border-border flex flex-col gap-2.5 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-body font-medium">Số lượng sinh viên xác nhận:</span>
                <span className="font-bold text-ink">{selectedIds.length} sinh viên</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body font-medium">Điểm rèn luyện cộng mỗi SV:</span>
                <span className="font-bold text-success">+{event.points} điểm</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body font-medium">Hình thức điểm danh:</span>
                <span className="font-semibold text-ink">Thủ công danh sách (Ngoài trường)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body font-medium">Tiêu chí ghi nhận:</span>
                <span className="font-semibold text-ink">{event.category}</span>
              </div>
            </div>

            <p className="text-[12.5px] text-muted leading-relaxed">
              Khi bấm xác nhận, hệ thống sẽ chuyển trạng thái các sinh viên được chọn thành <strong>"Đã check-in"</strong>, đồng thời tự động cộng <strong>+{event.points} điểm rèn luyện</strong> vào sổ cái 3 năm và lưu vết lịch sử cá nhân của từng sinh viên.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/80">
              <Button
                variant="outline"
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="h-9.5 text-[13px] px-4 rounded-xl"
              >
                Hủy bỏ
              </Button>
              <Button
                variant="primary"
                type="button"
                onClick={handleConfirmAttendance}
                className="h-9.5 text-[13px] px-5 rounded-xl font-bold flex items-center gap-1.5"
              >
                <Check className="h-4 w-4" />
                <span>Xác nhận & Cộng điểm rèn luyện</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
