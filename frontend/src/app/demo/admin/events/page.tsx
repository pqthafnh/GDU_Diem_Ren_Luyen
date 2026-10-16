"use client"

import { useEffect, useState } from "react"
import { listPendingReviews, ApiEvent } from "@/lib/api"

export default function AdminEventsPage() {
  const [events, setEvents] = useState<ApiEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  useEffect(() => {
    listPendingReviews().then(setEvents).catch((reason) => setError(reason instanceof Error ? reason.message : "Không thể tải sự kiện.")).finally(() => setLoading(false))
  }, [])
  return <main className="container max-w-6xl py-8"><h1 className="text-3xl font-bold text-ink">Quản lý sự kiện</h1><p className="mt-2 text-muted">Phạm vi dữ liệu hiện có trong API admin là các sự kiện chờ duyệt.</p>
    {loading && <p className="mt-6">Đang tải...</p>}{error && <p className="mt-6 text-red-600">{error}</p>}
    {!loading && !error && events.length === 0 && <p className="mt-6 text-muted">Không có dữ liệu.</p>}
    <div className="mt-6 grid gap-3">{events.map((event) => <article key={event.id} className="rounded-2xl border border-border bg-surface p-5"><h2 className="font-semibold">{event.title}</h2><p className="text-sm text-muted">{event.status} · {event.locationName}</p></article>)}</div>
  </main>
}
