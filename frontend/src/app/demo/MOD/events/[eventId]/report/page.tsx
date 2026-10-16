"use client"

import { useEffect, useState } from "react"
import { downloadEventReport, listOwnedEvents, ApiEvent } from "@/lib/api"

export default function EventReportPage({ params }: { params: { eventId: string } }) {
  const [event, setEvent] = useState<ApiEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    listOwnedEvents()
      .then((events) => setEvent(events.find((item) => item.id === params.eventId) || null))
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Không thể tải báo cáo."))
      .finally(() => setLoading(false))
  }, [params.eventId])

  const exportReport = async () => {
    setDownloading(true)
    setError("")
    try {
      await downloadEventReport(params.eventId)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể tải báo cáo.")
    } finally {
      setDownloading(false)
    }
  }

  if (loading) return <main className="container py-10">Đang tải báo cáo...</main>
  if (error && !event) return <main className="container py-10 text-red-600">{error}</main>
  if (!event) return <main className="container py-10">Không tìm thấy sự kiện.</main>

  return (
    <main className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold text-ink">{event.title}</h1>
      <p className="mt-2 text-muted">Báo cáo được tạo từ dữ liệu điểm danh và vé trong PostgreSQL.</p>
      <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
        <p className="text-sm text-muted">Số vé chính thức</p>
        <p className="text-3xl font-bold text-primary">{event.registeredCount || 0}</p>
        <button
          type="button"
          disabled={downloading}
          onClick={() => void exportReport()}
          className="mt-6 rounded-xl bg-primary px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
          {downloading ? "Đang tạo file..." : "Tải báo cáo Excel"}
        </button>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    </main>
  )
}
