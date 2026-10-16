"use client"

import { useEffect, useState } from "react"
import { listOwnedEvents, ApiEvent } from "@/lib/api"

export default function MODAttendancePage({ params }: { params: { eventId: string } }) {
  const [event, setEvent] = useState<ApiEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  useEffect(() => {
    listOwnedEvents()
      .then((events) => setEvent(events.find((item) => item.id === params.eventId) || null))
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Không thể tải sự kiện."))
      .finally(() => setLoading(false))
  }, [params.eventId])
  if (loading) return <main className="container py-10">Đang tải điểm danh...</main>
  if (error) return <main className="container py-10 text-red-600">{error}</main>
  if (!event) return <main className="container py-10">Không tìm thấy sự kiện.</main>
  return <main className="container max-w-4xl py-8">
    <h1 className="text-3xl font-bold text-ink">Điểm danh: {event.title}</h1>
    <p className="mt-2 text-muted">{event.locationName} · {event.status}</p>
    <section className="mt-8 rounded-2xl border border-border bg-surface p-6">
      <h2 className="font-semibold">Dữ liệu điểm danh</h2>
      <p className="mt-2 text-muted">Màn hình này không lưu danh sách cục bộ. Backend chưa cung cấp read endpoint cho roster điểm danh trong contract hiện tại.</p>
      <p className="mt-3 text-sm text-muted">Dùng projector QR và các endpoint attendance backend để ghi nhận điểm danh.</p>
    </section>
  </main>
}
