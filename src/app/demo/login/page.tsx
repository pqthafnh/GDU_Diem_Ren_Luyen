import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, GraduationCap } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-canvas">
      {/* Left side - Branding/Image */}
      <div className="hidden md:flex md:w-1/2 bg-primary relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-[url('/img/banner.jpg')] bg-cover bg-center opacity-20 mix-blend-luminosity"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-transparent"></div>
        
        <div className="relative z-10 flex items-center gap-2">
          <Image src="/img/gdu-logo.png" alt="GDU Logo" width={240} height={80} className="h-auto w-auto max-h-20 object-contain" />
        </div>
        
        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Hệ thống quản lý sự kiện và điểm rèn luyện
          </h1>
          <p className="text-white/80 text-lg">
            Khám phá các hoạt động ngoại khóa, tham gia sự kiện và theo dõi tiến độ điểm rèn luyện của bạn trong suốt 3 năm học.
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 relative bg-surface">
        <div className="w-full max-w-md flex flex-col gap-8">
          <div className="flex flex-col gap-2 text-center md:text-left">
            <div className="md:hidden flex items-center justify-center gap-2 mb-8">
              <Image src="/img/logo-chinh.png" alt="GDU Logo" width={250} height={80} className="w-full max-w-[250px] h-auto object-contain" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-ink tracking-tight">Đăng nhập</h2>
            <p className="text-body text-[15px]">Sử dụng tài khoản email trường (@gdu.edu.vn) để tiếp tục.</p>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-semibold text-ink uppercase tracking-wide">
                Email / Mã sinh viên
              </label>
              <input 
                type="email" 
                placeholder="VD: 23000123@gdu.edu.vn" 
                className="flex h-12 w-full rounded-lg border border-border bg-canvas px-4 text-[15px] placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-semibold text-ink uppercase tracking-wide">
                  Mật khẩu
                </label>
                <Link href="#" className="text-[13px] font-medium text-primary hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="flex h-12 w-full rounded-lg border border-border bg-canvas px-4 text-[15px] placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
              />
            </div>
            
            <Link href="/demo/student" className="w-full mt-2">
              <Button className="h-12 w-full font-bold text-[15px] group bg-primary hover:bg-primary-hover">
                Đăng nhập ngay
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink-0 mx-4 text-muted text-[13px] uppercase tracking-wide font-medium">Hoặc trải nghiệm demo</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link href="/demo/student">
              <Button variant="outline" className="w-full h-11 border-border-strong text-ink hover:bg-canvas font-medium">
                Góc nhìn Sinh viên
              </Button>
            </Link>
            <Link href="/demo/MOD">
              <Button variant="outline" className="w-full h-11 border-border-strong text-ink hover:bg-canvas font-medium">
                Góc nhìn Ban tổ chức
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
