"use client"

import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react"
import {
  AdminStudent,
  createAdminStudent,
  deleteAdminStudent,
  deleteAdminStudentYear,
  importAdminStudents,
  listAdminStudents,
} from "@/lib/api"
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  GraduationCap,
  PlusCircle,
  Search,
  Trash2,
  Upload,
  UserPlus,
  Users,
} from "lucide-react"

type StudentForm = {
  studentId: string
  fullName: string
  email: string
  initialPassword: string
  gender: string
  birthDate: string
  className: string
  major: string
  phoneNumber: string
  enrollmentYear: string
}

const EMPTY_FORM: StudentForm = {
  studentId: "",
  fullName: "",
  email: "",
  initialPassword: "",
  gender: "Khác",
  birthDate: "",
  className: "",
  major: "",
  phoneNumber: "",
  enrollmentYear: String(new Date().getFullYear()),
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<AdminStudent[]>([])
  const [years, setYears] = useState<Array<{ enrollmentYear: number; count: number }>>([])
  const [form, setForm] = useState<StudentForm>(EMPTY_FORM)
  const [search, setSearch] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const result = await listAdminStudents(search, selectedYear ? Number(selectedYear) : undefined)
      setStudents(result.students)
      setYears(result.years)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể tải danh sách sinh viên.")
    } finally {
      setLoading(false)
    }
  }, [search, selectedYear])

  useEffect(() => {
    void load()
  }, [load])

  const updateField = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const createStudent = async (event: FormEvent) => {
    event.preventDefault()
    setPending(true)
    setError("")
    setMessage("")
    try {
      await createAdminStudent({
        ...form,
        enrollmentYear: Number(form.enrollmentYear),
      })
      setForm(EMPTY_FORM)
      setMessage("Đã thêm sinh viên thành công.")
      await load()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể thêm sinh viên.")
    } finally {
      setPending(false)
    }
  }

  const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setPending(true)
    setError("")
    setMessage("")
    try {
      const imported = await importAdminStudents(file)
      setMessage(`Đã nhập thành công ${imported.length} sinh viên.`)
      await load()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể nhập file Excel.")
    } finally {
      event.target.value = ""
      setPending(false)
    }
  }

  const removeStudent = async (student: AdminStudent) => {
    if (!window.confirm(`Xóa sinh viên ${student.fullName} (${student.studentId})?`)) return
    setPending(true)
    try {
      await deleteAdminStudent(student.id)
      setMessage("Đã xóa sinh viên.")
      await load()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể xóa sinh viên.")
    } finally {
      setPending(false)
    }
  }

  const removeYear = async (year: number) => {
    if (!window.confirm(`Xóa toàn bộ sinh viên khóa ${year}? Dữ liệu liên quan cũng sẽ bị xóa.`)) return
    setPending(true)
    try {
      const result = await deleteAdminStudentYear(year)
      setMessage(`Đã xóa ${result.deletedCount} sinh viên của khóa ${year}.`)
      await load()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể xóa khóa sinh viên.")
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="container max-w-7xl py-8 min-w-0">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-ink flex items-center gap-2.5">
          <GraduationCap className="h-7 w-7 text-primary" />
          Quản lý sinh viên
        </h1>
        <p className="text-sm sm:text-base text-muted">
          Thêm từng sinh viên thủ công hoặc nhập hàng loạt nhanh chóng qua file Excel.
        </p>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1 font-medium">{error}</div>
        </div>
      )}

      {message && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 mt-0.5" />
          <div className="flex-1 font-medium">{message}</div>
        </div>
      )}

      {/* Top Grid: Thêm sinh viên (Spacious Form) & Nhập Excel */}
      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12 min-w-0">
        {/* Form thêm sinh viên */}
        <form
          onSubmit={(event) => void createStudent(event)}
          className="min-w-0 xl:col-span-7 2xl:col-span-8 rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <UserPlus className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-ink">Thêm sinh viên mới</h2>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2 min-w-0">
            {/* MSSV */}
            <div className="flex flex-col gap-1.5 min-w-0">
              <label htmlFor="studentId" className="text-xs sm:text-sm font-medium text-ink">
                MSSV <span className="text-red-500">*</span>
              </label>
              <input
                id="studentId"
                name="studentId"
                type="text"
                required
                value={form.studentId}
                onChange={updateField}
                placeholder="VD: 2100001234"
                className="w-full min-w-0 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Năm nhập học */}
            <div className="flex flex-col gap-1.5 min-w-0">
              <label htmlFor="enrollmentYear" className="text-xs sm:text-sm font-medium text-ink">
                Năm nhập học <span className="text-red-500">*</span>
              </label>
              <input
                id="enrollmentYear"
                name="enrollmentYear"
                type="number"
                required
                value={form.enrollmentYear}
                onChange={updateField}
                placeholder="VD: 2025"
                className="w-full min-w-0 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Họ và tên */}
            <div className="flex flex-col gap-1.5 min-w-0">
              <label htmlFor="fullName" className="text-xs sm:text-sm font-medium text-ink">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={form.fullName}
                onChange={updateField}
                placeholder="VD: Nguyễn Văn An"
                className="w-full min-w-0 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Giới tính */}
            <div className="flex flex-col gap-1.5 min-w-0">
              <label htmlFor="gender" className="text-xs sm:text-sm font-medium text-ink">
                Giới tính
              </label>
              <select
                id="gender"
                name="gender"
                value={form.gender}
                onChange={updateField}
                className="w-full min-w-0 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            {/* Email trường */}
            <div className="flex flex-col gap-1.5 min-w-0">
              <label htmlFor="email" className="text-xs sm:text-sm font-medium text-ink">
                Email trường <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={updateField}
                placeholder="VD: an.nv@student.gdu.edu.vn"
                className="w-full min-w-0 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Số điện thoại */}
            <div className="flex flex-col gap-1.5 min-w-0">
              <label htmlFor="phoneNumber" className="text-xs sm:text-sm font-medium text-ink">
                Số điện thoại
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={form.phoneNumber}
                onChange={updateField}
                placeholder="VD: 0901234567"
                className="w-full min-w-0 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Lớp sinh hoạt */}
            <div className="flex flex-col gap-1.5 min-w-0">
              <label htmlFor="className" className="text-xs sm:text-sm font-medium text-ink">
                Lớp sinh hoạt
              </label>
              <input
                id="className"
                name="className"
                type="text"
                value={form.className}
                onChange={updateField}
                placeholder="VD: 21DTH01"
                className="w-full min-w-0 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Ngành học */}
            <div className="flex flex-col gap-1.5 min-w-0">
              <label htmlFor="major" className="text-xs sm:text-sm font-medium text-ink">
                Ngành học
              </label>
              <input
                id="major"
                name="major"
                type="text"
                value={form.major}
                onChange={updateField}
                placeholder="VD: Công nghệ thông tin"
                className="w-full min-w-0 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Ngày sinh */}
            <div className="flex flex-col gap-1.5 min-w-0">
              <label htmlFor="birthDate" className="text-xs sm:text-sm font-medium text-ink">
                Ngày sinh <span className="text-red-500">*</span>
              </label>
              <input
                id="birthDate"
                name="birthDate"
                type="date"
                required
                value={form.birthDate}
                onChange={updateField}
                className="w-full min-w-0 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Mật khẩu ban đầu */}
            <div className="flex flex-col gap-1.5 min-w-0">
              <label htmlFor="initialPassword" className="text-xs sm:text-sm font-medium text-ink">
                Mật khẩu ban đầu <span className="text-red-500">*</span>
              </label>
              <input
                id="initialPassword"
                name="initialPassword"
                type="password"
                minLength={8}
                required
                value={form.initialPassword}
                onChange={updateField}
                placeholder="Tối thiểu 8 ký tự"
                className="w-full min-w-0 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end border-t border-border pt-4">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover active:bg-primary-active disabled:opacity-50 transition-all"
            >
              <PlusCircle className="h-4 w-4" />
              {pending ? "Đang xử lý..." : "Thêm sinh viên"}
            </button>
          </div>
        </form>

        {/* Cột phải: Nhập Excel & Khóa học */}
        <div className="xl:col-span-5 2xl:col-span-4 flex flex-col gap-6 min-w-0">
          {/* Card nhập Excel */}
          <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-sm min-w-0">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-ink">Nhập file Excel</h2>
            </div>
            <p className="mt-3 text-xs sm:text-sm text-muted leading-relaxed">
              Nhập danh sách sinh viên hàng loạt bằng file <strong>.xlsx</strong>.
            </p>
            <p className="mt-2 text-xs text-muted/80 bg-canvas p-2.5 rounded-lg border border-border font-mono break-all">
              studentId, fullName, email, initialPassword, gender, birthDate, className, major, phoneNumber, enrollmentYear
            </p>

            <label className="mt-4 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border-strong hover:border-primary bg-canvas/40 hover:bg-primary-soft/30 p-5 cursor-pointer transition-all">
              <Upload className="h-6 w-6 text-primary" />
              <span className="text-sm font-semibold text-primary">Chọn file .xlsx</span>
              <span className="text-xs text-muted">Bấm để tải file lên từ máy tính</span>
              <input type="file" accept=".xlsx" onChange={importFile} disabled={pending} className="hidden" />
            </label>
          </section>

          {/* Card theo năm nhập học */}
          <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-sm min-w-0">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-ink">Quản lý theo khóa</h3>
            </div>
            <p className="mt-3 text-xs sm:text-sm text-muted">
              Xóa nhanh toàn bộ sinh viên và dữ liệu liên quan của một khóa nhập học.
            </p>
            <div className="mt-3 flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
              {years.length === 0 ? (
                <p className="text-xs sm:text-sm text-muted py-2">Chưa có khóa học nào.</p>
              ) : (
                years.map((item) => (
                  <div
                    key={item.enrollmentYear}
                    className="flex items-center justify-between rounded-xl border border-border bg-canvas/50 px-3.5 py-2.5 text-sm"
                  >
                    <span className="font-medium text-ink">
                      Khóa {item.enrollmentYear}{" "}
                      <span className="text-xs text-muted font-normal">({item.count} sinh viên)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => void removeYear(item.enrollmentYear)}
                      disabled={pending}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 hover:underline disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Xóa
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </section>

      {/* Danh sách sinh viên */}
      <section className="mt-8 rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-sm min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-ink">Danh sách sinh viên</h2>
            <span className="text-xs bg-primary-soft text-primary font-semibold px-2.5 py-0.5 rounded-full">
              {students.length} sinh viên
            </span>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-2.5 min-w-0 sm:w-auto w-full">
            <div className="relative flex-1 min-w-0 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm MSSV, họ tên, email..."
                className="w-full min-w-0 rounded-xl border border-border bg-surface pl-9 pr-3.5 py-2 text-sm text-ink placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <select
              value={selectedYear}
              onChange={(event) => setSelectedYear(event.target.value)}
              className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Tất cả các khóa</option>
              {years.map((item) => (
                <option key={item.enrollmentYear} value={item.enrollmentYear}>
                  Khóa {item.enrollmentYear}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void load()}
              className="rounded-xl border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition-colors shrink-0"
            >
              Tìm kiếm
            </button>
          </div>
        </div>

        {/* Table content */}
        {loading ? (
          <div className="py-12 text-center text-sm text-muted">Đang tải danh sách sinh viên...</div>
        ) : students.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted">Không tìm thấy sinh viên phù hợp.</div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-border bg-canvas/40 text-muted font-medium">
                  <th className="p-3">MSSV</th>
                  <th className="p-3">Họ và tên</th>
                  <th className="p-3">Email trường</th>
                  <th className="p-3">Khóa</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-canvas/50 transition-colors">
                    <td className="p-3 font-mono font-medium text-ink">{student.studentId}</td>
                    <td className="p-3 text-ink font-medium">{student.fullName}</td>
                    <td className="p-3 text-muted">{student.email}</td>
                    <td className="p-3 text-ink">Khóa {student.enrollmentYear}</td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => void removeStudent(student)}
                        disabled={pending}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
