"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { listOwnedEvents, downloadEventReport, ApiEvent } from "@/lib/api"

export default function MODRegistrationsPage({ params }: { params: { eventId: string } }) {
  const [event, setEvent] = useState<ApiEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")

  useEffect(() => {
    listOwnedEvents()
      .then((events) => setEvent(events.find((item) => item.id === params.eventId) || null))
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Không thể tải sự kiện."))
      .finally(() => setLoading(false))
  }, [params.eventId])

  const title = event?.title || ""
  const filteredTitle = useMemo(
    () => title.toLowerCase().includes(query.toLowerCase()),
    [title, query],
  )

  const exportReport = async () => {
    setExporting(true)
    setError("")
    try {
      await downloadEventReport(params.eventId)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể tải báo cáo.")
    } finally {
      setExporting(false)
    }
  }

  if (loading) return <main className="container py-10">Đang tải danh sách đăng ký...</main>
  if (error && !event) return <main className="container py-10 text-red-600">{error}</main>
  if (!event) return <main className="container py-10">Không tìm thấy sự kiện.</main>

  return (
    <main className="container max-w-5xl py-8 flex flex-col gap-6">
      <header className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <Link href={`/demo/MOD/events/${event.id}`} className="text-sm text-primary">← Quay lại</Link>
          <h1 className="text-2xl font-bold text-ink mt-2">Quản lý vé & đăng ký</h1>
          <p className="text-muted">{event.title}</p>
        </div>
        <button
          type="button"
          disabled={exporting}
          onClick={() => void exportReport()}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {exporting ? "Đang tải..." : "Xuất Excel"}
        </button>
      </header>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Tìm theo tên sự kiện..."
        className="rounded-xl border border-border bg-surface px-4 py-2"
      />
      {filteredTitle ? (
        <section className="rounded-2xl border border-border bg-surface p-6">
          <p className="text-sm text-muted">Dữ liệu đăng ký được bảo vệ bởi API backend.</p>
          <p className="mt-2 text-lg font-semibold">{event.registeredCount || 0} vé chính thức</p>
          <p className="text-sm text-muted">Chi tiết và file Excel lấy trực tiếp từ endpoint báo cáo.</p>
        </section>
      ) : (
        <p className="rounded-2xl border border-border p-8 text-center text-muted">Không tìm thấy.</p>
      )}
    </main>
  )
}
