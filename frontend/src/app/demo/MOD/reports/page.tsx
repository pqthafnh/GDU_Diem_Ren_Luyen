"use client"

import { useEffect, useState } from "react"
import { downloadMasterMatrix, getMasterMatrix } from "@/lib/api"

export default function MODReportsPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState("")

  const load = async (search = "") => {
    setLoading(true)
    setError("")
    try {
      setData(await getMasterMatrix(search))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể tải Master Matrix.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const exportMatrix = async () => {
    setDownloading(true)
    setError("")
    try {
      await downloadMasterMatrix()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không thể tải file.")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <main className="container max-w-6xl py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink">Master Matrix</h1>
          <p className="text-muted">Dữ liệu lấy trực tiếp từ backend.</p>
        </div>
        <button
          type="button"
          onClick={() => void exportMatrix()}
          disabled={downloading}
          className="rounded-xl bg-primary px-4 py-2 font-semibold text-white disabled:opacity-50"
        >
          {downloading ? "Đang tải..." : "Xuất Excel"}
        </button>
      </header>
      <form
        className="mt-6 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          void load(query)
        }}
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Tìm sinh viên..."
          className="flex-1 rounded-xl border border-border bg-surface px-4 py-2"
        />
        <button className="rounded-xl border border-primary px-4 py-2 text-primary">Tìm</button>
      </form>
      {error && <p className="mt-4 text-red-600">{error}</p>}
      {loading ? (
        <p className="mt-8">Đang tải dữ liệu...</p>
      ) : data ? (
        <pre className="mt-8 overflow-auto rounded-2xl border border-border bg-surface p-5 text-xs">
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : (
        <p className="mt-8 rounded-2xl border border-border p-8 text-center text-muted">Chưa có dữ liệu.</p>
      )}
    </main>
  )
}
