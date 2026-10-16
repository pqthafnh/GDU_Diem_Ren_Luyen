"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { listPendingReviews, ApiEvent } from "@/lib/api"

export default function AdminDashboardPage() {
  const [events, setEvents] = useState<ApiEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  useEffect(() => {
    listPendingReviews().then(setEvents).catch((reason) => setError(reason instanceof Error ? reason.message : "Không thể tải danh sách xét duyệt.")).finally(() => setLoading(false))
  }, [])
  return <main className="container max-w-6xl py-8">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-ink">Quản trị viên</h1>
        <p className="mt-2 text-muted">Danh sách chờ duyệt từ backend.</p>
      </div>
      <Link href="/demo/admin/students" className="rounded-xl bg-primary px-4 py-2 font-semibold text-white">
        Quản lý danh sách sinh viên
      </Link>
    </div>
    {loading && <p className="mt-6">Đang tải...</p>}
    {error && <p className="mt-6 text-red-600">{error}</p>}
    {!loading && !error && events.length === 0 && <p className="mt-6 text-muted">Không có sự kiện chờ duyệt.</p>}
    <div className="mt-6 grid gap-4">{events.map((event) => <Link key={event.id} href={`/demo/admin/reviews/${event.id}`} className="rounded-2xl border border-border bg-surface p-5 hover:border-primary"><h2 className="font-semibold">{event.title}</h2><p className="text-sm text-muted">{event.status}</p></Link>)}</div>
  </main>
}
