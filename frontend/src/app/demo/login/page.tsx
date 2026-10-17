"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { changeFirstPassword, login, saveSession, verifyOtp } from "@/lib/api"
import { ArrowRight, KeyRound, Mail, CheckCircle2, ShieldAlert, ArrowLeft, Lock, GraduationCap, Building2, Eye, EyeOff } from "lucide-react"

type LoginStep = "LOGIN" | "CHANGE_PASSWORD_FIRST_TIME" | "VERIFY_EMAIL" | "SUCCESS"

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<LoginStep>("LOGIN")
  
  // Tab đăng nhập: Sinh viên hoặc Cán bộ / Quản trị
  const [roleTab, setRoleTab] = useState<"STUDENT" | "STAFF">("STUDENT")
  
  const [studentId, setStudentId] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState("")

  const [staffEmail, setStaffEmail] = useState("")
  const [staffPassword, setStaffPassword] = useState("")
  const [showStaffPassword, setShowStaffPassword] = useState(false)
  const [staffError, setStaffError] = useState("")
  
  // First time change password state
  const [newPassword, setNewPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  
  // OTP state
  const [otp, setOtp] = useState("")
  const [otpError, setOtpError] = useState("")
  const [targetEmail, setTargetEmail] = useState("")

  // Kiểm tra mật khẩu ban đầu chưa thay đổi theo cấu trúc GDU@ + TEN + ddmm
  const isDefaultPassword = (pass: string) => {
    const trimmed = pass.trim().toUpperCase()
    return trimmed.startsWith("GDU@")
  }

  // Xử lý đăng nhập Sinh viên
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setLoginError("")

    if (!studentId.trim()) {
      setLoginError("Vui lòng nhập Mã số sinh viên (MSSV).")
      return
    }

    if (!password) {
      setLoginError("Vui lòng nhập mật khẩu.")
      return
    }

    try {
      const result = await login({ studentId: studentId.trim() }, password)
      if (result.requirePasswordChange) setStep("CHANGE_PASSWORD_FIRST_TIME")
      else if (result.accessToken) {
        saveSession(result.accessToken, result.user)
        router.push(result.user?.role === "STUDENT" ? "/demo/student" : result.user?.role === "ADMIN" ? "/demo/admin" : "/demo/MOD")
      }
    } catch {
      setLoginError("Mã số sinh viên (MSSV) hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.")
    }
  }

  // Xử lý đăng nhập Cán bộ / Quản trị (MOD / Admin)
  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setStaffError("")

    if (!staffEmail.trim()) {
      setStaffError("Vui lòng nhập email cán bộ / quản trị.")
      return
    }

    if (!staffPassword) {
      setStaffError("Vui lòng nhập mật khẩu.")
      return
    }

    const emailLower = staffEmail.trim().toLowerCase()

    try {
      const result = await login({ email: emailLower }, staffPassword)
      if (result.accessToken) {
        saveSession(result.accessToken, result.user)
        router.push(result.user?.role === "ADMIN" ? "/demo/admin" : "/demo/MOD")
      }
    } catch {
      setStaffError("Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.")
    }
  }

  // Xử lý đổi mật khẩu lần đầu
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")

    if (newPassword.length < 6) {
      setPasswordError("Mật khẩu mới phải có tối thiểu 6 ký tự.")
      return
    }

    if (isDefaultPassword(newPassword)) {
      setPasswordError("Mật khẩu mới không được trùng hoặc dùng cấu trúc mật khẩu mặc định ban đầu.")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Xác nhận mật khẩu mới không khớp.")
      return
    }

    try {
      const result = await changeFirstPassword(studentId.trim(), newPassword, confirmPassword)
      if (result.schoolEmail) {
        setTargetEmail(result.schoolEmail)
      }
      setStep("VERIFY_EMAIL")
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Không thể đổi mật khẩu.")
    }
  }

  // Xử lý xác nhận OTP email trường
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setOtpError("")

    if (otp.trim().length !== 6) {
      setOtpError("Vui lòng nhập đúng mã xác nhận gồm 6 chữ số.")
      return
    }

    try {
      const result = await verifyOtp(studentId.trim(), otp.trim())
      if (result.accessToken) {
        saveSession(result.accessToken, result.user)
        setStep("SUCCESS")
        setTimeout(() => router.push("/demo/student"), 500)
      }
    } catch (error) {
      setOtpError(error instanceof Error ? error.message : "Mã OTP không hợp lệ.")
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-canvas">
      {/* Cột trái - Thương hiệu GDU */}
      <div className="hidden md:flex md:w-1/2 bg-primary relative overflow-hidden flex-col justify-between p-10 lg:p-14">
        <div className="absolute inset-0 bg-[url('/img/banner.jpg')] bg-cover bg-center opacity-25 mix-blend-luminosity"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/85 to-primary/40"></div>
        
        <div className="relative z-10 flex items-center gap-3">
          <Image 
            src="/img/gdu-logo.png" 
            alt="GDU Logo" 
            width={240} 
            height={80} 
            className="h-auto w-auto max-h-16 object-contain drop-shadow" 
            priority
          />
        </div>
        
        <div className="relative z-10 max-w-lg my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 border border-accent/30 text-accent text-[12px] font-bold uppercase tracking-wider mb-4">
            Cổng Thông Tin Sinh Viên GDU
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">
            Hệ thống Quản lý Sự kiện & Điểm Rèn luyện
          </h1>
          <p className="text-white/80 text-[15px] lg:text-[16px] leading-relaxed">
            Khám phá các hoạt động học thuật, kỹ năng mềm, tình nguyện và theo dõi điểm rèn luyện tích lũy liên tục trong suốt 3 năm học.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
            <div>
              <p className="text-white/60 text-[12px] uppercase tracking-wide">Quy định rèn luyện</p>
              <p className="text-white font-semibold text-[14px] mt-0.5">QĐ 251/2023/GDU/QĐ-HT</p>
            </div>
            <div>
              <p className="text-white/60 text-[12px] uppercase tracking-wide">Chu kỳ tích lũy</p>
              <p className="text-white font-semibold text-[14px] mt-0.5">3 Năm Liên Tục</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-white/50 text-[12px]">
          © {new Date().getFullYear()} Trường Đại học Gia Định (GDU). Tất cả quyền được bảo lưu.
        </div>
      </div>

      {/* Cột phải - Các bước Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-10 lg:p-14 relative bg-surface">
        <div className="w-full max-w-md flex flex-col gap-6">
          
          {/* Logo Mobile */}
          <div className="md:hidden flex items-center justify-center mb-2">
            <Image 
              src="/img/logo-chinh.png" 
              alt="GDU Logo" 
              width={190} 
              height={60} 
              className="w-[190px] max-w-[190px] h-auto object-contain" 
              priority
            />
          </div>

          {/* ==================== BƯỚC 1: ĐĂNG NHẬP ==================== */}
          {step === "LOGIN" && (
            <div className="flex flex-col gap-5 animate-in fade-in duration-300">
              {/* Tab chuyển đổi đối tượng: Sinh viên vs Cán bộ / Quản trị */}
              <div className="grid grid-cols-2 p-1 bg-canvas border border-border rounded-xl text-[13px] font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setRoleTab("STUDENT")
                    setLoginError("")
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all ${
                    roleTab === "STUDENT"
                      ? "bg-surface text-primary shadow-sm border border-border/70 font-bold"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  <GraduationCap className="h-4 w-4" />
                  <span>Sinh viên</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRoleTab("STAFF")
                    setStaffError("")
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all ${
                    roleTab === "STAFF"
                      ? "bg-surface text-primary shadow-sm border border-border/70 font-bold"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  <span>Cán bộ / Quản trị</span>
                </button>
              </div>

              {/* ========== GIAO DIỆN ĐĂNG NHẬP SINH VIÊN ========== */}
              {roleTab === "STUDENT" && (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1 text-center md:text-left">
                    <h2 className="text-2xl font-bold text-ink tracking-tight">Đăng nhập Sinh viên</h2>
                    <p className="text-body text-[13.5px]">
                      Sử dụng <strong>Mã số sinh viên (MSSV)</strong> được cấp để đăng nhập.
                    </p>
                  </div>

                  {loginError && (
                    <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-[13px] flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12.5px] font-semibold text-ink uppercase tracking-wide">
                        Mã số sinh viên (MSSV) <span className="text-error">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        placeholder="Nhập mã số sinh viên" 
                        className="flex h-11 w-full rounded-xl border border-border bg-canvas px-4 text-[14.5px] font-medium placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-ink"
                        autoFocus
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[12.5px] font-semibold text-ink uppercase tracking-wide">
                          Mật khẩu <span className="text-error">*</span>
                        </label>
                        <span className="text-[11.5px] text-muted">
                          Mẫu: <strong className="text-primary font-mono">GDU@TENddmm</strong>
                        </span>
                      </div>
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••" 
                          className="flex h-11 w-full rounded-xl border border-border bg-canvas px-4 pr-11 text-[14.5px] placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-ink"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink focus:outline-none p-1"
                          tabIndex={-1}
                          aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Hướng dẫn mật khẩu mặc định */}
                    <div className="p-3 bg-primary-soft/60 rounded-xl border border-primary/20 text-[12px] text-primary flex items-start gap-2.5">
                      <KeyRound className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                      <div className="leading-relaxed">
                        <span className="font-semibold">Mật khẩu lần đầu:</span> Cấu trúc theo quy định trường là <span className="font-mono font-bold bg-white/70 px-1.5 py-0.5 rounded text-primary">GDU@ + TEN(không dấu) + NgàyThángSinh</span>. Đăng nhập lần đầu hệ thống sẽ yêu cầu đổi mật khẩu và kích hoạt qua email trường.
                      </div>
                    </div>

                    <Button type="submit" className="h-11 w-full font-bold text-[14.5px] group bg-primary hover:bg-primary-hover mt-1 rounded-xl">
                      Đăng nhập Sinh viên
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </form>
                </div>
              )}

              {/* ========== GIAO DIỆN ĐĂNG NHẬP CÁN BỘ / MOD / ADMIN ========== */}
              {roleTab === "STAFF" && (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1 text-center md:text-left">
                    <h2 className="text-2xl font-bold text-ink tracking-tight">Đăng nhập Cán bộ / Quản trị</h2>
                    <p className="text-body text-[13.5px]">
                      Dành cho <strong>Ban tổ chức sự kiện (MOD)</strong> và <strong>Quản trị viên (Admin)</strong>.
                    </p>
                  </div>

                  {staffError && (
                    <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-[13px] flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 shrink-0" />
                      <span>{staffError}</span>
                    </div>
                  )}

                  <form onSubmit={handleStaffLogin} className="flex flex-col gap-3.5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12.5px] font-semibold text-ink uppercase tracking-wide">
                        Email cán bộ / trường <span className="text-error">*</span>
                      </label>
                      <input 
                        type="email" 
                        value={staffEmail}
                        onChange={(e) => setStaffEmail(e.target.value)}
                        placeholder="Nhập email cán bộ hoặc quản trị viên" 
                        className="flex h-11 w-full rounded-xl border border-border bg-canvas px-4 text-[14.5px] font-medium placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-ink"
                        autoFocus
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12.5px] font-semibold text-ink uppercase tracking-wide">
                        Mật khẩu <span className="text-error">*</span>
                      </label>
                      <div className="relative">
                        <input 
                          type={showStaffPassword ? "text" : "password"} 
                          value={staffPassword}
                          onChange={(e) => setStaffPassword(e.target.value)}
                          placeholder="••••••••" 
                          className="flex h-11 w-full rounded-xl border border-border bg-canvas px-4 pr-11 text-[14.5px] placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-ink"
                        />
                        <button
                          type="button"
                          onClick={() => setShowStaffPassword(!showStaffPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink focus:outline-none p-1"
                          tabIndex={-1}
                          aria-label={showStaffPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                        >
                          {showStaffPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" className="h-11 w-full font-bold text-[14.5px] group bg-primary hover:bg-primary-hover mt-1 rounded-xl">
                      Đăng nhập
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* ==================== BƯỚC 2: ĐỔI MẬT KHẨU LẦN ĐẦU ==================== */}
          {step === "CHANGE_PASSWORD_FIRST_TIME" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setStep("LOGIN")}
                  className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-muted hover:text-ink hover:bg-canvas transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-ink">Thiết lập mật khẩu lần đầu</h2>
                  <p className="text-[13px] text-muted">MSSV: <strong className="text-ink">{studentId}</strong></p>
                </div>
              </div>

              {/* Hộp cảnh báo lần đầu */}
              <div className="p-3.5 rounded-xl bg-warning/10 border border-warning/30 text-warning text-[13px] flex items-start gap-2.5">
                <Lock className="h-4 w-4 shrink-0 mt-0.5 text-warning" />
                <div className="leading-relaxed">
                  <strong>Phát hiện lần đầu đăng nhập!</strong> Bạn đang sử dụng mật khẩu mặc định của trường. Vì lý do bảo mật, bạn bắt buộc phải tạo mật khẩu mới.
                </div>
              </div>

              {passwordError && (
                <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-[13px] flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-ink uppercase tracking-wide">
                    Mật khẩu mới <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      type={showNewPassword ? "text" : "password"} 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự..." 
                      className="flex h-12 w-full rounded-xl border border-border bg-canvas px-4 pr-11 text-[15px] placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-ink"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink focus:outline-none p-1"
                      tabIndex={-1}
                      aria-label={showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-ink uppercase tracking-wide">
                    Xác nhận mật khẩu mới <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới..." 
                      className="flex h-12 w-full rounded-xl border border-border bg-canvas px-4 pr-11 text-[15px] placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-ink"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink focus:outline-none p-1"
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="h-12 w-full font-bold text-[15px] bg-primary hover:bg-primary-hover rounded-xl mt-2">
                  Tiếp tục xác thực email trường
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </div>
          )}

          {/* ==================== BƯỚC 3: XÁC THỰC QUA EMAIL TRƯỜNG ==================== */}
          {step === "VERIFY_EMAIL" && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setStep("CHANGE_PASSWORD_FIRST_TIME")}
                  className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-muted hover:text-ink hover:bg-canvas transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-ink">Xác thực hòm thư trường</h2>
                  <p className="text-[13px] text-muted">Kích hoạt tài khoản chính thức</p>
                </div>
              </div>

              {/* Thông báo gửi email */}
              <div className="p-4 rounded-xl bg-primary-soft border border-primary/20 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-primary font-bold text-[14px]">
                  <Mail className="h-4 w-4" />
                  Mã xác nhận đã gửi đến email trường:
                </div>
                <div className="font-mono font-bold text-ink bg-surface px-3 py-2 rounded-lg border border-border text-[14px] break-all">
                  {targetEmail || "Email sinh viên liên kết trong hệ thống"}
                </div>
                <p className="text-[12px] text-muted mt-0.5">
                  Vui lòng mở hòm thư điện tử sinh viên của bạn để lấy mã xác thực 6 chữ số kích hoạt tài khoản.
                </p>
              </div>

              {otpError && (
                <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-[13px] flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[13px] font-semibold text-ink uppercase tracking-wide">
                      Mã xác nhận (OTP) <span className="text-error">*</span>
                    </label>
                  </div>
                  <input 
                    type="text" 
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="Nhập mã OTP 6 chữ số" 
                    className="flex h-14 w-full rounded-xl border border-border bg-canvas px-4 text-center font-mono text-2xl tracking-[0.4em] font-bold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-ink"
                    autoFocus
                  />
                </div>

                <Button type="submit" className="h-12 w-full font-bold text-[15px] bg-primary hover:bg-primary-hover rounded-xl mt-2">
                  Xác nhận & Kích hoạt tài khoản
                  <CheckCircle2 className="ml-2 h-4 w-4" />
                </Button>

              </form>
            </div>
          )}

          {/* ==================== BƯỚC 4: THÀNH CÔNG ==================== */}
          {step === "SUCCESS" && (
            <div className="flex flex-col items-center text-center gap-4 py-8 animate-in zoom-in-95 duration-500">
              <div className="h-20 w-20 rounded-full bg-success/10 text-success flex items-center justify-center shadow-inner">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-ink">Kích hoạt thành công!</h3>
                <p className="text-[14px] text-muted mt-1 max-w-xs">
                  Mật khẩu mới đã được cập nhật. Đang tự động chuyển hướng vào Cổng thông tin Sinh viên...
                </p>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mt-4"></div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
