"use client"

import { useState, useEffect } from "react"
import { Event } from "@/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { 
  AlertCircle, 
  Calendar, 
  MapPin, 
  Award, 
  Phone, 
  User, 
  ShieldCheck, 
  Edit3, 
  CheckCircle2, 
  ArrowLeft, 
  Info,
  Clock,
  Sparkles
} from "lucide-react"
import { MOCK_STUDENT } from "@/mocks"

export function RegistrationDialog({ event, className }: { event: Event, className?: string }) {
  const [open, setOpen] = useState(false)
  
  // Các bước: "form" -> "review_popup" -> "edit_popup" -> "loading" -> "success"
  const [step, setStep] = useState<"form" | "review_popup" | "edit_popup" | "loading" | "success">("form")

  // Thông tin sinh viên (đã lưu trữ từ trước theo hồ sơ GDU)
  const [studentId, setStudentId] = useState(MOCK_STUDENT.studentId)
  const [fullName, setFullName] = useState(MOCK_STUDENT.fullName)
  const [classNameState, setClassNameState] = useState(MOCK_STUDENT.className)
  const [major, setMajor] = useState(MOCK_STUDENT.major)
  const [phoneNumber, setPhoneNumber] = useState(MOCK_STUDENT.phoneNumber || "0908123456")

  // Form tạm thời khi ở popup chỉnh sửa
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    studentId: "",
    phoneNumber: "",
    major: "",
    className: ""
  })

  // Lỗi xác thực
  const [phoneError, setPhoneError] = useState("")
  const [editErrors, setEditErrors] = useState<{ [key: string]: string }>({})

  const isExtracurricular = event.category === "Ngoại khóa" || event.checkInMethod === "manual_rollcall"
  const isWaitlist = event.registeredCount >= event.capacity

  // Đọc số điện thoại và thông tin sinh viên đã lưu từ localStorage nếu có
  useEffect(() => {
    try {
      const savedPhone = localStorage.getItem("gdu_student_phone")
      if (savedPhone) setPhoneNumber(savedPhone)
      
      const savedName = localStorage.getItem("gdu_student_name")
      if (savedName) setFullName(savedName)

      const savedId = localStorage.getItem("gdu_student_id")
      if (savedId) setStudentId(savedId)
    } catch {
      // Ignore localStorage error
    }
  }, [])

  // Mở popup
  const handleOpen = () => {
    setStep("form")
    setPhoneError("")
    setOpen(true)
  }

  // Validate số điện thoại VN (10 chữ số)
  const validatePhone = (phone: string) => {
    const cleanPhone = phone.trim().replace(/\s+/g, "")
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/
    return phoneRegex.test(cleanPhone)
  }

  // Bấm Tiếp tục từ Form chính -> Sang Popup Hiện lại thông tin để đối soát
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneNumber.trim()) {
      setPhoneError("Vui lòng nhập số điện thoại liên hệ.")
      return
    }
    if (!validatePhone(phoneNumber)) {
      setPhoneError("Số điện thoại không hợp lệ (cần 10 chữ số, ví dụ 0908123456).")
      return
    }
    setPhoneError("")
    setStep("review_popup")
  }

  // Bấm "Thông tin chưa đúng (Chỉnh sửa lại)" -> Mở Popup cho chỉnh sửa
  const handleOpenEditPopup = () => {
    setEditFormData({
      fullName,
      studentId,
      phoneNumber,
      major,
      className: classNameState
    })
    setEditErrors({})
    setStep("edit_popup")
  }

  // Lưu thông tin từ Popup chỉnh sửa và quay lại Popup đối soát
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    const errors: { [key: string]: string } = {}

    if (!editFormData.fullName.trim()) errors.fullName = "Họ và tên không được để trống."
    if (!editFormData.studentId.trim()) errors.studentId = "Mã số sinh viên không được để trống."
    if (!editFormData.phoneNumber.trim()) {
      errors.phoneNumber = "Số điện thoại không được để trống."
    } else if (!validatePhone(editFormData.phoneNumber)) {
      errors.phoneNumber = "Số điện thoại không hợp lệ (cần 10 chữ số)."
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors)
      return
    }

    setFullName(editFormData.fullName.trim())
    setStudentId(editFormData.studentId.trim())
    setPhoneNumber(editFormData.phoneNumber.trim())
    if (editFormData.major) setMajor(editFormData.major.trim())
    if (editFormData.className) setClassNameState(editFormData.className.trim())

    // Lưu vào localStorage
    try {
      localStorage.setItem("gdu_student_phone", editFormData.phoneNumber.trim())
      localStorage.setItem("gdu_student_name", editFormData.fullName.trim())
      localStorage.setItem("gdu_student_id", editFormData.studentId.trim())
    } catch {
      // Ignore
    }

    setStep("review_popup")
  }

  // Bấm "Thông tin chính xác (Xác nhận đăng ký)" -> Thực hiện đăng ký
  const handleConfirmRegister = () => {
    setStep("loading")

    setTimeout(() => {
      try {
        // Lưu số điện thoại vào localStorage
        localStorage.setItem("gdu_student_phone", phoneNumber)

        // Cập nhật vào danh sách điểm danh của MOD cho sự kiện này
        const storageKey = `gdu_attendance_${event.id}`
        const existingData = localStorage.getItem(storageKey)
        let attendanceList = existingData ? JSON.parse(existingData) : []

        // Kiểm tra xem sinh viên đã có trong danh sách chưa
        const existingIndex = attendanceList.findIndex((item: any) => item.studentId === studentId)
        const newRecord = {
          id: existingIndex >= 0 ? attendanceList[existingIndex].id : `reg-${Date.now()}`,
          studentId,
          fullName,
          className: classNameState,
          major,
          phoneNumber,
          registeredAt: new Date().toISOString(),
          status: "Chưa điểm danh" as const,
        }

        if (existingIndex >= 0) {
          attendanceList[existingIndex] = { ...attendanceList[existingIndex], ...newRecord }
        } else {
          attendanceList = [newRecord, ...attendanceList]
        }
        localStorage.setItem(storageKey, JSON.stringify(attendanceList))

        // Lưu vé vào lịch sử đăng ký của sinh viên
        const ticketsKey = "gdu_student_tickets"
        const existingTickets = JSON.parse(localStorage.getItem(ticketsKey) || "[]")
        const newTicket = {
          id: `tk-${event.id}-${Date.now()}`,
          eventId: event.id,
          eventTitle: event.title,
          status: isWaitlist ? "Danh sách chờ" : "Vé chính thức",
          registeredAt: new Date().toISOString(),
          phoneNumber,
          studentId,
          fullName,
          points: event.points
        }
        localStorage.setItem(ticketsKey, JSON.stringify([newTicket, ...existingTickets]))

        // Tăng registeredCount trong localStorage nếu cần
        const currentCount = parseInt(localStorage.getItem(`gdu_event_reg_count_${event.id}`) || String(event.registeredCount), 10)
        localStorage.setItem(`gdu_event_reg_count_${event.id}`, String(currentCount + 1))
      } catch {
        // Ignore localStorage error
      }

      setStep("success")
    }, 1000)
  }

  return (
    <>
      <Button variant="primary" className={className || "w-full md:w-auto"} onClick={handleOpen}>
        Đăng ký tham gia
      </Button>

      <Dialog 
        open={open} 
        onOpenChange={(val) => {
          if (!val && step === "loading") return
          setOpen(val)
          if (!val) setTimeout(() => setStep("form"), 300)
        }}
      >
        <DialogClose onOpenChange={setOpen} />
        
        {/* ========================================================================= */}
        {/* BƯỚC 1: FORM ĐĂNG KÝ (Nhập Số Điện Thoại, Tên & MSSV đã có lưu trữ sẵn) */}
        {/* ========================================================================= */}
        {step === "form" && (
          <form onSubmit={handleSubmitForm} className="flex flex-col">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <DialogTitle>
                  {isExtracurricular ? "Đăng ký tham gia Hoạt động Ngoại khóa" : "Xác nhận đăng ký tham gia"}
                </DialogTitle>
              </div>
              <p className="text-[12.5px] text-muted mt-1 leading-snug">
                Thông tin cá nhân (Họ tên, MSSV) được tự động trích xuất từ hồ sơ sinh viên đã lưu trữ của Nhà trường.
              </p>
            </DialogHeader>

            <DialogContent className="flex flex-col gap-4 py-4 max-h-[75vh] overflow-y-auto">
              {/* Tóm tắt sự kiện */}
              <div className="p-3 bg-canvas rounded-xl border border-border flex flex-col gap-2 text-[12.5px]">
                <div className="font-bold text-ink text-[13.5px] line-clamp-1">{event.title}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-body">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{new Date(event.startTime).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-3.5 w-3.5 text-accent shrink-0" />
                    <span className="font-bold text-primary">+{event.points} điểm rèn luyện</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">{event.location}</span>
                </div>
              </div>

              {/* Thông tin sinh viên đã lưu trữ từ trước */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-success" />
                    <span>Hồ sơ sinh viên (Đã lưu trữ)</span>
                  </span>
                  <span className="text-[11px] font-medium text-success bg-success/10 px-2 py-0.5 rounded-full border border-success/20">
                    Đã xác thực
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Mã số sinh viên (Đã lưu trữ) */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[12px] font-semibold text-muted">Mã số sinh viên (MSSV)</label>
                    <div className="h-10 px-3 bg-canvas/80 border border-border/80 rounded-xl flex items-center justify-between text-[13px] font-mono font-bold text-ink">
                      <span>{studentId}</span>
                      <span className="text-[10.5px] text-muted font-sans font-normal bg-surface px-1.5 py-0.5 rounded border border-border">Hồ sơ GDU</span>
                    </div>
                  </div>

                  {/* Họ và tên (Đã lưu trữ) */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[12px] font-semibold text-muted">Họ và tên</label>
                    <div className="h-10 px-3 bg-canvas/80 border border-border/80 rounded-xl flex items-center justify-between text-[13px] font-bold text-ink">
                      <span className="truncate">{fullName}</span>
                      <span className="text-[10.5px] text-muted font-normal bg-surface px-1.5 py-0.5 rounded border border-border shrink-0">Hồ sơ GDU</span>
                    </div>
                  </div>
                </div>

                {/* Ngành & Lớp */}
                <div className="px-3 py-2 bg-canvas/50 rounded-xl border border-border/60 flex items-center justify-between text-[12px] text-muted">
                  <span>Lớp: <strong className="text-ink font-semibold">{classNameState}</strong></span>
                  <span>Ngành: <strong className="text-ink font-semibold">{major}</strong></span>
                </div>

                {/* TRƯỜNG NHẬP SỐ ĐIỆN THOẠI BẮT BUỘC */}
                <div className="flex flex-col gap-1.5 pt-1">
                  <label htmlFor="reg-phone-input" className="text-[12.5px] font-bold text-ink flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-primary" />
                      <span>Số điện thoại liên hệ <span className="text-error">*</span></span>
                    </span>
                    <span className="text-[11px] font-normal text-muted">Dùng cho điểm danh Ngoại khóa</span>
                  </label>

                  <div className="relative">
                    <input
                      id="reg-phone-input"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value)
                        if (phoneError) setPhoneError("")
                      }}
                      placeholder="Nhập số điện thoại (VD: 0908 123 456)"
                      className={`w-full h-10.5 px-3.5 text-[13.5px] font-medium text-ink bg-surface border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                        phoneError ? "border-error focus:border-error" : "border-border focus:border-primary"
                      }`}
                    />
                  </div>

                  {phoneError ? (
                    <p className="text-[11.5px] text-error flex items-center gap-1 mt-0.5">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{phoneError}</span>
                    </p>
                  ) : (
                    <p className="text-[11.5px] text-muted mt-0.5 leading-relaxed">
                      * Cán bộ MOD sẽ sử dụng số điện thoại này để gọi điện thoại điều phối và kiểm tra check-in / check-out.
                    </p>
                  )}
                </div>

                {isWaitlist && (
                  <div className="flex items-start gap-2 p-3 bg-warning/10 text-warning-dark rounded-xl border border-warning/20 text-[12px]">
                    <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                    <p>Sự kiện đã đủ chỗ. Đăng ký của bạn sẽ được xếp vào <strong>Danh sách chờ (Waitlist)</strong>.</p>
                  </div>
                )}
              </div>
            </DialogContent>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Hủy bỏ
              </Button>
              <Button type="submit" variant="primary" className="font-bold">
                Tiếp tục & Đối soát thông tin
              </Button>
            </DialogFooter>
          </form>
        )}

        {/* ========================================================================= */}
        {/* BƯỚC 2: POPUP HIỆN LẠI THÔNG TIN (Họ tên + SĐT + MSSV)                     */}
        {/* Nếu sai -> hiển thị popup cho chỉnh sửa lại                                */}
        {/* Nếu đúng -> Đã đăng ký thành công                                         */}
        {/* ========================================================================= */}
        {step === "review_popup" && (
          <div className="flex flex-col">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-[16.5px] font-bold text-ink">
                  Xác nhận thông tin đăng ký
                </DialogTitle>
              </div>
              <p className="text-[12.5px] text-muted mt-1 leading-snug">
                Vui lòng kiểm tra lại thông tin cá nhân dưới đây trước khi gửi đăng ký chính thức.
              </p>
            </DialogHeader>

            <DialogContent className="flex flex-col gap-4 py-4">
              {/* Box cảnh báo kiểm tra */}
              <div className="p-3 bg-primary-soft/60 rounded-xl border border-primary/20 flex items-start gap-2.5 text-[12.5px] text-body">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Thông tin <strong>Họ tên, MSSV và Số điện thoại</strong> sẽ được Cán bộ MOD dùng để đối soát danh sách điểm danh Check-in đầu giờ và Check-out ra về.
                </p>
              </div>

              {/* BẢNG HIỂN THỊ THÔNG TIN ĐỐI SOÁT CHÍNH XÁC: Họ tên + SĐT + MSSV */}
              <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xs">
                <div className="bg-canvas px-4 py-2.5 border-b border-border text-[12px] font-bold text-ink uppercase tracking-wider flex items-center justify-between">
                  <span>Thông tin đăng ký của bạn</span>
                  <span className="text-[11px] font-normal text-muted normal-case">Bước đối soát</span>
                </div>

                <div className="p-4 flex flex-col gap-3 text-[13px]">
                  {/* 1. Họ và tên */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-border/60">
                    <span className="text-muted font-medium">Họ và tên:</span>
                    <span className="font-bold text-ink text-[14px] text-right">{fullName}</span>
                  </div>

                  {/* 2. Số điện thoại */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-border/60">
                    <span className="text-muted font-medium flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-primary" />
                      <span>Số điện thoại:</span>
                    </span>
                    <span className="font-mono font-bold text-primary text-[14.5px] bg-primary-soft px-2 py-0.5 rounded-lg border border-primary/20">
                      {phoneNumber}
                    </span>
                  </div>

                  {/* 3. Mã số sinh viên (MSSV) */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-border/60">
                    <span className="text-muted font-medium">Mã số sinh viên (MSSV):</span>
                    <span className="font-mono font-bold text-ink text-[14px]">{studentId}</span>
                  </div>

                  {/* 4. Ngành & Lớp */}
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-muted font-medium">Ngành học / Lớp:</span>
                    <span className="font-medium text-body text-right">{major} ({classNameState})</span>
                  </div>
                </div>
              </div>

              {/* Tóm tắt sự kiện đăng ký */}
              <div className="p-3 bg-canvas/60 rounded-xl border border-border/70 text-[12px] text-body flex items-center justify-between">
                <span className="truncate pr-2 font-medium">Sự kiện: <strong>{event.title}</strong></span>
                <span className="font-bold text-success shrink-0">+{event.points} điểm rèn luyện</span>
              </div>
            </DialogContent>

            <DialogFooter className="flex-col sm:flex-row gap-2.5">
              {/* Nút NẾU SAI: Hiển thị popup cho chỉnh sửa lại thông tin */}
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleOpenEditPopup}
                className="w-full sm:w-auto text-[13px] border-border text-ink hover:bg-canvas flex items-center justify-center gap-1.5"
              >
                <Edit3 className="h-3.5 w-3.5 text-warning" />
                <span>Thông tin chưa đúng (Chỉnh sửa)</span>
              </Button>

              {/* Nút NẾU ĐÚNG: Đã đăng ký */}
              <Button 
                type="button" 
                variant="primary" 
                onClick={handleConfirmRegister}
                className="w-full sm:w-auto text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Thông tin chính xác (Đăng ký)</span>
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* ========================================================================= */}
        {/* BƯỚC 3: POPUP CHO CHỈNH SỬA LẠI THÔNG TIN (Nếu thông tin bị sai)          */}
        {/* ========================================================================= */}
        {step === "edit_popup" && (
          <form onSubmit={handleSaveEdit} className="flex flex-col">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep("review_popup")}
                  className="p-1 -ml-1 text-muted hover:text-ink rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <DialogTitle className="text-[16px] font-bold text-ink">
                  Chỉnh sửa thông tin đăng ký
                </DialogTitle>
              </div>
              <p className="text-[12.5px] text-muted mt-1 leading-snug">
                Vui lòng cập nhật lại thông tin chính xác. Sau khi lưu, hệ thống sẽ đối soát lại trước khi gửi.
              </p>
            </DialogHeader>

            <DialogContent className="flex flex-col gap-3 py-4 max-h-[70vh] overflow-y-auto">
              {/* Chỉnh sửa Họ và tên */}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-ink">
                  Họ và tên <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.fullName}
                  onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                  placeholder="Nhập họ và tên đầy đủ"
                  className={`h-10 px-3 text-[13px] bg-surface border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    editErrors.fullName ? "border-error" : "border-border focus:border-primary"
                  }`}
                />
                {editErrors.fullName && (
                  <span className="text-[11px] text-error">{editErrors.fullName}</span>
                )}
              </div>

              {/* Chỉnh sửa Mã số sinh viên (MSSV) */}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-ink">
                  Mã số sinh viên (MSSV) <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.studentId}
                  onChange={(e) => setEditFormData({ ...editFormData, studentId: e.target.value })}
                  placeholder="Nhập MSSV (ví dụ: 2024001)"
                  className={`h-10 px-3 text-[13px] font-mono bg-surface border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    editErrors.studentId ? "border-error" : "border-border focus:border-primary"
                  }`}
                />
                {editErrors.studentId && (
                  <span className="text-[11px] text-error">{editErrors.studentId}</span>
                )}
              </div>

              {/* Chỉnh sửa Số điện thoại */}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-ink">
                  Số điện thoại liên hệ <span className="text-error">*</span>
                </label>
                <input
                  type="tel"
                  value={editFormData.phoneNumber}
                  onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                  placeholder="Nhập số điện thoại 10 chữ số"
                  className={`h-10 px-3 text-[13px] bg-surface border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    editErrors.phoneNumber ? "border-error" : "border-border focus:border-primary"
                  }`}
                />
                {editErrors.phoneNumber && (
                  <span className="text-[11px] text-error">{editErrors.phoneNumber}</span>
                )}
              </div>

              {/* Chỉnh sửa Ngành học */}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-ink">Ngành đào tạo</label>
                <input
                  type="text"
                  value={editFormData.major}
                  onChange={(e) => setEditFormData({ ...editFormData, major: e.target.value })}
                  placeholder="Ví dụ: Công nghệ thông tin"
                  className="h-10 px-3 text-[13px] bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Chỉnh sửa Lớp */}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-ink">Lớp sinh hoạt</label>
                <input
                  type="text"
                  value={editFormData.className}
                  onChange={(e) => setEditFormData({ ...editFormData, className: e.target.value })}
                  placeholder="Ví dụ: 2401CNTT01"
                  className="h-10 px-3 text-[13px] bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </DialogContent>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setStep("review_popup")}>
                Hủy bỏ
              </Button>
              <Button type="submit" variant="primary" className="font-bold">
                Lưu thay đổi & Đối soát lại
              </Button>
            </DialogFooter>
          </form>
        )}

        {/* ========================================================================= */}
        {/* ĐANG XỬ LÝ (Loading)                                                      */}
        {/* ========================================================================= */}
        {step === "loading" && (
          <DialogContent className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <div className="text-center">
              <p className="text-ink font-bold text-[15px]">Đang ghi nhận đăng ký...</p>
              <p className="text-muted text-[12.5px] mt-1">Đang đồng bộ thông tin số điện thoại với danh sách điểm danh MOD</p>
            </div>
          </DialogContent>
        )}

        {/* ========================================================================= */}
        {/* ĐĂNG KÝ THÀNH CÔNG                                                        */}
        {/* ========================================================================= */}
        {step === "success" && (
          <DialogContent className="flex flex-col items-center justify-center py-8 gap-4 text-center">
            <div className="h-16 w-16 rounded-full bg-success/10 text-success flex items-center justify-center mb-1">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-bold text-ink">Đăng ký tham gia thành công!</h3>
              <p className="text-body text-[13px] max-w-[340px] leading-relaxed">
                {isWaitlist 
                  ? "Bạn đang ở vị trí #5 trong danh sách chờ. Ban Tổ chức sẽ thông báo nếu có người hủy vé."
                  : "Bạn đã nhận được vé chính thức. Thông tin của bạn đã được chuyển đến danh sách điểm danh của Cán bộ MOD."}
              </p>
            </div>

            {/* Chi tiết đăng ký đã ghi nhận */}
            <div className="w-full max-w-sm p-3.5 bg-canvas rounded-xl border border-border text-[12.5px] text-left flex flex-col gap-2">
              <div className="flex justify-between items-center pb-1.5 border-b border-border/60">
                <span className="text-muted">Họ và tên:</span>
                <span className="font-bold text-ink">{fullName}</span>
              </div>
              <div className="flex justify-between items-center pb-1.5 border-b border-border/60">
                <span className="text-muted">MSSV:</span>
                <span className="font-mono font-bold text-ink">{studentId}</span>
              </div>
              <div className="flex justify-between items-center pb-1.5 border-b border-border/60">
                <span className="text-muted">Số điện thoại liên hệ:</span>
                <span className="font-mono font-bold text-primary">{phoneNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted">Hình thức điểm danh:</span>
                <span className="font-semibold text-ink">
                  {isExtracurricular ? "MOD Check-in & Check-out trực tiếp" : "Quét mã QR + GPS"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full max-w-sm mt-1">
              <Button 
                variant="primary" 
                className="w-full font-bold h-10 rounded-xl" 
                onClick={() => setOpen(false)}
              >
                Hoàn tất & Đóng
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}
