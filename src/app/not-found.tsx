import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[70vh] gap-4 text-center">
      <AlertCircle className="h-16 w-16 text-muted" />
      <h1 className="text-2xl font-bold text-ink">Không tìm thấy trang</h1>
      <p className="text-body max-w-md">
        Trang bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ bỏ. Vui lòng kiểm tra lại đường dẫn.
      </p>
      <Link href="/demo/student">
        <Button variant="primary" className="mt-4">
          Về trang chủ
        </Button>
      </Link>
    </div>
  )
}
