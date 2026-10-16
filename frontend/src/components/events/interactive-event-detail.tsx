"use client"

import { Event } from "@/types"

export function InteractiveEventDetail({ event }: { event: Event }) {
  return (
    <main className="container max-w-3xl py-10">
      <h1 className="text-3xl font-bold text-ink">{event.title}</h1>
      <p className="mt-4 text-body">{event.content}</p>
      <section className="mt-8 rounded-2xl border border-border bg-surface p-6">
        <h2 className="font-semibold">Minh chứng tương tác</h2>
        <p className="mt-2 text-muted">
          API chi tiết hoạt động tương tác chưa trả về cấu hình hành động cho sinh viên. Không thể gửi minh chứng an toàn khi thiếu cấu hình từ backend.
        </p>
      </section>
    </main>
  )
}
