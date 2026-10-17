const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

export type ApiEvent = {
  id: string
  title: string
  description?: string
  category: string
  eventType: string
  status: string
  startTime: string
  endTime: string
  locationName: string
  capacity: number | null
  registeredCount?: number
  pointsReward: number
}

export type ApiTicket = {
  id: string
  eventId: string
  status: string
  queueNumber: number
  seatNumber: string | null
  registeredAt: string
  eventTitle: string
  waitlistPosition?: number | null
}

export type ApiProfile = {
  id: string
  studentId: string | null
  fullName: string
  email: string
  role: string
  themePreference: string
}

export type AdminStudent = {
  id: string
  studentId: string
  fullName: string
  email: string
  gender: string
  birthDate: string
  className: string | null
  major: string | null
  phoneNumber: string | null
  enrollmentYear: number
  createdAt: string
}

export type AdminStaff = {
  id: string
  fullName: string
  email: string
  role: "ADMIN" | "MOD"
  gender: string
  birthDate: string
  phoneNumber: string | null
  createdAt: string
}

type ApiError = { error?: { message?: string }; detail?: string }

function clearSession() {
  localStorage.removeItem("gdu_access_token")
  localStorage.removeItem("gdu_user")
  window.location.assign("/demo/login")
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = typeof window === "undefined" ? null : localStorage.getItem("gdu_access_token")
  const headers = new Headers(init.headers)
  headers.set("Content-Type", "application/json")
  if (token) headers.set("Authorization", `Bearer ${token}`)
  const response = await fetch(`${API_URL}${path}`, { ...init, headers })
  const payload = (await response.json().catch(() => ({}))) as T & ApiError
  if (response.status === 401 && typeof window !== "undefined") clearSession()
  if (!response.ok) {
    throw new Error(payload.error?.message || payload.detail || "Không thể kết nối máy chủ.")
  }
  return payload as T
}

async function download(path: string): Promise<void> {
  const token = typeof window === "undefined" ? null : localStorage.getItem("gdu_access_token")
  const response = await fetch(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  if (response.status === 401 && typeof window !== "undefined") {
    clearSession()
    throw new Error("Phiên đăng nhập đã hết hạn.")
  }
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as ApiError
    throw new Error(payload.error?.message || payload.detail || "Không thể tải tệp.")
  }
  const blob = await response.blob()
  const disposition = response.headers.get("Content-Disposition")
  const filename = disposition?.match(/filename="?([^"]+)"?/)?.[1] || "report.xlsx"
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export async function login(identity: { studentId?: string; email?: string }, password: string) {
  return request<{
    success: boolean
    requirePasswordChange: boolean
    accessToken?: string
    user?: ApiProfile
    message: string
  }>("/auth/login", { method: "POST", body: JSON.stringify({ ...identity, password }) })
}

export async function changeFirstPassword(studentId: string, newPassword: string, confirmPassword: string) {
  return request<{ success: boolean; message?: string; schoolEmail?: string; testOtp?: string }>(
    "/auth/first-login/change-password",
    {
      method: "POST",
      body: JSON.stringify({ studentId, newPassword, confirmPassword }),
    }
  )
}

export async function verifyOtp(studentId: string, otp: string) {
  return request<{ accessToken?: string; user?: ApiProfile }>("/auth/first-login/verify-otp", {
    method: "POST",
    body: JSON.stringify({ studentId, otp }),
  })
}

export function saveSession(accessToken: string, user?: ApiProfile) {
  localStorage.setItem("gdu_access_token", accessToken)
  if (user) localStorage.setItem("gdu_user", JSON.stringify(user))
}

export async function getProfile() { return request<ApiProfile>("/auth/me") }
export async function listPublicEvents() { return request<ApiEvent[]>("/student/events") }
export async function getPublicEvent(eventId: string) {
  return request<ApiEvent>(`/student/events/${encodeURIComponent(eventId)}`)
}
export async function registerForEvent(eventId: string, phoneNumber: string) {
  return request<ApiTicket>(`/student/events/${encodeURIComponent(eventId)}/register`, {
    method: "POST",
    body: JSON.stringify({ phoneNumber, confirmCorrect: true }),
  })
}
export async function listTickets() { return request<ApiTicket[]>("/student/tickets") }
export async function listOwnedEvents(statusGroup?: string) {
  const suffix = statusGroup ? `?status_group=${encodeURIComponent(statusGroup)}` : ""
  return request<ApiEvent[]>(`/mod/events${suffix}`)
}
export async function listPendingReviews() { return request<ApiEvent[]>("/admin/reviews") }
export async function listAdminStudents(search?: string, enrollmentYear?: number) {
  const params = new URLSearchParams()
  if (search) params.set("search", search)
  if (enrollmentYear) params.set("enrollmentYear", String(enrollmentYear))
  return request<{
    students: AdminStudent[]
    years: Array<{ enrollmentYear: number; count: number }>
    total: number
    page: number
    limit: number
  }>(`/admin/students?${params.toString()}`)
}
export async function createAdminStudent(student: {
  studentId: string
  fullName: string
  email: string
  initialPassword: string
  gender: string
  birthDate: string
  className?: string
  major?: string
  phoneNumber?: string
  enrollmentYear: number
}) {
  return request<AdminStudent>("/admin/students", {
    method: "POST",
    body: JSON.stringify(student),
  })
}
export async function importAdminStudents(file: File) {
  const token = typeof window === "undefined" ? null : localStorage.getItem("gdu_access_token")
  const body = new FormData()
  body.append("file", file)
  const response = await fetch(`${API_URL}/admin/students/import`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body,
  })
  const payload = (await response.json().catch(() => ({}))) as
    | AdminStudent[]
    | ApiError
  if (response.status === 401 && typeof window !== "undefined") clearSession()
  if (!response.ok) {
    const error = payload as ApiError
    throw new Error(error.error?.message || error.detail || "Không thể nhập danh sách sinh viên.")
  }
  return payload as AdminStudent[]
}
export async function deleteAdminStudent(studentId: string) {
  return request<{ deletedCount: number }>(`/admin/students/${encodeURIComponent(studentId)}`, {
    method: "DELETE",
  })
}
export async function deleteAdminStudentYear(enrollmentYear: number) {
  return request<{ deletedCount: number }>(`/admin/students/year/${enrollmentYear}`, {
    method: "DELETE",
  })
}
export async function listAdminStaff(search?: string, role?: "ADMIN" | "MOD") {
  const params = new URLSearchParams()
  if (search) params.set("search", search)
  if (role) params.set("role", role)
  return request<{ staff: AdminStaff[]; total: number; page: number; limit: number }>(
    `/admin/staff?${params.toString()}`,
  )
}
export async function createAdminStaff(staff: {
  fullName: string
  email: string
  initialPassword: string
  role: "ADMIN" | "MOD"
  gender: string
  birthDate: string
  phoneNumber?: string
}) {
  return request<AdminStaff>("/admin/staff", {
    method: "POST",
    body: JSON.stringify(staff),
  })
}
export async function importAdminStaff(file: File) {
  const token = typeof window === "undefined" ? null : localStorage.getItem("gdu_access_token")
  const body = new FormData()
  body.append("file", file)
  const response = await fetch(`${API_URL}/admin/staff/import`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body,
  })
  const payload = (await response.json().catch(() => ({}))) as AdminStaff[] | ApiError
  if (response.status === 401 && typeof window !== "undefined") clearSession()
  if (!response.ok) {
    const error = payload as ApiError
    throw new Error(error.error?.message || error.detail || "Không thể nhập tài khoản cán bộ.")
  }
  return payload as AdminStaff[]
}
export async function deleteAdminStaff(staffId: string) {
  return request<{ deletedCount: number }>(`/admin/staff/${encodeURIComponent(staffId)}`, {
    method: "DELETE",
  })
}
export async function getQrToken(eventId: string) {
  return request<{ token: string }>(`/mod/events/${encodeURIComponent(eventId)}/projector/qr-token`)
}
export async function downloadEventReport(eventId: string) {
  return download(`/mod/events/${encodeURIComponent(eventId)}/report/export`)
}
export async function getMasterMatrix(search?: string) {
  const query = search ? `?search=${encodeURIComponent(search)}` : ""
  return request<Record<string, unknown>>(`/mod/reports/master-matrix${query}`)
}
export async function downloadMasterMatrix() { return download("/mod/reports/master-matrix/export") }
export async function listInteractiveSubmissions(eventId: string) {
  return request<{ submissions: Array<Record<string, unknown>>; statistics: Record<string, number> }>(
    `/mod/events/${encodeURIComponent(eventId)}/interactive-submissions`,
  )
}
export async function getTrainingPoints(semester?: string, academicYear?: string) {
  const params = new URLSearchParams()
  if (semester) params.set("semester", semester)
  if (academicYear) params.set("academicYear", academicYear)
  return request<{ cumulativeTotal3Years: number; history: Array<Record<string, unknown>> }>(
    `/student/training-points?${params.toString()}`,
  )
}
