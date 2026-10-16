"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { listOwnedEvents, ApiEvent } from "@/lib/api"

export default function MODEventDetailPage({ params }: { params: { eventId: string } }) {
  const [event, setEvent] = useState<ApiEvent | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    listOwnedEvents().then((events) => setEvent(events.find((item) => item.id === params.eventId) || null)).catch((reason) => setError(reason instanceof Error ? reason.message : "Không thể tải sự kiện.")).finally(() => setLoading(false))
  }, [params.eventId])
  if (loading) return <main className="container py-10">Đang tải...</main>
  if (error) return <main className="container py-10 text-red-600">{error}</main>
  if (!event) return <main className="container py-10">Không tìm thấy sự kiện.</main>
  return <main className="container max-w-5xl py-8">
    <Link href="/demo/MOD/events" className="text-primary">← Danh sách sự kiện</Link>
    <h1 className="mt-4 text-3xl font-bold text-ink">{event.title}</h1>
    <p className="mt-2 text-muted">{event.status} · {event.locationName} · {new Date(event.startTime).toLocaleString("vi-VN")}</p>
    <p className="mt-6 text-body">{event.description || "Chưa có mô tả."}</p>
    <div className="mt-8 flex flex-wrap gap-3">
      <Link href={`/demo/MOD/events/${event.id}/attendance`} className="rounded-xl bg-primary px-4 py-2 text-white">Điểm danh</Link>
      <Link href={`/demo/MOD/events/${event.id}/projector`} className="rounded-xl border border-primary px-4 py-2 text-primary">Projector QR</Link>
      <Link href={`/demo/MOD/events/${event.id}/report`} className="rounded-xl border border-border px-4 py-2">Báo cáo</Link>
    </div>
  </main>
}
