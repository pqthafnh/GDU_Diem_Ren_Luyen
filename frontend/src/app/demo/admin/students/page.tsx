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
      setMessage("Đã thêm sinh viên.")
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
      setMessage(`Đã nhập ${imported.length} sinh viên.`)
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
    <main className="container max-w-7xl py-8">
      <h1 className="text-3xl font-bold text-ink">Quản lý sinh viên</h1>
      <p className="mt-2 text-muted">Thêm từng sinh viên hoặc nhập hàng loạt bằng file Excel.</p>
      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}
      {message && <p className="mt-4 rounded-xl bg-green-50 p-3 text-green-700">{message}</p>}

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <form onSubmit={(event) => void createStudent(event)} className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-lg font-semibold">Thêm sinh viên</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {([
              ["studentId", "MSSV", "text"],
              ["fullName", "Họ và tên", "text"],
              ["email", "Email trường", "email"],
              ["initialPassword", "Mật khẩu ban đầu", "password"],
              ["birthDate", "Ngày sinh", "date"],
              ["className", "Lớp", "text"],
              ["major", "Ngành", "text"],
              ["phoneNumber", "Số điện thoại", "tel"],
              ["enrollmentYear", "Năm nhập học", "number"],
            ] as const).map(([name, label, type]) => (
              <label key={name} className="grid gap-1 text-sm">
                {label}
                <input name={name} type={type} required={["studentId", "fullName", "email", "initialPassword", "birthDate", "enrollmentYear"].includes(name)} value={form[name]} onChange={updateField} className="rounded-lg border border-border px-3 py-2" />
              </label>
            ))}
            <label className="grid gap-1 text-sm">Giới tính<select name="gender" value={form.gender} onChange={updateField} className="rounded-lg border border-border px-3 py-2"><option>Nam</option><option>Nữ</option><option>Khác</option></select></label>
          </div>
          <button disabled={pending} className="mt-4 rounded-xl bg-primary px-4 py-2 font-semibold text-white disabled:opacity-50">Thêm sinh viên</button>
        </form>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-lg font-semibold">Nhập Excel</h2>
          <p className="mt-2 text-sm text-muted">Header bắt buộc: studentId, fullName, email, initialPassword, gender, birthDate, className, major, phoneNumber, enrollmentYear.</p>
          <label className="mt-5 inline-flex cursor-pointer rounded-xl border border-primary px-4 py-2 font-semibold text-primary">
            Chọn file .xlsx
            <input type="file" accept=".xlsx" onChange={importFile} disabled={pending} className="hidden" />
          </label>
          <h3 className="mt-8 font-semibold">Theo năm nhập học</h3>
          <div className="mt-3 grid gap-2">
            {years.map((item) => <div key={item.enrollmentYear} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"><span>Khóa {item.enrollmentYear} ({item.count})</span><button type="button" onClick={() => void removeYear(item.enrollmentYear)} disabled={pending} className="text-red-600">Xóa cả khóa</button></div>)}
          </div>
        </section>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-surface p-5">
        <div className="flex flex-wrap gap-2">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm MSSV, tên, email" className="rounded-lg border border-border px-3 py-2" />
          <select value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)} className="rounded-lg border border-border px-3 py-2"><option value="">Tất cả năm</option>{years.map((item) => <option key={item.enrollmentYear} value={item.enrollmentYear}>Khóa {item.enrollmentYear}</option>)}</select>
          <button type="button" onClick={() => void load()} className="rounded-lg border border-primary px-4 py-2 text-primary">Tìm kiếm</button>
        </div>
        {loading ? <p className="mt-6">Đang tải...</p> : students.length === 0 ? <p className="mt-6 text-muted">Không có sinh viên.</p> : <div className="mt-5 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-border"><th className="p-2">MSSV</th><th className="p-2">Họ tên</th><th className="p-2">Email</th><th className="p-2">Khóa</th><th className="p-2"></th></tr></thead><tbody>{students.map((student) => <tr key={student.id} className="border-b border-border/60"><td className="p-2">{student.studentId}</td><td className="p-2">{student.fullName}</td><td className="p-2">{student.email}</td><td className="p-2">{student.enrollmentYear}</td><td className="p-2 text-right"><button type="button" onClick={() => void removeStudent(student)} disabled={pending} className="text-red-600">Xóa</button></td></tr>)}</tbody></table></div>}
      </section>
    </main>
  )
}
