"use client"

import { useEffect, useState } from "react"
import { listPendingReviews, ApiEvent } from "@/lib/api"

export default function AdminReviewDetailPage({ params }: { params: { eventId: string } }) {
  const [event, setEvent] = useState<ApiEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  useEffect(() => {
    listPendingReviews().then((events) => setEvent(events.find((item) => item.id === params.eventId) || null)).catch((reason) => setError(reason instanceof Error ? reason.message : "Không thể tải hồ sơ.")).finally(() => setLoading(false))
  }, [params.eventId])
  if (loading) return <main className="container py-10">Đang tải hồ sơ xét duyệt...</main>
  if (error) return <main className="container py-10 text-red-600">{error}</main>
  if (!event) return <main className="container py-10">Không tìm thấy hồ sơ.</main>
  return <main className="container max-w-4xl py-8"><h1 className="text-3xl font-bold text-ink">{event.title}</h1><p className="mt-2 text-muted">Trạng thái: {event.status}</p><div className="mt-6 rounded-2xl border border-border bg-surface p-6"><p>{event.description || "Chưa có mô tả."}</p><p className="mt-3 text-sm text-muted">{event.locationName} · {new Date(event.startTime).toLocaleString("vi-VN")}</p><p className="mt-5 text-sm text-muted">Các thao tác xét duyệt sẽ được bổ sung khi endpoint mutation tương ứng được cung cấp.</p></div></main>
}
