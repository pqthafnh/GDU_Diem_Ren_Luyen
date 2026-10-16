"use client"

import { useEffect, useState } from "react"
import { listTickets, ApiTicket } from "@/lib/api"

export default function StudentSchedulePage() {
  const [tickets, setTickets] = useState<ApiTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  useEffect(() => {
    listTickets()
      .then(setTickets)
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Không thể tải lịch."))
      .finally(() => setLoading(false))
  }, [])
  return (
    <main className="container max-w-5xl py-8">
      <h1 className="text-3xl font-bold text-ink">Lịch hoạt động</h1>
      {loading && <p className="mt-6">Đang tải lịch...</p>}
      {error && <p className="mt-6 text-red-600">{error}</p>}
      {!loading && !error && tickets.length === 0 && <p className="mt-6 text-muted">Chưa có hoạt động đã đăng ký.</p>}
      <div className="mt-6 grid gap-4">
        {tickets.map((ticket) => (
          <article key={ticket.id} className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="font-semibold">{ticket.eventTitle}</h2>
            <p className="text-sm text-muted">Trạng thái vé: {ticket.status}</p>
            <p className="text-sm text-muted">Đăng ký: {new Date(ticket.registeredAt).toLocaleString("vi-VN")}</p>
          </article>
        ))}
      </div>
    </main>
  )
}
