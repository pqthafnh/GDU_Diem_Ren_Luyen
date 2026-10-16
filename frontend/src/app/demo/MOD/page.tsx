"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { listOwnedEvents, ApiEvent } from "@/lib/api"

export default function MODDashboardPage() {
  const [events, setEvents] = useState<ApiEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  useEffect(() => {
    listOwnedEvents().then(setEvents).catch((reason) => setError(reason instanceof Error ? reason.message : "Không thể tải sự kiện.")).finally(() => setLoading(false))
  }, [])
  return <main className="container max-w-6xl py-8">
    <h1 className="text-3xl font-bold text-ink">Không gian làm việc (MOD)</h1>
    <p className="mt-2 text-muted">Sự kiện được tải từ backend.</p>
    {loading && <p className="mt-6">Đang tải...</p>}
    {error && <p className="mt-6 text-red-600">{error}</p>}
    {!loading && !error && events.length === 0 && <p className="mt-6 text-muted">Chưa có sự kiện.</p>}
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      {events.map((event) => <Link key={event.id} href={`/demo/MOD/events/${event.id}`} className="rounded-2xl border border-border bg-surface p-5 hover:border-primary">
        <h2 className="font-semibold">{event.title}</h2><p className="mt-2 text-sm text-muted">{event.status} · {event.locationName}</p>
      </Link>)}
    </div>
  </main>
}
