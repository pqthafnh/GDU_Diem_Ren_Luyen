"use client"

import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react"
import {
  AdminStaff,
  createAdminStaff,
  deleteAdminStaff,
  importAdminStaff,
  listAdminStaff,
} from "@/lib/api"

type StaffForm = {
  fullName: string
  email: string
  initialPassword: string
  role: "ADMIN" | "MOD"
  gender: string
  birthDate: string
  phoneNumber: string
}

const EMPTY_FORM: StaffForm = {
  fullName: "",
  email: "",
  initialPassword: "",
  role: "MOD",
  gender: "Khác",
  birthDate: "",
  phoneNumber: "",
}

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<AdminStaff[]>([])
  const [form, setForm] = useState<StaffForm>(EMPTY_FORM)
  const [search, setSearch] = useState("")
  const [role, setRole] = useState<"" | "ADMIN" | "MOD">("")
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await listAdminStaff(search, role || undefined)
      setStaff(result.staff)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể tải tài khoản cán bộ.")
    } finally {
      setLoading(false)
    }
  }, [role, search])

  useEffect(() => { void load() }, [load])

  const update = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const create = async (event: FormEvent) => {
    event.preventDefault()
    setPending(true)
    setError("")
    setMessage("")
    try {
      await createAdminStaff(form)
      setForm(EMPTY_FORM)
      setMessage("Đã thêm tài khoản cán bộ.")
      await load()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể thêm tài khoản.")
    } finally {
      setPending(false)
    }
  }

  const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setPending(true)
    setError("")
    try {
      const imported = await importAdminStaff(file)
      setMessage(`Đã nhập ${imported.length} tài khoản.`)
      await load()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể nhập file Excel.")
    } finally {
      event.target.value = ""
      setPending(false)
    }
  }

  const remove = async (account: AdminStaff) => {
    if (!window.confirm(`Xóa tài khoản ${account.email}?`)) return
    setPending(true)
    try {
      await deleteAdminStaff(account.id)
      setMessage("Đã xóa tài khoản.")
      await load()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể xóa tài khoản.")
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="container max-w-6xl py-8">
      <h1 className="text-3xl font-bold text-ink">Quản lý Admin và MOD</h1>
      <p className="mt-2 text-muted">Tạo tài khoản cán bộ mới hoặc nhập hàng loạt bằng Excel.</p>
      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}
      {message && <p className="mt-4 rounded-xl bg-green-50 p-3 text-green-700">{message}</p>}
      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <form onSubmit={(event) => void create(event)} className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-lg font-semibold">Thêm tài khoản</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">Họ và tên<input name="fullName" required value={form.fullName} onChange={update} className="rounded-lg border border-border px-3 py-2" /></label>
            <label className="grid gap-1 text-sm">Email<input name="email" type="email" required value={form.email} onChange={update} className="rounded-lg border border-border px-3 py-2" /></label>
            <label className="grid gap-1 text-sm">Mật khẩu ban đầu<input name="initialPassword" type="password" minLength={8} required value={form.initialPassword} onChange={update} className="rounded-lg border border-border px-3 py-2" /></label>
            <label className="grid gap-1 text-sm">Vai trò<select name="role" value={form.role} onChange={update} className="rounded-lg border border-border px-3 py-2"><option value="MOD">MOD</option><option value="ADMIN">ADMIN</option></select></label>
            <label className="grid gap-1 text-sm">Ngày sinh<input name="birthDate" type="date" required value={form.birthDate} onChange={update} className="rounded-lg border border-border px-3 py-2" /></label>
            <label className="grid gap-1 text-sm">Số điện thoại<input name="phoneNumber" value={form.phoneNumber} onChange={update} className="rounded-lg border border-border px-3 py-2" /></label>
          </div>
          <button disabled={pending} className="mt-4 rounded-xl bg-primary px-4 py-2 font-semibold text-white disabled:opacity-50">Thêm tài khoản</button>
        </form>
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-lg font-semibold">Nhập Excel</h2>
          <p className="mt-2 text-sm text-muted">Header: fullName, email, initialPassword, role, gender, birthDate, phoneNumber.</p>
          <label className="mt-5 inline-flex cursor-pointer rounded-xl border border-primary px-4 py-2 font-semibold text-primary">Chọn file .xlsx<input type="file" accept=".xlsx" onChange={importFile} disabled={pending} className="hidden" /></label>
          <p className="mt-4 text-sm text-muted">Role trong file chỉ được là ADMIN hoặc MOD. Toàn bộ file sẽ rollback nếu một dòng lỗi hoặc trùng email.</p>
        </section>
      </section>
      <section className="mt-6 rounded-2xl border border-border bg-surface p-5">
        <div className="flex flex-wrap gap-2"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên hoặc email" className="rounded-lg border border-border px-3 py-2" /><select value={role} onChange={(event) => setRole(event.target.value as "" | "ADMIN" | "MOD")} className="rounded-lg border border-border px-3 py-2"><option value="">Tất cả vai trò</option><option value="ADMIN">ADMIN</option><option value="MOD">MOD</option></select><button type="button" onClick={() => void load()} className="rounded-lg border border-primary px-4 py-2 text-primary">Tìm kiếm</button></div>
        {loading ? <p className="mt-6">Đang tải...</p> : staff.length === 0 ? <p className="mt-6 text-muted">Chưa có tài khoản.</p> : <div className="mt-5 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-border"><th className="p-2">Họ tên</th><th className="p-2">Email</th><th className="p-2">Vai trò</th><th className="p-2"></th></tr></thead><tbody>{staff.map((account) => <tr key={account.id} className="border-b border-border/60"><td className="p-2">{account.fullName}</td><td className="p-2">{account.email}</td><td className="p-2">{account.role}</td><td className="p-2 text-right"><button type="button" onClick={() => void remove(account)} disabled={pending} className="text-red-600">Xóa</button></td></tr>)}</tbody></table></div>}
      </section>
    </main>
  )
}
