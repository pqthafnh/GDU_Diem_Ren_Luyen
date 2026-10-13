"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { MOCK_EVENTS, MOCK_EXTRACURRICULAR_REGISTRATIONS } from "@/mocks"
import { EventRegistrationItem } from "@/types"
import { Button } from "@/components/ui/button"
import { 
  ChevronLeft, 
  QrCode, 
  Search, 
  CheckCircle2, 
  CheckSquare, 
  Square, 
  Users, 
  Award, 
  MapPin, 
  Info, 
  Check, 
  X,
  AlertCircle,
  Phone,
  PhoneCall,
  UserCheck,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  RotateCcw
} from "lucide-react"

export default function MODLiveAttendancePage({ params }: { params: { eventId: string } }) {
  const event = MOCK_EVENTS.find(e => e.id === params.eventId)
  if (!event) notFound()

  const isOffCampus = event.category === "Ngoại khóa" || event.category === "Thi đấu" || event.checkInMethod === "manual_rollcall"

  // Tab quy trình điểm danh ngoại khóa: "CHECK_IN" hoặc "CHECK_OUT"
  const [activeTab, setActiveTab] = useState<"CHECK_IN" | "CHECK_OUT">("CHECK_IN")

  // Danh sách sinh viên đăng ký để điểm danh
  const [students, setStudents] = useState<EventRegistrationItem[]>(() => {
    return MOCK_EXTRACURRICULAR_REGISTRATIONS
  })

  // State tìm kiếm & lọc
  const [searchQuery, setSearchQuery] = useState("")

  // Check-in State
  const [selectedCheckInIds, setSelectedCheckInIds] = useState<string[]>([])
  const [showConfirmCheckInModal, setShowConfirmCheckInModal] = useState(false)

  // Check-out State (dữ liệu mới từ danh sách check-in)
  const [selectedCheckOutIds, setSelectedCheckOutIds] = useState<string[]>([])
  const [showMissingCheckOutPopup, setShowMissingCheckOutPopup] = useState(false)
  const [missingStudents, setMissingStudents] = useState<EventRegistrationItem[]>([])
  const [showSuccessCheckOutModal, setShowSuccessCheckOutModal] = useState(false)

  // State xử lý sau khi gọi điện thoại xác nhận: MOD checkbox lại lần nữa
  const [selectedVerifiedIds, setSelectedVerifiedIds] = useState<string[]>([])
  const [showConfirmVerifiedModal, setShowConfirmVerifiedModal] = useState(false)

  // State Toast thông báo
  const [successToast, setSuccessToast] = useState<{ message: string; points?: number; count: number } | null>(null)

  // Đọc dữ liệu từ localStorage khi load trang
  useEffect(() => {
    try {
      const savedAttendance = localStorage.getItem(`gdu_attendance_${event.id}`)
      if (savedAttendance) {
        const parsed: EventRegistrationItem[] = JSON.parse(savedAttendance)
        // Đảm bảo mọi sinh viên đều có SĐT
        const formatted = parsed.map((item, idx) => ({
          ...item,
          phoneNumber: item.phoneNumber || `0908${(100000 + idx).toString().slice(1)}`
        }))
        setStudents(formatted)
      } else {
        // Khởi tạo mock có SĐT chuẩn
        const formatted = MOCK_EXTRACURRICULAR_REGISTRATIONS.map((item, idx) => ({
          ...item,
          phoneNumber: item.phoneNumber || `0908${(100000 + idx).toString().slice(1)}`
        }))
        setStudents(formatted)
      }
    } catch {
      // Ignore JSON error
    }
  }, [event.id])

  // Dữ liệu lọc cho Tab 1: Check-in (Tất cả sinh viên đăng ký)
  const checkInFilteredStudents = students.filter(student => {
    const matchSearch = !searchQuery || 
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.includes(searchQuery) ||
      student.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.phoneNumber && student.phoneNumber.includes(searchQuery))
    return matchSearch
  })

  // Dữ liệu cho Tab 2: Check-out -> "Dữ liệu mới từ danh sách check-in"
  // Chỉ lấy những sinh viên đã hoàn thành check-in đầu giờ
  const checkedInPool = students.filter(s => s.status === "Đã check-in" || s.status === "Đã check-out" || s.status === "Vắng check-out")
  
  const checkOutFilteredStudents = checkedInPool.filter(student => {
    const matchSearch = !searchQuery || 
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.includes(searchQuery) ||
      student.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.phoneNumber && student.phoneNumber.includes(searchQuery))
    return matchSearch
  })

  // Danh sách sinh viên đang ở trạng thái vắng check-out cần gọi điện xác minh
  const missingCheckOutList = students.filter(s => s.status === "Vắng check-out")

  // Thống kê số lượng
  const totalRegisteredCount = students.length
  const checkedInCount = students.filter(s => s.status === "Đã check-in" || s.status === "Đã check-out" || s.status === "Vắng check-out").length
  const completedCheckOutCount = students.filter(s => s.status === "Đã check-out").length
  const unattendedCheckInCount = students.filter(s => s.status === "Chưa điểm danh").length

  // =========================================================================
  // XỬ LÝ CHECK-IN (Giai đoạn 1)
  // =========================================================================
  const pendingCheckInStudents = checkInFilteredStudents.filter(s => s.status === "Chưa điểm danh")

  const handleToggleCheckIn = (id: string) => {
    setSelectedCheckInIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const handleToggleSelectAllCheckIn = () => {
    const pendingIds = pendingCheckInStudents.map(s => s.id)
    const isAllSelected = pendingIds.length > 0 && pendingIds.every(id => selectedCheckInIds.includes(id))

    if (isAllSelected) {
      setSelectedCheckInIds(prev => prev.filter(id => !pendingIds.includes(id)))
    } else {
      setSelectedCheckInIds(prev => Array.from(new Set([...prev, ...pendingIds])))
    }
  }

  const handleConfirmCheckIn = () => {
    const nowTimeStr = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    
    const updated = students.map(student => {
      if (selectedCheckInIds.includes(student.id)) {
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
    } catch {
      // Ignore
    }

    const count = selectedCheckInIds.length
    setSelectedCheckInIds([])
    setShowConfirmCheckInModal(false)

    setSuccessToast({
      message: `Đã xác nhận Check-in thành công cho ${count} sinh viên. Dữ liệu đã sẵn sàng để chuyển sang Check-out khi kết thúc.`,
      count
    })

    setTimeout(() => setSuccessToast(null), 4000)
  }

  // =========================================================================
  // XỬ LÝ CHECK-OUT (Giai đoạn 2 - Dữ liệu mới từ danh sách check-in)
  // =========================================================================
  // Sinh viên có thể tick check-out là sinh viên đang ở trạng thái "Đã check-in"
  const pendingCheckOutStudents = checkOutFilteredStudents.filter(s => s.status === "Đã check-in")

  const handleToggleCheckOut = (id: string) => {
    setSelectedCheckOutIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const handleToggleSelectAllCheckOut = () => {
    const pendingIds = pendingCheckOutStudents.map(s => s.id)
    const isAllSelected = pendingIds.length > 0 && pendingIds.every(id => selectedCheckOutIds.includes(id))

    if (isAllSelected) {
      setSelectedCheckOutIds(prev => prev.filter(id => !pendingIds.includes(id)))
    } else {
      setSelectedCheckOutIds(prev => Array.from(new Set([...prev, ...pendingIds])))
    }
  }

  // Khi MOD bấm nút "Xác nhận Check-out":
  // Kiểm tra nếu có sinh viên ĐÃ CHECK-IN nhưng KHÔNG ĐƯỢC TICK CHECK-OUT
  const handleCheckOutButtonClick = () => {
    // Tìm các sinh viên trong danh sách ĐÃ CHECK-IN mà MOD không chọn lúc check-out
    const missing = pendingCheckOutStudents.filter(s => !selectedCheckOutIds.includes(s.id))

    if (missing.length > 0) {
      // Hiển thị Popup cảnh báo sinh viên vắng check-out kèm Họ tên + Ngành + MSSV + SĐT
      setMissingStudents(missing)
      setShowMissingCheckOutPopup(true)
    } else {
      // Không có ai vắng -> Hiện modal xác nhận hoàn tất bình thường
      setShowSuccessCheckOutModal(true)
    }
  }

  // MOD bấm "Xác nhận & Thoát ra để tự gọi điện kiểm tra" trên Popup cảnh báo sinh viên vắng
  const handleConfirmMissingPopupAndExit = () => {
    const nowTimeStr = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    
    // Cập nhật:
    // 1. Những sinh viên được tick chọn -> "Đã check-out"
    // 2. Những sinh viên vắng mặt -> "Vắng check-out" (Cần gọi điện xác minh)
    const missingIds = missingStudents.map(s => s.id)

    const updated = students.map(student => {
      if (selectedCheckOutIds.includes(student.id)) {
        return {
          ...student,
          status: "Đã check-out" as const,
          checkOutTime: nowTimeStr,
          verifiedBy: "Cán bộ MOD"
        }
      }
      if (missingIds.includes(student.id)) {
        return {
          ...student,
          status: "Vắng check-out" as const,
          callStatus: "Chưa liên hệ" as const,
          verifiedBy: "Cán bộ MOD"
        }
      }
      return student
    })

    setStudents(updated)
    try {
      localStorage.setItem(`gdu_attendance_${event.id}`, JSON.stringify(updated))
      recordTrainingPoints(selectedCheckOutIds)
    } catch {
      // Ignore
    }

    const checkOutCount = selectedCheckOutIds.length
    const missingCount = missingIds.length

    setSelectedCheckOutIds([])
    setShowMissingCheckOutPopup(false)

    setSuccessToast({
      message: `Đã ghi nhận Check-out cho ${checkOutCount} SV. Có ${missingCount} sinh viên vắng check-out cần MOD gọi điện thoại kiểm tra an toàn bên dưới.`,
      count: checkOutCount
    })

    setTimeout(() => setSuccessToast(null), 5000)
  }

  // Xác nhận check-out khi tất cả sinh viên đều có mặt
  const handleConfirmAllCheckOut = () => {
    const nowTimeStr = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })

    const updated = students.map(student => {
      if (selectedCheckOutIds.includes(student.id)) {
        return {
          ...student,
          status: "Đã check-out" as const,
          checkOutTime: nowTimeStr,
          verifiedBy: "Cán bộ MOD"
        }
      }
      return student
    })

    setStudents(updated)
    try {
      localStorage.setItem(`gdu_attendance_${event.id}`, JSON.stringify(updated))
      recordTrainingPoints(selectedCheckOutIds)
    } catch {
      // Ignore
    }

    const count = selectedCheckOutIds.length
    setSelectedCheckOutIds([])
    setShowSuccessCheckOutModal(false)

    setSuccessToast({
      message: `Đã hoàn tất Check-out cho toàn bộ ${count} sinh viên và cộng +${event.points} điểm rèn luyện!`,
      points: event.points,
      count
    })

    setTimeout(() => setSuccessToast(null), 4000)
  }

  // =========================================================================
  // XỬ LÝ TRƯỜNG HỢP GỌI XÁC NHẬN XONG -> CHO MOD CHECKBOX LẠI LẦN NỮA
  // =========================================================================
  // Đánh dấu MOD đã gọi điện thoại cho sinh viên
  const handleMarkCallStatus = (studentId: string, status: "Đã gọi xác nhận" | "Không liên lạc được") => {
    const updated = students.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          callStatus: status,
          callNote: status === "Đã gọi xác nhận" 
            ? "Đã liên hệ qua điện thoại, xác nhận hoàn thành hoạt động." 
            : "Gọi nhiều lần không nghe máy."
        }
      }
      return s
    })

    setStudents(updated)
    try {
      localStorage.setItem(`gdu_attendance_${event.id}`, JSON.stringify(updated))
    } catch {
      // Ignore
    }

    // Nếu đã gọi xác nhận thành công, tự động gợi ý chọn vào checkbox lại lần nữa
    if (status === "Đã gọi xác nhận") {
      setSelectedVerifiedIds(prev => Array.from(new Set([...prev, studentId])))
    } else {
      setSelectedVerifiedIds(prev => prev.filter(id => id !== studentId))
    }
  }

  const handleToggleSelectVerified = (id: string) => {
    setSelectedVerifiedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  // MOD bấm xác nhận hoàn tất Check-out cho các sinh viên đã gọi điện thoại
  const handleConfirmVerifiedCheckOut = () => {
    const nowTimeStr = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })

    const updated = students.map(student => {
      if (selectedVerifiedIds.includes(student.id)) {
        return {
          ...student,
          status: "Đã check-out" as const,
          checkOutTime: nowTimeStr,
          callStatus: "Đã gọi xác nhận" as const,
          callNote: "Đã xác nhận an toàn qua điện thoại và duyệt hoàn thành check-out.",
          verifiedBy: "Cán bộ MOD"
        }
      }
      return student
    })

    setStudents(updated)
    try {
      localStorage.setItem(`gdu_attendance_${event.id}`, JSON.stringify(updated))
      recordTrainingPoints(selectedVerifiedIds)
    } catch {
      // Ignore
    }

    const count = selectedVerifiedIds.length
    setSelectedVerifiedIds([])
    setShowConfirmVerifiedModal(false)

    setSuccessToast({
      message: `Đã xác nhận hoàn tất Check-out cho ${count} sinh viên sau khi gọi điện xác minh và cộng +${event.points} điểm rèn luyện!`,
      points: event.points,
      count
    })

    setTimeout(() => setSuccessToast(null), 4000)
  }

  // Hàm phụ trợ lưu điểm rèn luyện vào sổ cái
  const recordTrainingPoints = (studentItemIds: string[]) => {
    try {
      const hasStudentAn = studentItemIds.some(id => {
        const s = students.find(item => item.id === id)
        return s?.studentId === "2024001"
      })

      if (hasStudentAn) {
        const existingHistory = JSON.parse(localStorage.getItem("gdu_training_points_history") || "[]")
        const newEntry = {
          id: `tp-${event.id}-${Date.now()}`,
          eventId: event.id,
          eventTitle: event.title,
          category: (event.category === "Thi đấu" ? "Thi đấu" : "Ngoại khóa") as any,
          points: event.points,
          earnedAt: new Date().toISOString(),
          organizer: event.organizer,
        }
        localStorage.setItem("gdu_training_points_history", JSON.stringify([newEntry, ...existingHistory]))

        const currentPoints = parseInt(localStorage.getItem("gdu_student_total_points") || "85", 10)
        localStorage.setItem("gdu_student_total_points", String(currentPoints + event.points))
      }
    } catch {
      // Ignore
    }
  }

  return (
    <div className="container py-5 sm:py-6 flex flex-col gap-5 max-w-6xl pb-24">
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-[#173A67] text-white p-4 rounded-2xl shadow-xl border border-white/20 flex items-start gap-3 max-w-md animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="h-8 w-8 rounded-full bg-success text-white flex items-center justify-center shrink-0 mt-0.5">
            <Check className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-[14px]">Ghi nhận thành công!</p>
            <p className="text-[12.5px] text-white/90 mt-0.5 leading-snug">
              {successToast.message}
            </p>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-white/60 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3 sm:pb-4">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link href={`/demo/MOD/events/${event.id}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 text-muted hover:text-ink">
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-ink tracking-tight">
                {isOffCampus ? "Điểm danh Sự kiện Ngoại khóa" : "Điểm danh trực tiếp"}
              </h1>
              {isOffCampus ? (
                <span className="text-[10.5px] sm:text-[11px] font-semibold text-[#A66A12] bg-[#FBF5E5] px-2.5 py-0.5 rounded-full border border-[#D8B24F]/30">
                  Quy trình 2 bước: Check-in & Check-out
                </span>
              ) : (
                <span className="text-[10.5px] sm:text-[11px] font-semibold text-primary bg-primary-soft px-2.5 py-0.5 rounded-full">
                  Quét QR + GPS
                </span>
              )}
            </div>
            <p className="text-[12px] sm:text-[13px] text-body mt-0.5 font-medium flex items-center gap-1.5 sm:gap-2">
              <span className="truncate max-w-[240px] sm:max-w-none">{event.title}</span>
              <span className="text-muted">•</span>
              <span className="text-accent-active font-semibold">+{event.points}đ rèn luyện</span>
            </p>
          </div>
        </div>

        {!isOffCampus && (
          <div className="flex items-center gap-2">
            <Link href={`/demo/MOD/events/${event.id}/projector`} className="w-full sm:w-auto">
              <Button variant="primary" className="w-full sm:w-auto h-8.5 sm:h-9 text-[12px] sm:text-[13px] px-3 font-semibold">
                <QrCode className="h-3.5 w-3.5 mr-1.5" /> Mở Projector MOD
              </Button>
            </Link>
          </div>
        )}
      </header>

      {/* Thông tin hướng dẫn Ngoại khóa */}
      {isOffCampus && (
        <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-canvas border border-border/80 flex flex-col gap-2.5 shadow-xs">
          <div className="flex items-start gap-2.5 sm:gap-3">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[13px] sm:text-[14px] font-bold text-ink">
                  Nghiệp vụ kiểm soát điểm danh Ngoại khóa (Check-in & Check-out)
                </p>
                <span className="text-[10.5px] font-semibold text-primary bg-primary-soft px-2 py-0.5 rounded-md">
                  Không quét QR
                </span>
              </div>
              <p className="text-[12px] sm:text-[12.5px] text-body mt-1 leading-relaxed">
                <strong>Bước 1: Check-in</strong> lúc xuất phát/tập trung. <strong className="ml-1">Bước 2: Check-out</strong> lúc ra về với danh sách lấy từ những người đã Check-in. Trường hợp sinh viên vắng mặt lúc Check-out, MOD bấm xác nhận để hiển thị thông tin số điện thoại, gọi điện kiểm tra và checkbox lại lần nữa.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cards thống kê 4 ô */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-surface border border-border rounded-xl p-3 sm:p-4 shadow-xs flex flex-col">
          <span className="text-[10.5px] sm:text-[12px] font-semibold text-muted uppercase tracking-wider">Tổng đăng ký</span>
          <span className="text-xl sm:text-2xl md:text-3xl font-bold text-ink mt-0.5 sm:mt-1">{totalRegisteredCount}</span>
          <span className="text-[10.5px] sm:text-[11.5px] text-muted mt-0.5">Sinh viên nhận vé</span>
        </div>

        <div className="bg-surface border border-border rounded-xl p-3 sm:p-4 shadow-xs flex flex-col">
          <span className="text-[10.5px] sm:text-[12px] font-semibold text-muted uppercase tracking-wider">1. Đã Check-in</span>
          <span className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mt-0.5 sm:mt-1">{checkedInCount}</span>
          <span className="text-[10.5px] sm:text-[11.5px] text-muted mt-0.5">Có mặt đầu giờ</span>
        </div>

        <div className="bg-surface border border-border rounded-xl p-3 sm:p-4 shadow-xs flex flex-col">
          <span className="text-[10.5px] sm:text-[12px] font-semibold text-muted uppercase tracking-wider">2. Đã Check-out</span>
          <span className="text-xl sm:text-2xl md:text-3xl font-bold text-success mt-0.5 sm:mt-1">{completedCheckOutCount}</span>
          <span className="text-[10.5px] sm:text-[11.5px] text-muted mt-0.5">Hoàn tất & Có điểm</span>
        </div>

        <div className="bg-surface border border-border rounded-xl p-3 sm:p-4 shadow-xs flex flex-col">
          <span className="text-[10.5px] sm:text-[12px] font-semibold text-muted uppercase tracking-wider">Vắng Check-out</span>
          <span className="text-xl sm:text-2xl md:text-3xl font-bold text-error mt-0.5 sm:mt-1">{missingCheckOutList.length}</span>
          <span className="text-[10.5px] sm:text-[11.5px] text-muted mt-0.5">Cần gọi xác minh</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* KHU VỰC ĐẶC BIỆT: DANH SÁCH SINH VIÊN VẮNG CHECK-OUT CẦN GỌI ĐIỆN         */}
      {/* Sau khi gọi xác nhận xong sẽ cho MOD checkbox lại lần nữa                 */}
      {/* ========================================================================= */}
      {missingCheckOutList.length > 0 && (
        <div className="bg-[#FFF9F2] border-2 border-[#D8B24F]/70 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-sm animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8B24F]/30 pb-3">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-[#A66A12] text-white flex items-center justify-center shrink-0 mt-0.5">
                <PhoneCall className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-[15px] sm:text-[16px] font-bold text-ink flex items-center gap-2">
                  <span>Danh sách sinh viên vắng Check-out ({missingCheckOutList.length} SV)</span>
                  <span className="text-[10.5px] font-bold bg-[#A66A12] text-white px-2 py-0.5 rounded-full">
                    Cần gọi điện xác minh
                  </span>
                </h3>
                <p className="text-[12px] sm:text-[12.5px] text-body mt-0.5">
                  MOD bấm gọi điện thoại để kiểm tra vị trí/lý do. <strong>Sau khi gọi xác nhận xong</strong>, tích chọn checkbox bên dưới để xác nhận hoàn tất Check-out.
                </p>
              </div>
            </div>

            {/* Action Button: XÁC NHẬN HOÀN TẤT CHO SV ĐÃ GỌI ĐIỆN */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="primary"
                disabled={selectedVerifiedIds.length === 0}
                onClick={() => setShowConfirmVerifiedModal(true)}
                className="w-full sm:w-auto h-9 sm:h-10 px-3.5 sm:px-4 text-[12.5px] sm:text-[13px] font-bold rounded-xl shadow-sm flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Xác nhận Check-out SV đã gọi ({selectedVerifiedIds.length})</span>
              </Button>
            </div>
          </div>

          {/* Bảng danh sách sinh viên vắng check-out để gọi điện & Checkbox lại lần nữa */}
          <div className="flex flex-col gap-2.5">
            {missingCheckOutList.map((student) => {
              const isCheckedAgain = selectedVerifiedIds.includes(student.id)
              const isCallDone = student.callStatus === "Đã gọi xác nhận"

              return (
                <div 
                  key={student.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    isCallDone 
                      ? "bg-success/5 border-success/30 shadow-xs" 
                      : "bg-surface border-[#D8B24F]/40"
                  }`}
                >
                  {/* Bên trái: Checkbox chọn lại + Thông tin Họ tên, MSSV, Ngành */}
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleSelectVerified(student.id)}
                      className="p-1 rounded text-primary hover:bg-primary-soft transition-colors shrink-0 mt-0.5 sm:mt-0"
                      title={isCheckedAgain ? "Bỏ chọn" : "Tích chọn để check-out sau khi gọi"}
                    >
                      {isCheckedAgain ? (
                        <CheckSquare className="h-5 w-5 text-primary" />
                      ) : (
                        <Square className="h-5 w-5 text-muted" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[13px] font-bold text-ink">{student.studentId}</span>
                        <span className="text-[13.5px] font-bold text-ink">{student.fullName}</span>
                        <span className="text-[11.5px] text-muted">({student.className} - {student.major})</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2.5 text-[12px] text-body mt-1">
                        <span className="text-muted">Giờ vào: {student.checkInTime || "Đã check-in"}</span>
                        <span className="text-muted">•</span>
                        <span className="text-error font-medium flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>Chưa có mặt lúc Check-out</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bên phải: Số điện thoại + Nút gọi điện + Nút đánh dấu gọi */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border/60">
                    {/* Bấm gọi nhanh */}
                    <a
                      href={`tel:${student.phoneNumber}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white font-mono text-[12.5px] font-bold hover:bg-primary-hover shadow-xs transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>{student.phoneNumber}</span>
                    </a>

                    {/* Nút đánh dấu: Đã gọi xác nhận hay chưa */}
                    {student.callStatus === "Đã gọi xác nhận" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11.5px] font-bold bg-success/15 text-success border border-success/30">
                        <Check className="h-3.5 w-3.5" />
                        <span>Đã gọi xác nhận</span>
                      </span>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMarkCallStatus(student.id, "Đã gọi xác nhận")}
                          className="px-2.5 py-1.5 text-[11.5px] font-bold bg-[#21835A] text-white rounded-xl hover:bg-[#1a6948] transition-colors"
                        >
                          Xác nhận đã gọi xong
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMarkCallStatus(student.id, "Không liên lạc được")}
                          className="px-2 py-1.5 text-[11.5px] font-medium bg-canvas text-muted hover:text-error rounded-xl border border-border transition-colors"
                        >
                          Không nghe máy
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB CHUYỂN ĐỔI: 1. CHECK-IN (ĐẦU GIỜ) vs 2. CHECK-OUT (RA VỀ)            */}
      {/* ========================================================================= */}
      <div className="bg-surface border border-border rounded-xl sm:rounded-2xl p-3 sm:p-5 flex flex-col gap-4 shadow-sm">
        {/* Thanh chuyển Tab */}
        <div className="flex border-b border-border/80 gap-2 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("CHECK_IN")}
            className={`flex items-center gap-2 px-3.5 sm:px-5 py-2.5 rounded-xl text-[13px] sm:text-[14px] font-bold transition-all ${
              activeTab === "CHECK_IN"
                ? "bg-primary text-white shadow-xs"
                : "bg-canvas text-body hover:text-ink hover:bg-canvas/80"
            }`}
          >
            <span>1. Check-in (Đầu giờ)</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full ${
              activeTab === "CHECK_IN" ? "bg-white/20 text-white" : "bg-border text-muted"
            }`}>
              {unattendedCheckInCount} chưa điểm danh
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("CHECK_OUT")}
            className={`flex items-center gap-2 px-3.5 sm:px-5 py-2.5 rounded-xl text-[13px] sm:text-[14px] font-bold transition-all ${
              activeTab === "CHECK_OUT"
                ? "bg-primary text-white shadow-xs"
                : "bg-canvas text-body hover:text-ink hover:bg-canvas/80"
            }`}
          >
            <span>2. Check-out (Ra về)</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full ${
              activeTab === "CHECK_OUT" ? "bg-white/20 text-white" : "bg-border text-muted"
            }`}>
              {checkedInPool.length} đã Check-in
            </span>
          </button>
        </div>

        {/* Thanh tìm kiếm & Nút hành động */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none" />
            <input 
              type="text" 
              placeholder="Tìm theo MSSV, Họ tên, SĐT hoặc Lớp..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9.5 pl-8.5 pr-3 text-[12.5px] sm:text-[13px] bg-canvas border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-ink"
            />
          </div>

          {/* Action Button theo Tab */}
          <div className="flex items-center gap-2">
            {activeTab === "CHECK_IN" ? (
              <Button
                type="button"
                variant="primary"
                disabled={selectedCheckInIds.length === 0}
                onClick={() => setShowConfirmCheckInModal(true)}
                className="w-full sm:w-auto h-9.5 sm:h-10 px-4 rounded-xl font-bold text-[13px] shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Xác nhận Check-in ({selectedCheckInIds.length} SV)</span>
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                disabled={selectedCheckOutIds.length === 0}
                onClick={handleCheckOutButtonClick}
                className="w-full sm:w-auto h-9.5 sm:h-10 px-4 rounded-xl font-bold text-[13px] shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Xác nhận Check-out ({selectedCheckOutIds.length} SV)</span>
              </Button>
            )}
          </div>
        </div>

        {/* Chọn tất cả */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 px-2 py-1.5 bg-canvas/70 rounded-xl text-[11.5px] sm:text-[12.5px] text-body">
          {activeTab === "CHECK_IN" ? (
            <button 
              type="button"
              onClick={handleToggleSelectAllCheckIn}
              className="flex items-center gap-2 font-semibold text-ink hover:text-primary transition-colors py-1 px-1 rounded text-left"
            >
              {pendingCheckInStudents.length > 0 && pendingCheckInStudents.every(s => selectedCheckInIds.includes(s.id)) ? (
                <CheckSquare className="h-4 w-4 text-primary shrink-0" />
              ) : (
                <Square className="h-4 w-4 text-muted shrink-0" />
              )}
              <span>Chọn tất cả sinh viên chưa Check-in ({pendingCheckInStudents.length})</span>
            </button>
          ) : (
            <button 
              type="button"
              onClick={handleToggleSelectAllCheckOut}
              className="flex items-center gap-2 font-semibold text-ink hover:text-primary transition-colors py-1 px-1 rounded text-left"
            >
              {pendingCheckOutStudents.length > 0 && pendingCheckOutStudents.every(s => selectedCheckOutIds.includes(s.id)) ? (
                <CheckSquare className="h-4 w-4 text-primary shrink-0" />
              ) : (
                <Square className="h-4 w-4 text-muted shrink-0" />
              )}
              <span>Chọn tất cả sinh viên có mặt lúc Check-out ({pendingCheckOutStudents.length})</span>
            </button>
          )}

          <span className="text-muted font-medium px-1">
            Đang chọn: <strong className="text-primary font-bold">
              {activeTab === "CHECK_IN" ? selectedCheckInIds.length : selectedCheckOutIds.length}
            </strong> sinh viên
          </span>
        </div>

        {/* ========================================================================= */}
        {/* NỘI DUNG DANH SÁCH: TAB 1 (CHECK-IN)                                      */}
        {/* ========================================================================= */}
        {activeTab === "CHECK_IN" && (
          <div>
            {/* Mobile View: Data Cards */}
            <div className="flex flex-col gap-2 md:hidden">
              {checkInFilteredStudents.length === 0 ? (
                <div className="p-6 text-center text-muted text-[12.5px] bg-canvas/40 rounded-xl border border-border/60">
                  Không tìm thấy sinh viên phù hợp.
                </div>
              ) : (
                checkInFilteredStudents.map((student, idx) => {
                  const isChecked = selectedCheckInIds.includes(student.id)
                  const isCheckedIn = student.status === "Đã check-in" || student.status === "Đã check-out"

                  return (
                    <div
                      key={student.id}
                      onClick={() => !isCheckedIn && handleToggleCheckIn(student.id)}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-2.5 ${
                        isCheckedIn 
                          ? "bg-success/5 border-success/20 opacity-80" 
                          : isChecked 
                            ? "bg-primary-soft/70 border-primary/40 cursor-pointer" 
                            : "bg-surface border-border/80 hover:bg-canvas/60 cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {!isCheckedIn ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleCheckIn(student.id)
                            }}
                            className="p-1 rounded text-primary hover:bg-primary-soft shrink-0"
                          >
                            {isChecked ? (
                              <CheckSquare className="h-5 w-5 text-primary" />
                            ) : (
                              <Square className="h-5 w-5 text-muted" />
                            )}
                          </button>
                        ) : (
                          <div className="p-1 text-success shrink-0">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[12.5px] font-bold text-ink">{student.studentId}</span>
                            <span className="text-[11px] text-muted">({student.className})</span>
                          </div>
                          <p className="text-[13px] font-bold text-ink truncate mt-0.5">{student.fullName}</p>
                          <p className="text-[11.5px] text-primary font-mono font-medium">{student.phoneNumber}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {isCheckedIn ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-success/15 text-success border border-success/30">
                            Đã Check-in
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-canvas text-muted border border-border">
                            Chưa Check-in
                          </span>
                        )}
                        {student.checkInTime && (
                          <span className="font-mono text-[10.5px] text-success font-semibold">{student.checkInTime}</span>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Desktop View: Full Table */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-border/70">
              <table className="w-full text-[13px] text-left border-collapse">
                <thead>
                  <tr className="bg-canvas border-b border-border/80 text-muted font-semibold">
                    <th className="p-3 w-12 text-center">Chọn</th>
                    <th className="p-3 w-14">STT</th>
                    <th className="p-3">MSSV</th>
                    <th className="p-3">Họ và tên</th>
                    <th className="p-3">Số điện thoại</th>
                    <th className="p-3">Lớp & Ngành</th>
                    <th className="p-3">Trạng thái Check-in</th>
                    <th className="p-3 text-right">Giờ vào</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {checkInFilteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-muted">
                        Không tìm thấy sinh viên phù hợp.
                      </td>
                    </tr>
                  ) : (
                    checkInFilteredStudents.map((student, idx) => {
                      const isChecked = selectedCheckInIds.includes(student.id)
                      const isCheckedIn = student.status === "Đã check-in" || student.status === "Đã check-out"

                      return (
                        <tr 
                          key={student.id} 
                          className={`transition-colors select-none ${
                            isCheckedIn 
                              ? "bg-success/5 hover:bg-success/10" 
                              : isChecked 
                                ? "bg-primary-soft/60 hover:bg-primary-soft cursor-pointer" 
                                : "hover:bg-canvas/50 cursor-pointer"
                          }`}
                          onClick={() => !isCheckedIn && handleToggleCheckIn(student.id)}
                        >
                          <td className="p-3 text-center">
                            {!isCheckedIn ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleToggleCheckIn(student.id)
                                }}
                                className="p-1 rounded text-primary hover:bg-primary-soft inline-flex items-center justify-center"
                              >
                                {isChecked ? (
                                  <CheckSquare className="h-4.5 w-4.5 text-primary" />
                                ) : (
                                  <Square className="h-4.5 w-4.5 text-muted" />
                                )}
                              </button>
                            ) : (
                              <CheckCircle2 className="h-4.5 w-4.5 text-success inline-block" />
                            )}
                          </td>
                          <td className="p-3 text-muted font-medium">{idx + 1}</td>
                          <td className="p-3 font-mono font-bold text-ink">{student.studentId}</td>
                          <td className="p-3 font-semibold text-ink">{student.fullName}</td>
                          <td className="p-3 font-mono text-primary font-bold">{student.phoneNumber}</td>
                          <td className="p-3 text-body">
                            <span className="font-medium text-ink">{student.className}</span>
                            <span className="text-muted block text-[11.5px]">{student.major}</span>
                          </td>
                          <td className="p-3">
                            {isCheckedIn ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11.5px] font-bold bg-success/15 text-success border border-success/30">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Đã Check-in</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11.5px] font-medium bg-canvas text-muted border border-border">
                                Chưa Check-in
                              </span>
                            )}
                          </td>
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
        )}

        {/* ========================================================================= */}
        {/* NỘI DUNG DANH SÁCH: TAB 2 (CHECK-OUT - DỮ LIỆU MỚI TỪ DANH SÁCH CHECK-IN) */}
        {/* ========================================================================= */}
        {activeTab === "CHECK_OUT" && (
          <div>
            {checkedInPool.length === 0 ? (
              <div className="p-8 text-center bg-canvas/50 rounded-2xl border border-dashed border-border flex flex-col items-center gap-3">
                <AlertCircle className="h-8 w-8 text-muted" />
                <div>
                  <p className="font-bold text-ink text-[15px]">Chưa có sinh viên nào Check-in đầu giờ</p>
                  <p className="text-[13px] text-muted mt-1 max-w-md">
                    Danh sách Check-out được tạo tự động từ các sinh viên đã Check-in ở Bước 1. Vui lòng quay lại Tab Check-in để điểm danh trước.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab("CHECK_IN")}
                  className="mt-1 font-semibold"
                >
                  Chuyển sang Tab 1: Check-in
                </Button>
              </div>
            ) : (
              <>
                {/* Mobile View: Data Cards */}
                <div className="flex flex-col gap-2 md:hidden">
                  {checkOutFilteredStudents.map((student, idx) => {
                    const isChecked = selectedCheckOutIds.includes(student.id)
                    const isDone = student.status === "Đã check-out"
                    const isMissing = student.status === "Vắng check-out"

                    return (
                      <div
                        key={student.id}
                        onClick={() => !isDone && handleToggleCheckOut(student.id)}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-2.5 ${
                          isDone 
                            ? "bg-success/5 border-success/30" 
                            : isMissing
                              ? "bg-error/5 border-error/30"
                              : isChecked 
                                ? "bg-primary-soft/70 border-primary/40 cursor-pointer" 
                                : "bg-surface border-border/80 hover:bg-canvas/60 cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {!isDone ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleToggleCheckOut(student.id)
                              }}
                              className="p-1 rounded text-primary hover:bg-primary-soft shrink-0"
                            >
                              {isChecked ? (
                                <CheckSquare className="h-5 w-5 text-primary" />
                              ) : (
                                <Square className="h-5 w-5 text-muted" />
                              )}
                            </button>
                          ) : (
                            <div className="p-1 text-success shrink-0">
                              <CheckCircle2 className="h-5 w-5" />
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[12.5px] font-bold text-ink">{student.studentId}</span>
                              <span className="text-[11px] text-muted truncate">({student.className})</span>
                            </div>
                            <p className="text-[13px] font-bold text-ink truncate mt-0.5">{student.fullName}</p>
                            <p className="text-[11.5px] text-primary font-mono font-bold">{student.phoneNumber}</p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {isDone ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-success/15 text-success border border-success/30">
                              Đã Check-out
                            </span>
                          ) : isMissing ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-error/15 text-error border border-error/30">
                              Vắng Check-out
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-canvas text-muted border border-border">
                              Chờ Check-out
                            </span>
                          )}
                          {student.checkOutTime && (
                            <span className="font-mono text-[10.5px] text-success font-semibold">{student.checkOutTime}</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Desktop View: Full Table */}
                <div className="hidden md:block overflow-x-auto rounded-xl border border-border/70">
                  <table className="w-full text-[13px] text-left border-collapse">
                    <thead>
                      <tr className="bg-canvas border-b border-border/80 text-muted font-semibold">
                        <th className="p-3 w-12 text-center">Chọn</th>
                        <th className="p-3 w-14">STT</th>
                        <th className="p-3">MSSV</th>
                        <th className="p-3">Họ và tên</th>
                        <th className="p-3">Số điện thoại</th>
                        <th className="p-3">Ngành & Lớp</th>
                        <th className="p-3">Giờ Check-in</th>
                        <th className="p-3">Trạng thái Check-out</th>
                        <th className="p-3 text-right">Giờ ra về</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {checkOutFilteredStudents.map((student, idx) => {
                        const isChecked = selectedCheckOutIds.includes(student.id)
                        const isDone = student.status === "Đã check-out"
                        const isMissing = student.status === "Vắng check-out"

                        return (
                          <tr 
                            key={student.id} 
                            className={`transition-colors select-none ${
                              isDone 
                                ? "bg-success/5 hover:bg-success/10" 
                                : isMissing
                                  ? "bg-error/5 hover:bg-error/10"
                                  : isChecked 
                                    ? "bg-primary-soft/60 hover:bg-primary-soft cursor-pointer" 
                                    : "hover:bg-canvas/50 cursor-pointer"
                            }`}
                            onClick={() => !isDone && handleToggleCheckOut(student.id)}
                          >
                            <td className="p-3 text-center">
                              {!isDone ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleToggleCheckOut(student.id)
                                  }}
                                  className="p-1 rounded text-primary hover:bg-primary-soft inline-flex items-center justify-center"
                                >
                                  {isChecked ? (
                                    <CheckSquare className="h-4.5 w-4.5 text-primary" />
                                  ) : (
                                    <Square className="h-4.5 w-4.5 text-muted" />
                                  )}
                                </button>
                              ) : (
                                <CheckCircle2 className="h-4.5 w-4.5 text-success inline-block" />
                              )}
                            </td>
                            <td className="p-3 text-muted font-medium">{idx + 1}</td>
                            <td className="p-3 font-mono font-bold text-ink">{student.studentId}</td>
                            <td className="p-3 font-semibold text-ink">{student.fullName}</td>
                            <td className="p-3 font-mono text-primary font-bold">{student.phoneNumber}</td>
                            <td className="p-3 text-body">
                              <span className="font-medium text-ink">{student.className}</span>
                              <span className="text-muted block text-[11.5px]">{student.major}</span>
                            </td>
                            <td className="p-3 font-mono text-muted text-[12px]">{student.checkInTime || "Đã vào"}</td>
                            <td className="p-3">
                              {isDone ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11.5px] font-bold bg-success/15 text-success border border-success/30">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  <span>Đã Check-out</span>
                                </span>
                              ) : isMissing ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11.5px] font-bold bg-error/15 text-error border border-error/30">
                                  <AlertCircle className="h-3.5 w-3.5" />
                                  <span>Vắng Check-out</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11.5px] font-medium bg-canvas text-muted border border-border">
                                  Chờ Check-out
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right font-mono text-[12px] text-body">
                              {student.checkOutTime ? (
                                <span className="font-semibold text-success">{student.checkOutTime}</span>
                              ) : (
                                <span className="text-muted/60">—</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: XÁC NHẬN CHECK-IN (Đầu giờ)                                      */}
      {/* ========================================================================= */}
      {showConfirmCheckInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-2xl max-w-lg w-full flex flex-col gap-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-ink">
                    Xác nhận Check-in {selectedCheckInIds.length} sinh viên
                  </h3>
                  <p className="text-[12.5px] text-muted mt-0.5">
                    Sự kiện: {event.title}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowConfirmCheckInModal(false)} className="text-muted hover:text-ink p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-canvas border border-border flex flex-col gap-2.5 text-[13px]">
              <div className="flex justify-between">
                <span className="text-body">Số lượng sinh viên có mặt:</span>
                <span className="font-bold text-ink">{selectedCheckInIds.length} sinh viên</span>
              </div>
              <div className="flex justify-between">
                <span className="text-body">Quy trình tiếp theo:</span>
                <span className="font-semibold text-primary">Chuyển vào danh sách chờ Check-out</span>
              </div>
            </div>

            <p className="text-[12.5px] text-muted leading-relaxed">
              Các sinh viên được chọn sẽ chuyển sang trạng thái <strong>"Đã check-in"</strong> và sẵn sàng để điểm danh ra về tại Bước 2 (Check-out).
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/80">
              <Button variant="outline" onClick={() => setShowConfirmCheckInModal(false)}>
                Hủy bỏ
              </Button>
              <Button variant="primary" onClick={handleConfirmCheckIn} className="font-bold">
                Xác nhận Check-in
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* POPUP QUAN TRỌNG: CẢNH BÁO SINH VIÊN VẮNG CHECK-OUT                       */}
      {/* Hiển thị Họ tên + Ngành + MSSV + SDT                                      */}
      {/* Bấm xác nhận để thoát ra khỏi popup đó MOD tự gọi điện thoại kiểm tra     */}
      {/* ========================================================================= */}
      {showMissingCheckOutPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl border-2 border-error/40 p-5 sm:p-6 shadow-2xl max-w-2xl w-full flex flex-col gap-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-hidden">
            {/* Header cảnh báo */}
            <div className="flex items-start justify-between border-b border-border/80 pb-3">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-error text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-[16.5px] sm:text-[18px] font-bold text-ink flex items-center gap-2">
                    <span>Phát hiện {missingStudents.length} sinh viên vắng mặt lúc Check-out!</span>
                  </h3>
                  <p className="text-[12.5px] sm:text-[13px] text-error font-medium mt-0.5">
                    Sinh viên đã Check-in đầu giờ nhưng không có mặt điểm danh ra về.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowMissingCheckOutPopup(false)}
                className="text-muted hover:text-ink p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Hướng dẫn nghiệp vụ */}
            <div className="p-3 bg-error/5 border border-error/20 rounded-xl text-[12.5px] text-body flex items-start gap-2.5">
              <Info className="h-4 w-4 text-error shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Để đảm bảo an toàn cho hoạt động ngoại khóa, <strong>Cán bộ MOD cần trực tiếp gọi điện thoại theo số bên dưới</strong> để xác minh vị trí và tình trạng của sinh viên. Bấm nút <strong>"Xác nhận & Thoát ra để gọi điện"</strong> để lưu danh sách cần xử lý.
              </p>
            </div>

            {/* DANH SÁCH SINH VIÊN VẮNG: ĐẦY ĐỦ HỌ TÊN + NGÀNH + MSSV + SDT */}
            <div className="overflow-y-auto max-h-[45vh] flex flex-col gap-2.5 pr-1">
              <div className="text-[12px] font-bold text-muted uppercase tracking-wider px-1">
                Danh sách chi tiết sinh viên vắng Check-out ({missingStudents.length}):
              </div>

              {missingStudents.map((student, idx) => (
                <div 
                  key={student.id}
                  className="p-3.5 bg-canvas rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="font-mono text-[12px] font-bold text-muted bg-surface h-6 w-6 rounded-full border border-border flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      {/* Họ tên */}
                      <p className="text-[14.5px] font-bold text-ink">
                        {student.fullName}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] mt-1">
                        {/* MSSV */}
                        <span className="text-body">
                          MSSV: <strong className="font-mono text-ink">{student.studentId}</strong>
                        </span>
                        <span className="text-muted">•</span>
                        {/* Ngành */}
                        <span className="text-body">
                          Ngành: <strong className="text-ink">{student.major}</strong>
                        </span>
                        <span className="text-muted">•</span>
                        {/* Lớp */}
                        <span className="text-muted">Lớp: {student.className}</span>
                      </div>
                    </div>
                  </div>

                  {/* SỐ ĐIỆN THOẠI (SDT) & NÚT GỌI ĐIỆN TRỰC TIẾP */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
                    <div className="flex flex-col sm:items-end">
                      <span className="text-[11px] text-muted font-medium">Số điện thoại liên hệ:</span>
                      <span className="font-mono font-bold text-primary text-[14px]">
                        {student.phoneNumber}
                      </span>
                    </div>

                    <a 
                      href={`tel:${student.phoneNumber}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white font-semibold text-[12px] hover:bg-primary-hover shadow-xs transition-colors"
                      title="Gọi điện ngay"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>Gọi ngay</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer hành động: BẤM XÁC NHẬN ĐỂ THOÁT RA KHỎI POPUP MOD TỰ GỌI ĐIỆN THOẠI */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border/80">
              <span className="text-[12px] text-muted text-center sm:text-left">
                * Sau khi gọi xong, hệ thống sẽ cho phép MOD checkbox lại lần nữa.
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowMissingCheckOutPopup(false)}
                  className="w-full sm:w-auto text-[13px]"
                >
                  Quay lại kiểm tra
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleConfirmMissingPopupAndExit}
                  className="w-full sm:w-auto text-[13px] font-bold bg-[#A66A12] hover:bg-[#8e5a0e] text-white flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <PhoneCall className="h-4 w-4" />
                  <span>Xác nhận & Thoát ra để gọi điện</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: XÁC NHẬN CHECK-OUT KHI TẤT CẢ SINH VIÊN ĐỀU CÓ MẶT               */}
      {/* ========================================================================= */}
      {showSuccessCheckOutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-2xl max-w-lg w-full flex flex-col gap-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-success text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-ink">
                    Xác nhận hoàn tất Check-out
                  </h3>
                  <p className="text-[12.5px] text-muted mt-0.5">
                    Tất cả sinh viên có mặt đầy đủ ({selectedCheckOutIds.length} SV)
                  </p>
                </div>
              </div>
              <button onClick={() => setShowSuccessCheckOutModal(false)} className="text-muted hover:text-ink p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-canvas border border-border flex flex-col gap-2.5 text-[13px]">
              <div className="flex justify-between">
                <span className="text-body font-medium">Số lượng hoàn tất Check-out:</span>
                <span className="font-bold text-ink">{selectedCheckOutIds.length} sinh viên</span>
              </div>
              <div className="flex justify-between">
                <span className="text-body font-medium">Điểm rèn luyện cộng mỗi SV:</span>
                <span className="font-bold text-success">+{event.points} điểm</span>
              </div>
            </div>

            <p className="text-[12.5px] text-muted leading-relaxed">
              Toàn bộ sinh viên được chọn sẽ được chuyển sang trạng thái <strong>"Đã check-out"</strong> và tự động cộng <strong>+{event.points} điểm rèn luyện</strong> vào sổ cái 3 năm.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/80">
              <Button variant="outline" onClick={() => setShowSuccessCheckOutModal(false)}>
                Hủy bỏ
              </Button>
              <Button variant="primary" onClick={handleConfirmAllCheckOut} className="font-bold">
                Xác nhận & Hoàn tất
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: XÁC NHẬN CHECK-OUT CHO CÁC SV ĐÃ GỌI ĐIỆN THOẠI XÁC MINH         */}
      {/* ========================================================================= */}
      {showConfirmVerifiedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-surface rounded-2xl border border-border p-6 shadow-2xl max-w-lg w-full flex flex-col gap-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
                  <UserCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-ink">
                    Duyệt Check-out sau xác minh điện thoại
                  </h3>
                  <p className="text-[12.5px] text-muted mt-0.5">
                    Số lượng: {selectedVerifiedIds.length} sinh viên
                  </p>
                </div>
              </div>
              <button onClick={() => setShowConfirmVerifiedModal(false)} className="text-muted hover:text-ink p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-canvas border border-border flex flex-col gap-2.5 text-[13px]">
              <div className="flex justify-between">
                <span className="text-body font-medium">Sinh viên đã gọi điện xác minh:</span>
                <span className="font-bold text-ink">{selectedVerifiedIds.length} sinh viên</span>
              </div>
              <div className="flex justify-between">
                <span className="text-body font-medium">Điểm rèn luyện cộng:</span>
                <span className="font-bold text-success">+{event.points} điểm rèn luyện</span>
              </div>
              <div className="flex justify-between">
                <span className="text-body font-medium">Ghi chú lưu vết:</span>
                <span className="font-semibold text-primary">Đã xác minh qua điện thoại bởi MOD</span>
              </div>
            </div>

            <p className="text-[12.5px] text-muted leading-relaxed">
              Các sinh viên này sẽ được công nhận hoàn tất hoạt động ngoại khóa, chuyển trạng thái sang <strong>"Đã check-out"</strong> và nhận điểm rèn luyện đầy đủ.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/80">
              <Button variant="outline" onClick={() => setShowConfirmVerifiedModal(false)}>
                Hủy bỏ
              </Button>
              <Button variant="primary" onClick={handleConfirmVerifiedCheckOut} className="font-bold">
                Xác nhận & Cộng điểm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
