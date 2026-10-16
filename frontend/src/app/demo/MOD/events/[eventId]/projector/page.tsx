"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getQrToken, listOwnedEvents, ApiEvent } from "@/lib/api"

export default function ProjectorMODPage({ params }: { params: { eventId: string } }) {
  const router = useRouter()
  const [event, setEvent] = useState<ApiEvent | null>(null)
  const [token, setToken] = useState("")
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const [events, qr] = await Promise.all([listOwnedEvents(), getQrToken(params.eventId)])
        if (!cancelled) {
          setEvent(events.find((item) => item.id === params.eventId) || null)
          setToken(qr.token)
          setSeconds(30)
          setLoading(false)
        }
      } catch (reason) {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : "Không thể tải mã điểm danh.")
          setLoading(false)
        }
      }
    }
    void load()
    const timer = window.setInterval(() => {
      setSeconds((value) => {
        if (value > 1) return value - 1
        void load()
        return 30
      })
    }, 1000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [params.eventId])

  if (loading) return <main className="min-h-screen bg-primary text-white p-8">Đang tải projector...</main>
  if (error) return <main className="min-h-screen bg-primary text-white p-8"><p>{error}</p></main>
  if (!event) return <main className="min-h-screen bg-primary text-white p-8"><p>Không tìm thấy sự kiện.</p></main>

  return (
    <main className="min-h-screen bg-primary text-white p-8 flex flex-col gap-8">
      <header className="flex items-center justify-between border-b border-white/20 pb-6">
        <div>
          <button onClick={() => router.back()} className="mb-3 text-white/70">← Quay lại</button>
          <h1 className="text-3xl font-bold">{event.title}</h1>
          <p className="text-white/70">{event.locationName}</p>
        </div>
        <span className="text-accent font-bold">{seconds}s</span>
      </header>
      <section className="flex flex-col items-center gap-4">
        <div className="bg-white text-primary rounded-2xl p-8 max-w-2xl w-full break-all text-center">
          <p className="text-xs uppercase text-muted mb-3">QR token do backend cấp</p>
          <code className="text-sm">{token}</code>
        </div>
        <p className="text-white/70">Mã được làm mới theo TTL 30 giây. Token không được lưu dài hạn.</p>
      </section>
    </main>
  )
}
