"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container flex flex-col items-center justify-center min-h-[70vh] gap-4 text-center">
      <AlertTriangle className="h-16 w-16 text-error" />
      <h1 className="text-2xl font-bold text-ink">Đã xảy ra lỗi</h1>
      <p className="text-body max-w-md">
        Hệ thống gặp sự cố khi tải trang. Vui lòng thử lại sau.
      </p>
      <Button variant="outline" onClick={() => reset()} className="mt-4">
        Thử lại
      </Button>
    </div>
  )
}
