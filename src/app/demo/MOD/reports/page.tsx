"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { MOCK_EVENTS, MOCK_EXCEL_RECORDS } from "@/mocks"
import { Event } from "@/types"
import { Button } from "@/components/ui/button"
import { 
  ChevronLeft, 
  Download, 
  FileSpreadsheet, 
  Check, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  Award, 
  Layers, 
  CheckCircle2, 
  Clock,
  ArrowUpDown,
  FileCheck
} from "lucide-react"

// Interface định nghĩa một dòng sinh viên trong báo cáo tổng hợp ma trận
interface MasterStudentReportRow {
  stt: number
  studentId: string
  lastName: string
  firstName: string
  fullName: string
  gender: "Nam" | "Nữ"
  birthDate: string
  className: string
  major: string
  // Điểm các hoạt động: key là eventId, value là số điểm (0 nếu không tham gia)
  activityScores: { [eventId: string]: number }
  // Tổng điểm rèn luyện tính toán
  totalPoints: number
  // Xếp loại
  classification: "Xuất sắc" | "Giỏi" | "Khá" | "Trung bình" | "Yếu"
}

// Master danh sách sinh viên tổng thể trong hệ thống
const MASTER_STUDENTS_LIST = [
  {
    stt: 1,
    studentId: "2024001",
    lastName: "Nguyễn Văn",
    firstName: "An",
    gender: "Nam" as const,
    birthDate: "15/08/2004",
    className: "2401CNTT01",
    major: "Công nghệ thông tin",
    participatedEventIds: ["evt-01", "evt-02", "evt-03", "evt-extracurricular-01", "evt-interactive-01", "evt-completed-01"]
  },
  {
    stt: 2,
    studentId: "2024002",
    lastName: "Trần Thị",
    firstName: "Bình",
    gender: "Nữ" as const,
    birthDate: "20/11/2004",
    className: "2401CNTT02",
    major: "Công nghệ thông tin",
    participatedEventIds: ["evt-01", "evt-02", "evt-extracurricular-01", "evt-completed-02"]
  },
  {
    stt: 3,
    studentId: "2024003",
    lastName: "Lê Hoàng",
    firstName: "Cường",
    gender: "Nam" as const,
    birthDate: "05/03/2003",
    className: "2301QTKD01",
    major: "Quản trị kinh doanh",
    participatedEventIds: ["evt-01", "evt-03", "evt-competition-01", "evt-completed-01"]
  },
  {
    stt: 4,
    studentId: "2024004",
    lastName: "Phạm Thúy",
    firstName: "Duyên",
    gender: "Nữ" as const,
    birthDate: "12/09/2004",
    className: "2401NNA01",
    major: "Ngôn ngữ Anh",
    participatedEventIds: ["evt-01", "evt-interactive-01", "evt-extracurricular-01"]
  },
  {
    stt: 5,
    studentId: "2024005",
    lastName: "Hoàng Minh",
    firstName: "Đức",
    gender: "Nam" as const,
    birthDate: "28/01/2004",
    className: "2401CNTT01",
    major: "Công nghệ thông tin",
    participatedEventIds: ["evt-01", "evt-02", "evt-competition-01", "evt-completed-02"]
  },
  {
    stt: 6,
    studentId: "2024006",
    lastName: "Võ Ngọc",
    firstName: "Hương",
    gender: "Nữ" as const,
    birthDate: "14/06/2004",
    className: "2401TMDH01",
    major: "Thương mại điện tử",
    participatedEventIds: ["evt-02", "evt-03", "evt-interactive-01", "evt-extracurricular-01"]
  },
  {
    stt: 7,
    studentId: "2024007",
    lastName: "Đỗ Gia",
    firstName: "Khang",
    gender: "Nam" as const,
    birthDate: "09/04/2004",
    className: "2401CNTT03",
    major: "Công nghệ thông tin",
    participatedEventIds: ["evt-01", "evt-competition-01", "evt-completed-01", "evt-completed-02"]
  },
  {
    stt: 8,
    studentId: "2024008",
    lastName: "Bùi Trúc",
    firstName: "Linh",
    gender: "Nữ" as const,
    birthDate: "22/10/2003",
    className: "2301QTKD02",
    major: "Quản trị kinh doanh",
    participatedEventIds: ["evt-03", "evt-extracurricular-01", "evt-interactive-01"]
  },
  {
    stt: 9,
    studentId: "2024009",
    lastName: "Mai Anh",
    firstName: "Tuấn",
    gender: "Nam" as const,
    birthDate: "17/02/2004",
    className: "2401CNTT02",
    major: "Công nghệ thông tin",
    participatedEventIds: ["evt-01", "evt-02", "evt-competition-01"]
  },
  {
    stt: 10,
    studentId: "2024010",
    lastName: "Đặng Thị",
    firstName: "Ngọc",
    gender: "Nữ" as const,
    birthDate: "30/07/2003",
    className: "2301NNA02",
    major: "Ngôn ngữ Anh",
    participatedEventIds: ["evt-01", "evt-03", "evt-extracurricular-01", "evt-completed-01"]
  },
  {
    stt: 11,
    studentId: "2024011",
    lastName: "Vũ Quốc",
    firstName: "Bảo",
    gender: "Nam" as const,
    birthDate: "11/12/2004",
    className: "2401CNTT01",
    major: "Công nghệ thông tin",
    participatedEventIds: ["evt-02", "evt-competition-01", "evt-completed-02"]
  },
  {
    stt: 12,
    studentId: "2024012",
    lastName: "Phan Hồng",
    firstName: "Hạnh",
    gender: "Nữ" as const,
    birthDate: "04/05/2004",
    className: "2401TMDH02",
    major: "Thương mại điện tử",
    participatedEventIds: ["evt-01", "evt-interactive-01", "evt-extracurricular-01", "evt-completed-01"]
  }
]

export default function MODCentralReportsPage() {
  // Bộ lọc Thời gian
  const [selectedYear, setSelectedYear] = useState<string>("2026-2027")
  const [selectedSemester, setSelectedSemester] = useState<string>("ALL")
  
  // Bộ lọc Khóa / Ngành / Lớp & Tìm kiếm
  const [selectedMajor, setSelectedMajor] = useState<string>("ALL")
  const [selectedClass, setSelectedClass] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState("")

  // State Xuất Excel
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)

  // Danh sách các sự kiện tương ứng với phạm vi thời gian (sẽ tạo thành các cột Tên HĐ1, Tên HĐ2, ...)
  const filteredActivities: Event[] = useMemo(() => {
    // Lấy các sự kiện chính thức có tính điểm
    let activities = MOCK_EVENTS.filter(e => e.status !== "Bản nháp" && e.status !== "Chờ duyệt")

    // Lọc theo kỳ nếu có
    if (selectedSemester === "HK1") {
      activities = activities.filter((_, idx) => idx % 2 === 0)
    } else if (selectedSemester === "HK2") {
      activities = activities.filter((_, idx) => idx % 2 !== 0)
    }

    return activities
  }, [selectedSemester])

  // Tính toán dữ liệu báo cáo ma trận cho toàn bộ sinh viên
  const reportRows: MasterStudentReportRow[] = useMemo(() => {
    return MASTER_STUDENTS_LIST.map((student, idx) => {
      const activityScores: { [eventId: string]: number } = {}
      let total = 0

      filteredActivities.forEach(activity => {
        // Nếu sinh viên có tham gia sự kiện này -> cộng điểm
        if (student.participatedEventIds.includes(activity.id)) {
          activityScores[activity.id] = activity.points
          total += activity.points
        } else {
          activityScores[activity.id] = 0
        }
      })

      // Đánh giá xếp loại theo quy định GDU
      let classification: "Xuất sắc" | "Giỏi" | "Khá" | "Trung bình" | "Yếu" = "Trung bình"
      if (total >= 90) classification = "Xuất sắc"
      else if (total >= 80) classification = "Giỏi"
      else if (total >= 65) classification = "Khá"
      else if (total >= 50) classification = "Trung bình"
      else classification = "Yếu"

      return {
        stt: idx + 1,
        studentId: student.studentId,
        lastName: student.lastName,
        firstName: student.firstName,
        fullName: `${student.lastName} ${student.firstName}`,
        gender: student.gender,
        birthDate: student.birthDate,
        className: student.className,
        major: student.major,
        activityScores,
        totalPoints: total,
        classification
      }
    })
  }, [filteredActivities])

  // Lọc theo Tìm kiếm & Ngành / Lớp
  const filteredReportRows = useMemo(() => {
    return reportRows.filter(row => {
      const matchSearch = !searchQuery || 
        row.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.studentId.includes(searchQuery) ||
        row.className.toLowerCase().includes(searchQuery.toLowerCase())

      const matchMajor = selectedMajor === "ALL" || row.major === selectedMajor
      const matchClass = selectedClass === "ALL" || row.className === selectedClass

      return matchSearch && matchMajor && matchClass
    })
  }, [reportRows, searchQuery, selectedMajor, selectedClass])

  // Danh sách các lớp duy nhất để hiển thị trong dropdown
  const uniqueClasses = useMemo(() => {
    return Array.from(new Set(MASTER_STUDENTS_LIST.map(s => s.className)))
  }, [])

  // Thống kê nhanh
  const avgPoints = useMemo(() => {
    if (filteredReportRows.length === 0) return 0
    const sum = filteredReportRows.reduce((acc, curr) => acc + curr.totalPoints, 0)
    return Math.round(sum / filteredReportRows.length)
  }, [filteredReportRows])

  const excellentCount = useMemo(() => {
    return filteredReportRows.filter(r => r.classification === "Xuất sắc" || r.classification === "Giỏi").length
  }, [filteredReportRows])

  // =========================================================================
  // XUẤT FILE EXCEL (.CSV UTF-8 CÓ BOM) THEO ĐÚNG CẤU TRÚC YÊU CẦU
  // STT, MSSV, Họ, Tên, Giới tính, Ngày sinh, Lớp, Ngành, Tên HĐ1, Tên HĐ2... Tổng điểm
  // =========================================================================
  const handleExportMasterExcel = () => {
    setIsExporting(true)

    // Tạo Header theo yêu cầu:
    // STT, MSSV, Họ, Tên, Giới tính, Ngày sinh, Lớp, Ngành, Tên HĐ1, Tên HĐ2... Tổng điểm
    const fixedHeaders = ["STT", "MSSV", "Họ", "Tên", "Giới tính", "Ngày sinh", "Lớp", "Ngành"]
    const activityHeaders = filteredActivities.map((act, i) => `"Tên HĐ${i + 1}: ${act.title.replace(/"/g, '""')} (+${act.points}đ)"`)
    const finalHeaders = [...fixedHeaders, ...activityHeaders, "Tổng điểm", "Xếp loại"]

    // Tạo các dòng dữ liệu
    const rows = filteredReportRows.map((row, idx) => {
      const fixedData = [
        idx + 1,
        `"${row.studentId}"`,
        `"${row.lastName}"`,
        `"${row.firstName}"`,
        `"${row.gender}"`,
        `"${row.birthDate}"`,
        `"${row.className}"`,
        `"${row.major}"`
      ]

      // Điểm từng cột HĐ
      const activityData = filteredActivities.map(act => row.activityScores[act.id] || 0)

      const finalData = [
        ...fixedData,
        ...activityData,
        row.totalPoints,
        `"${row.classification}"`
      ]

      return finalData.join(",")
    })

    // Ghép nội dung CSV với UTF-8 BOM (\uFEFF)
    const csvContent = "\uFEFF" + [finalHeaders.join(","), ...rows].join("\r\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url

    const semesterLabel = selectedSemester === "ALL" ? "CaNam" : selectedSemester
    link.setAttribute("download", `GDU_Bao_cao_tong_hop_${selectedYear}_${semesterLabel}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setIsExporting(false)
    setExportSuccess(true)
    setTimeout(() => setExportSuccess(false), 3000)
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-3.5 py-4 sm:px-6 sm:py-6 flex flex-col gap-5 sm:gap-6 pb-24">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border pb-3 sm:pb-4">
        <div className="flex items-center gap-2.5">
          <Link href="/demo/MOD/events">
            <Button variant="ghost" size="icon" className="h-8.5 w-8.5 text-muted hover:text-ink hover:bg-canvas rounded-xl shrink-0">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
                Báo cáo tổng hợp & Xuất Excel toàn trường
              </h1>
              <span className="text-[11px] font-bold text-success bg-success/10 px-2.5 py-0.5 rounded-full border border-success/20">
                Ma trận đa cột Tên HĐ
              </span>
            </div>
            <p className="text-[12.5px] sm:text-[13.5px] text-body mt-0.5 sm:mt-1">
              Xuất dữ liệu toàn bộ tài khoản đăng ký theo năm học, học kỳ với ma trận điểm rèn luyện từng hoạt động.
            </p>
          </div>
        </div>

        {/* Nút hành động chính: XUẤT FILE EXCEL */}
        <div className="flex items-center gap-2 shrink-0">
          <Button 
            onClick={handleExportMasterExcel}
            disabled={isExporting || filteredReportRows.length === 0}
            className={`w-full sm:w-auto h-11 sm:h-11.5 text-[13.5px] sm:text-[14px] px-5 font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2.5 ${
              exportSuccess ? 'bg-success hover:bg-success text-white' : 'bg-primary hover:bg-primary-hover text-white'
            }`}
          >
            {exportSuccess ? (
              <>
                <Check className="h-4 w-4" />
                <span>Đã xuất file Excel (.csv)</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Xuất file Excel báo cáo</span>
              </>
            )}
          </Button>
        </div>
      </header>

      {/* KPI Cards Thống kê phạm vi báo cáo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-surface border border-border rounded-xl sm:rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col">
          <span className="text-[10.5px] sm:text-[11.5px] font-bold text-muted uppercase tracking-wider">
            Tổng tài khoản sinh viên
          </span>
          <span className="text-xl sm:text-2xl font-bold text-ink mt-0.5">
            {filteredReportRows.length} <span className="text-[12px] font-normal text-muted">sinh viên</span>
          </span>
          <span className="text-[10.5px] sm:text-[11.5px] text-muted mt-0.5">Trong phạm vi lọc</span>
        </div>

        <div className="bg-surface border border-border rounded-xl sm:rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col">
          <span className="text-[10.5px] sm:text-[11.5px] font-bold text-muted uppercase tracking-wider">
            Số hoạt động ghi nhận
          </span>
          <span className="text-xl sm:text-2xl font-bold text-primary mt-0.5">
            {filteredActivities.length} <span className="text-[12px] font-normal text-muted">hoạt động</span>
          </span>
          <span className="text-[10.5px] sm:text-[11.5px] text-muted mt-0.5">Cột Tên HĐ1 ... Tên HĐn</span>
        </div>

        <div className="bg-surface border border-border rounded-xl sm:rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col">
          <span className="text-[10.5px] sm:text-[11.5px] font-bold text-muted uppercase tracking-wider">
            Điểm rèn luyện TB
          </span>
          <span className="text-xl sm:text-2xl font-bold text-accent-active mt-0.5">
            {avgPoints} <span className="text-[12px] font-normal text-muted">điểm</span>
          </span>
          <span className="text-[10.5px] sm:text-[11.5px] text-muted mt-0.5">Toàn khóa lọc</span>
        </div>

        <div className="bg-surface border border-border rounded-xl sm:rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col">
          <span className="text-[10.5px] sm:text-[11.5px] font-bold text-muted uppercase tracking-wider">
            Loại Giỏi & Xuất sắc
          </span>
          <span className="text-xl sm:text-2xl font-bold text-success mt-0.5">
            {excellentCount} <span className="text-[12px] font-normal text-muted">sinh viên</span>
          </span>
          <span className="text-[10.5px] sm:text-[11.5px] text-muted mt-0.5">
            {filteredReportRows.length > 0 ? Math.round((excellentCount / filteredReportRows.length) * 100) : 0}% tỷ lệ
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BỘ LỌC THỜI GIAN & PHẠM VI XUẤT BÁO CÁO (THEO NĂM, THEO KỲ, THEO NGÀNH)   */}
      {/* ========================================================================= */}
      <div className="bg-surface border border-border rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-3.5">
        <div className="flex items-center gap-2 border-b border-border/80 pb-2.5">
          <Filter className="h-4 w-4 text-primary" />
          <h2 className="text-[14px] sm:text-[15px] font-bold text-ink">
            Bộ lọc phạm vi xuất báo cáo (Theo Năm, Theo Kỳ & Theo Ngành/Lớp)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. XUẤT BÁO CÁO THEO NĂM */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-muted uppercase tracking-wider">
              1. Chọn Năm học
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="h-10 px-3 text-[13px] font-medium bg-canvas border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-ink"
            >
              <option value="2026-2027">Năm học 2026 - 2027 (Hiện tại)</option>
              <option value="2025-2026">Năm học 2025 - 2026</option>
              <option value="2024-2025">Năm học 2024 - 2025</option>
              <option value="ALL_3_YEARS">Toàn khóa 3 năm (Tích lũy liên tục)</option>
            </select>
          </div>

          {/* 2. XUẤT BÁO CÁO THEO KỲ */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-muted uppercase tracking-wider">
              2. Chọn Học kỳ
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="h-10 px-3 text-[13px] font-medium bg-canvas border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-ink"
            >
              <option value="ALL">Cả năm học (Tất cả học kỳ)</option>
              <option value="HK1">Học kỳ 1</option>
              <option value="HK2">Học kỳ 2</option>
              <option value="HK3">Học kỳ 3 (Học kỳ hè / phụ)</option>
            </select>
          </div>

          {/* 3. Lọc theo Ngành */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-muted uppercase tracking-wider">
              3. Ngành đào tạo
            </label>
            <select
              value={selectedMajor}
              onChange={(e) => setSelectedMajor(e.target.value)}
              className="h-10 px-3 text-[13px] font-medium bg-canvas border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-ink"
            >
              <option value="ALL">Tất cả ngành đào tạo</option>
              <option value="Công nghệ thông tin">Công nghệ thông tin</option>
              <option value="Quản trị kinh doanh">Quản trị kinh doanh</option>
              <option value="Ngôn ngữ Anh">Ngôn ngữ Anh</option>
              <option value="Thương mại điện tử">Thương mại điện tử</option>
            </select>
          </div>

          {/* 4. Lọc theo Lớp */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-muted uppercase tracking-wider">
              4. Lớp sinh hoạt
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="h-10 px-3 text-[13px] font-medium bg-canvas border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-ink"
            >
              <option value="ALL">Tất cả lớp ({uniqueClasses.length} lớp)</option>
              {uniqueClasses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Ô tìm kiếm nhanh */}
        <div className="pt-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
            <input 
              type="text" 
              placeholder="Tìm nhanh theo MSSV, Họ tên hoặc Lớp..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 sm:h-11.5 pl-10 pr-4 text-[13.5px] sm:text-[14px] bg-canvas border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-ink font-medium transition-all shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BẢNG XEM TRƯỚC MA TRẬN BÁO CÁO (LIVE PREVIEW DATA TABLE)                  */}
      {/* Cấu trúc: STT | MSSV | Họ | Tên | Giới tính | Ngày sinh | Lớp | Ngành |    */}
      {/*           Tên HĐ1 | Tên HĐ2 | ... | Tên HĐn | Tổng điểm | Xếp loại        */}
      {/* ========================================================================= */}
      <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-3">
          <div>
            <h3 className="text-[15px] sm:text-[16px] font-bold text-ink flex items-center gap-2">
              <FileSpreadsheet className="h-4.5 w-4.5 text-primary" />
              <span>Xem trước bảng xuất Excel ({filteredReportRows.length} sinh viên)</span>
            </h3>
            <p className="text-[12px] sm:text-[12.5px] text-muted mt-0.5">
              File tải về sẽ có đúng định dạng ma trận {8 + filteredActivities.length + 2} cột theo quy định quản lý đào tạo.
            </p>
          </div>

          <span className="text-[12px] text-body bg-canvas px-3 py-1 rounded-xl border border-border font-medium">
            Phạm vi: <strong>{selectedYear}</strong> • <strong>{selectedSemester === "ALL" ? "Cả năm" : selectedSemester}</strong>
          </span>
        </div>

        {/* Bảng cuộn ngang mượt mà với Sticky header & columns */}
        <div className="overflow-x-auto rounded-xl border border-border/80 max-h-[600px] overflow-y-auto">
          <table className="w-full text-[12.5px] text-left border-collapse min-w-[1200px]">
            <thead className="sticky top-0 z-20 bg-canvas border-b border-border shadow-xs">
              <tr className="text-muted font-bold text-[12px]">
                {/* 8 Cột cố định */}
                <th className="p-3 w-12 text-center sticky left-0 bg-canvas z-20 border-r border-border/60">STT</th>
                <th className="p-3 w-28 sticky left-12 bg-canvas z-20 border-r border-border/60">MSSV</th>
                <th className="p-3 w-32 sticky left-40 bg-canvas z-20 border-r border-border/60">Họ</th>
                <th className="p-3 w-24 sticky left-72 bg-canvas z-20 border-r border-border/80">Tên</th>
                <th className="p-3 w-20 text-center">Giới tính</th>
                <th className="p-3 w-28">Ngày sinh</th>
                <th className="p-3 w-28">Lớp</th>
                <th className="p-3 w-40">Ngành</th>

                {/* Các cột Tên HĐ1 ... Tên HĐn */}
                {filteredActivities.map((act, idx) => (
                  <th key={act.id} className="p-3 w-36 text-center border-l border-border/60 bg-primary/5 text-ink">
                    <div className="flex flex-col items-center">
                      <span className="text-[11px] font-bold text-primary">Tên HĐ{idx + 1}</span>
                      <span className="font-semibold text-ink line-clamp-1 text-[11.5px] max-w-[130px]" title={act.title}>
                        {act.title}
                      </span>
                      <span className="text-[10px] text-accent-active font-bold">(+{act.points}đ)</span>
                    </div>
                  </th>
                ))}

                {/* Cột Tổng điểm & Xếp loại */}
                <th className="p-3 w-28 text-center border-l-2 border-primary/30 bg-primary-soft text-primary font-bold">
                  Tổng điểm
                </th>
                <th className="p-3 w-28 text-center bg-canvas">
                  Xếp loại
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredReportRows.length === 0 ? (
                <tr>
                  <td colSpan={10 + filteredActivities.length} className="p-10 text-center text-muted">
                    Không tìm thấy sinh viên nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredReportRows.map((row, idx) => {
                  return (
                    <tr key={row.studentId} className="hover:bg-canvas/50 transition-colors">
                      {/* STT */}
                      <td className="p-3 text-center text-muted font-medium sticky left-0 bg-surface z-10 border-r border-border/60">
                        {idx + 1}
                      </td>

                      {/* MSSV */}
                      <td className="p-3 font-mono font-bold text-ink sticky left-12 bg-surface z-10 border-r border-border/60">
                        {row.studentId}
                      </td>

                      {/* Họ */}
                      <td className="p-3 font-medium text-ink sticky left-40 bg-surface z-10 border-r border-border/60">
                        {row.lastName}
                      </td>

                      {/* Tên */}
                      <td className="p-3 font-bold text-ink sticky left-72 bg-surface z-10 border-r border-border/80">
                        {row.firstName}
                      </td>

                      {/* Giới tính */}
                      <td className="p-3 text-center text-body">
                        {row.gender}
                      </td>

                      {/* Ngày sinh */}
                      <td className="p-3 font-mono text-muted text-[12px]">
                        {row.birthDate}
                      </td>

                      {/* Lớp */}
                      <td className="p-3 font-mono text-body">
                        {row.className}
                      </td>

                      {/* Ngành */}
                      <td className="p-3 text-body">
                        {row.major}
                      </td>

                      {/* Các cột điểm Tên HĐ1 ... Tên HĐn */}
                      {filteredActivities.map((act) => {
                        const score = row.activityScores[act.id] || 0
                        return (
                          <td key={act.id} className="p-3 text-center border-l border-border/60 font-mono">
                            {score > 0 ? (
                              <span className="font-bold text-success bg-success/10 px-2 py-0.5 rounded-md border border-success/20">
                                +{score}
                              </span>
                            ) : (
                              <span className="text-muted/40 font-normal">—</span>
                            )}
                          </td>
                        )
                      })}

                      {/* Cột Tổng điểm */}
                      <td className="p-3 text-center border-l-2 border-primary/30 bg-primary-soft/40 font-mono font-bold text-primary text-[14px]">
                        {row.totalPoints}
                      </td>

                      {/* Cột Xếp loại */}
                      <td className="p-3 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          row.classification === "Xuất sắc" ? "bg-accent-soft text-accent-active border border-[#D8B24F]/30" :
                          row.classification === "Giỏi" ? "bg-success/10 text-success border border-success/20" :
                          row.classification === "Khá" ? "bg-primary-soft text-primary" :
                          "bg-canvas text-muted border border-border"
                        }`}>
                          {row.classification}
                        </span>
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
