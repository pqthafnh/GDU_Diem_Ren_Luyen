"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  Save, 
  Send, 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Award, 
  CheckCircle2, 
  ThumbsUp, 
  Share2, 
  MessageCircle, 
  Sparkles,
  Layers,
  Globe
} from "lucide-react"
import { EventType, InteractiveAction } from "@/types"

export default function MODNewEventPage() {
  const router = useRouter()
  const [eventType, setEventType] = useState<EventType>("standard")
  const [template, setTemplate] = useState("")

  // Form states
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("Hội thảo")
  const [organizer, setOrganizer] = useState("Khoa CNTT")
  const [startTime, setStartTime] = useState("2026-10-20T08:00")
  const [endTime, setEndTime] = useState("2026-10-25T22:00")
  const [location, setLocation] = useState("Hội trường A, cơ sở Tân Sơn Nhất")
  const [capacity, setCapacity] = useState(100)
  const [points, setPoints] = useState(5)
  const [gpsRequired, setGpsRequired] = useState(true)

  // Interactive Event specific states
  const [facebookPostUrl, setFacebookPostUrl] = useState("")
  const [actions, setActions] = useState<InteractiveAction[]>([
    {
      id: "act-like",
      type: "like",
      label: "Like / Thả cảm xúc bài viết",
      description: "Thả cảm xúc (Like hoặc Love) tại bài viết chỉ định trên Fanpage Đại học Gia Định",
      points: 1,
    },
    {
      id: "act-share",
      type: "share",
      label: "Chia sẻ bài viết công khai",
      description: "Chia sẻ bài viết về trang cá nhân ở chế độ Công khai kèm hashtag #GDU_K18 #GiaDinhUniversity",
      points: 1,
    },
    {
      id: "act-comment",
      type: "comment",
      label: "Bình luận gắn thẻ 3 bạn bè",
      description: "Để lại bình luận chào mừng năm học mới và gắn thẻ (tag) ít nhất 3 bạn sinh viên",
      points: 1,
    },
  ])

  // Notification state
  const [successModal, setSuccessModal] = useState<{ open: boolean; title: string; message: string } | null>(null)

  // Calculate total points for interactive event
  const totalInteractivePoints = actions.reduce((sum, act) => sum + (Number(act.points) || 1), 0)

  // Handle template selection
  const handleTemplateChange = (val: string) => {
    setTemplate(val)
    if (val === "interactive-fb") {
      setEventType("interactive")
      setTitle("Chiến dịch Tương tác Fanpage: Lan tỏa Chào đón Tân sinh viên K18")
      setDescription("Chiến dịch truyền thông số nhằm lan tỏa năng lượng tích cực và thông điệp chào đón K18 đến cộng đồng sinh viên. Hoàn thành đầy đủ 3 hoạt động để nhận 3 điểm rèn luyện.")
      setCategory("Tương tác")
      setOrganizer("Ban Truyền thông & Tuyển sinh GDU")
      setFacebookPostUrl("https://www.facebook.com/GiaDinhUniversity/posts/pfbid02V9xk7m8L3b4q")
      setLocation("Trực tuyến (Fanpage Facebook GDU)")
      setCapacity(2000)
      setPoints(3)
      setActions([
        {
          id: "act-1",
          type: "like",
          label: "Like / Thả cảm xúc bài viết",
          description: "Bấm Thích hoặc Thả tim bài viết chào đón K18 trên Fanpage",
          points: 1,
        },
        {
          id: "act-2",
          type: "share",
          label: "Chia sẻ bài viết ở chế độ Công khai",
          description: "Chia sẻ về trang cá nhân Facebook kèm hashtag #GDU_K18 #GiaDinhUniversity",
          points: 1,
        },
        {
          id: "act-3",
          type: "comment",
          label: "Bình luận gắn thẻ 3 người bạn & gửi lời chúc",
          description: "Để lại bình luận chào đón năm học mới và tag ít nhất 3 bạn sinh viên",
          points: 1,
        },
      ])
    } else if (val === "seminar") {
      setEventType("standard")
      setTitle("Hội thảo Kỹ năng phỏng vấn và Chinh phục Nhà tuyển dụng")
      setDescription("Học hỏi kỹ năng viết CV chuyên nghiệp và phương pháp trả lời phỏng vấn chuẩn doanh nghiệp.")
      setCategory("Kỹ năng mềm")
      setOrganizer("Phòng Công tác sinh viên")
      setLocation("Phòng A.805, cơ sở Tân Sơn Nhất")
      setCapacity(100)
      setPoints(5)
    } else if (val === "volunteer") {
      setEventType("standard")
      setTitle("Chiến dịch Tình nguyện Tiếp sức Mùa thi 2026")
      setDescription("Hỗ trợ thí sinh và phụ huynh tại các điểm thi tốt nghiệp THPT.")
      setCategory("Tình nguyện")
      setOrganizer("Đoàn Thanh niên GDU")
      setLocation("Cơ sở Tân Sơn Nhất")
      setCapacity(50)
      setPoints(10)
    }
  }

  // Add new interactive action
  const handleAddAction = () => {
    const newId = `act-${Date.now()}`
    setActions([
      ...actions,
      {
        id: newId,
        type: "custom",
        label: "Hành động tương tác mới",
        description: "Mô tả chi tiết hành động người dùng cần làm...",
        points: 1,
      },
    ])
  }

  // Remove interactive action
  const handleRemoveAction = (id: string) => {
    if (actions.length <= 1) return
    setActions(actions.filter(a => a.id !== id))
  }

  // Update action field
  const handleUpdateAction = (id: string, field: keyof InteractiveAction, value: any) => {
    setActions(actions.map(a => a.id === id ? { ...a, [field]: value } : a))
  }

  // Submit action
  const handleSubmit = (isDraft: boolean) => {
    setSuccessModal({
      open: true,
      title: isDraft ? "Đã lưu bản nháp" : "Đã gửi Admin xét duyệt",
      message: isDraft 
        ? `Sự kiện "${title || 'Mới'}" đã được lưu vào danh sách bản nháp của MOD.`
        : `Sự kiện "${title || 'Mới'}" (${eventType === "interactive" ? "Sự kiện Tương tác Facebook" : "Sự kiện Tiêu chuẩn"}) đã được chuyển tới Admin để phê duyệt công khai.`
    })
  }

  return (
    <div className="container py-6 flex flex-col gap-6 max-w-4xl mx-auto pb-24">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <Link href="/demo/MOD/events">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted hover:text-ink">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-ink tracking-tight">Tạo sự kiện mới</h1>
            <p className="text-[13px] text-muted mt-0.5">
              MOD cấu hình nội dung và gửi Admin kiểm duyệt theo thẩm quyền.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select 
            value={template}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="h-9.5 px-3 text-[13px] bg-canvas border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-ink"
          >
            <option value="">-- Dùng cấu hình mẫu --</option>
            <option value="interactive-fb">⭐ Chiến dịch tương tác Facebook (Like/Share/Comment - 3đ)</option>
            <option value="seminar">Hội thảo tiêu chuẩn (100SV, 5đ)</option>
            <option value="volunteer">Hoạt động tình nguyện (50SV, 10đ)</option>
          </select>

          <Button 
            variant="outline" 
            onClick={() => handleSubmit(true)}
            className="h-9.5 text-[13px] px-3.5 rounded-xl border-border hover:bg-canvas"
          >
            <Save className="h-3.5 w-3.5 mr-1.5 text-muted" /> 
            Lưu nháp
          </Button>

          <Button 
            variant="primary" 
            onClick={() => handleSubmit(false)}
            className="h-9.5 text-[13px] px-4 rounded-xl shadow-sm"
          >
            <Send className="h-3.5 w-3.5 mr-1.5" /> 
            Gửi duyệt
          </Button>
        </div>
      </header>

      {/* EVENT TYPE SELECTOR */}
      <div className="bg-surface border border-border rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
            <Layers className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="font-bold text-ink text-[14.5px]">Chọn hình thức tổ chức</span>
            <p className="text-[12px] text-muted">Lựa chọn loại sự kiện phù hợp để hệ thống hiển thị cấu hình tương ứng</p>
          </div>
        </div>

        <div className="flex rounded-xl bg-canvas p-1 border border-border/80 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setEventType("standard")
              setCategory("Hội thảo")
            }}
            className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${
              eventType === "standard"
                ? "bg-surface text-primary shadow-sm"
                : "text-muted hover:text-ink"
            }`}
          >
            Sự kiện tiêu chuẩn (Offline)
          </button>
          <button
            type="button"
            onClick={() => {
              setEventType("interactive")
              setCategory("Tương tác")
              setLocation("Trực tuyến (Fanpage Facebook GDU)")
              setPoints(3)
            }}
            className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all flex items-center gap-1.5 ${
              eventType === "interactive"
                ? "bg-[#1877F2] text-white shadow-sm"
                : "text-muted hover:text-[#1877F2]"
            }`}
          >
            <span>Sự kiện tương tác (Facebook)</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">3đ</span>
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Cột trái: Form thông tin chính */}
        <div className="md:col-span-2 flex flex-col gap-6">

          {/* BLOCK 1: Thông tin cơ bản */}
          <div className="bg-surface border border-border rounded-2xl p-5 md:p-6 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <h2 className="text-[14px] font-bold text-ink uppercase tracking-wider flex items-center gap-2">
                <span>Thông tin cơ bản</span>
                {eventType === "interactive" && (
                  <span className="text-[11px] font-semibold text-[#1877F2] bg-[#1877F2]/10 px-2 py-0.5 rounded-full lowercase">
                    loại tương tác
                  </span>
                )}
              </h2>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-ink">
                Tên sự kiện / Chiến dịch <span className="text-error">*</span>
              </label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-10 px-3.5 text-[13.5px] bg-canvas border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-ink" 
                placeholder={eventType === "interactive" ? "Ví dụ: Chiến dịch Tương tác Fanpage: Lan tỏa Chào đón K18..." : "Nhập tên sự kiện..."} 
              />
            </div>

            {/* IF INTERACTIVE: LINK BÀI VIẾT FACEBOOK */}
            {eventType === "interactive" && (
              <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-[#1877F2]/5 border border-[#1877F2]/20">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-bold text-ink flex items-center gap-2">
                    <span className="h-5 w-5 rounded bg-[#1877F2] text-white flex items-center justify-center font-bold text-xs">f</span>
                    <span>Link bài viết Facebook cần tương tác <span className="text-error">*</span></span>
                  </label>
                  <span className="text-[11px] font-medium text-[#1877F2]">Bắt buộc</span>
                </div>
                <input 
                  type="url" 
                  value={facebookPostUrl}
                  onChange={(e) => setFacebookPostUrl(e.target.value)}
                  className="w-full h-10 px-3.5 text-[13.5px] bg-surface border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1877F2] focus:border-[#1877F2] text-ink font-mono" 
                  placeholder="https://www.facebook.com/GiaDinhUniversity/posts/..." 
                />
                <span className="text-[11.5px] text-muted">
                  Dán liên kết chính xác của bài viết trên Fanpage Đại học Gia Định để sinh viên truy cập và đối soát tương tác.
                </span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-ink">Phần mô tả sự kiện</label>
              <textarea 
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3.5 text-[13.5px] bg-canvas border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none text-ink leading-relaxed" 
                placeholder={eventType === "interactive" ? "Nhập thông điệp chiến dịch, yêu cầu tham gia và cách thức đối soát điểm..." : "Nhập mô tả sự kiện chi tiết..."} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-ink">Danh mục <span className="text-error">*</span></label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 text-[13px] bg-canvas border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-ink"
                >
                  <option value="Tương tác">Tương tác</option>
                  <option value="Học thuật">Học thuật</option>
                  <option value="Ngoại khóa">Ngoại khóa</option>
                  <option value="Thi đấu">Thi đấu</option>
                  <option value="Hội thảo">Hội thảo</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Kỹ năng mềm">Kỹ năng mềm</option>
                  <option value="Tình nguyện">Tình nguyện</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-ink">Đơn vị tổ chức</label>
                <input 
                  type="text" 
                  value={organizer}
                  onChange={(e) => setOrganizer(e.target.value)}
                  className="w-full h-10 px-3 text-[13.5px] bg-canvas border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-ink" 
                  placeholder="Ví dụ: Ban Truyền thông & Tuyển sinh" 
                />
              </div>
            </div>
          </div>

          {/* BLOCK 2: IF INTERACTIVE -> DANH SÁCH CÁC HÀNH ĐỘNG NGƯỜI DÙNG CẦN LÀM */}
          {eventType === "interactive" ? (
            <div className="bg-surface border border-border rounded-2xl p-5 md:p-6 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <div>
                  <h2 className="text-[14px] font-bold text-ink uppercase tracking-wider flex items-center gap-2">
                    <span>Danh sách hành động cần làm</span>
                    <span className="text-[11.5px] font-semibold text-primary bg-primary-soft px-2 py-0.5 rounded-full">
                      {actions.length} hành động
                    </span>
                  </h2>
                  <p className="text-[12px] text-muted mt-0.5">
                    Cấu hình các hành động bắt buộc trên bài viết Facebook. Mặc định <strong>3 điểm rèn luyện</strong> (mỗi điểm cho 1 hoạt động).
                  </p>
                </div>

                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleAddAction}
                  className="h-8 text-[12px] px-2.5 rounded-lg border-border gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Thêm hành động</span>
                </Button>
              </div>

              {/* Action items list */}
              <div className="flex flex-col gap-3">
                {actions.map((act, index) => (
                  <div key={act.id} className="p-4 rounded-xl bg-canvas border border-border/80 flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-primary text-white text-[12px] font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <select 
                          value={act.type}
                          onChange={(e) => handleUpdateAction(act.id, "type", e.target.value)}
                          className="h-8 px-2.5 text-[12.5px] font-semibold bg-surface border border-border rounded-lg text-ink"
                        >
                          <option value="like">Like / Thả cảm xúc</option>
                          <option value="share">Chia sẻ bài viết công khai</option>
                          <option value="comment">Bình luận gắn thẻ bạn bè</option>
                          <option value="custom">Hành động khác</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-accent-soft text-primary px-2.5 py-1 rounded-lg border border-accent/20 text-[12px] font-bold">
                          <span>+</span>
                          <input 
                            type="number"
                            min="1"
                            max="5"
                            value={act.points}
                            onChange={(e) => handleUpdateAction(act.id, "points", parseInt(e.target.value) || 1)}
                            className="w-8 h-5 text-center bg-transparent border-b border-primary/40 font-bold focus:outline-none"
                          />
                          <span>điểm</span>
                        </div>

                        {actions.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => handleRemoveAction(act.id)}
                            className="h-7 w-7 rounded-lg text-muted hover:text-error hover:bg-error/10 flex items-center justify-center transition-colors"
                            title="Xóa hành động"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <input 
                        type="text"
                        value={act.label}
                        onChange={(e) => handleUpdateAction(act.id, "label", e.target.value)}
                        placeholder="Tiêu đề hành động..."
                        className="h-9 px-3 text-[13px] font-semibold bg-surface border border-border rounded-lg text-ink focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <input 
                        type="text"
                        value={act.description || ""}
                        onChange={(e) => handleUpdateAction(act.id, "description", e.target.value)}
                        placeholder="Hướng dẫn chi tiết (ví dụ: gắn kèm hashtag #GDU_K18)..."
                        className="h-8 px-3 text-[12.5px] bg-surface border border-border rounded-lg text-body focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary of points */}
              <div className="p-3.5 rounded-xl bg-primary-soft/50 border border-primary/20 flex items-center justify-between text-[13px]">
                <span className="text-muted font-medium">Tổng điểm rèn luyện chiến dịch:</span>
                <span className="text-primary font-bold text-[15px] flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-accent" />
                  +{totalInteractivePoints} điểm rèn luyện
                </span>
              </div>
            </div>
          ) : (
            /* IF STANDARD: Thời gian & Địa điểm chuẩn */
            <div className="bg-surface border border-border rounded-2xl p-5 md:p-6 flex flex-col gap-4 shadow-sm">
              <h2 className="text-[14px] font-bold text-ink uppercase tracking-wider border-b border-border/80 pb-3">
                Thời gian & Địa điểm
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-ink">Bắt đầu <span className="text-error">*</span></label>
                  <input 
                    type="datetime-local" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full h-10 px-3 text-[13px] bg-canvas border border-border rounded-xl focus:outline-none focus:ring-1 focus:border-primary text-ink" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-ink">Kết thúc <span className="text-error">*</span></label>
                  <input 
                    type="datetime-local" 
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full h-10 px-3 text-[13px] bg-canvas border border-border rounded-xl focus:outline-none focus:ring-1 focus:border-primary text-ink" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-ink">Địa điểm tổ chức <span className="text-error">*</span></label>
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full h-10 px-3.5 text-[13.5px] bg-canvas border border-border rounded-xl focus:outline-none focus:ring-1 focus:border-primary text-ink" 
                  placeholder="Ví dụ: Hội trường A, cơ sở Tân Sơn Nhất" 
                />
              </div>
            </div>
          )}

          {/* IF INTERACTIVE: Thời gian chiến dịch */}
          {eventType === "interactive" && (
            <div className="bg-surface border border-border rounded-2xl p-5 md:p-6 flex flex-col gap-4 shadow-sm">
              <h2 className="text-[14px] font-bold text-ink uppercase tracking-wider border-b border-border/80 pb-3">
                Thời hạn chiến dịch
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-ink">Ngày bắt đầu tương tác <span className="text-error">*</span></label>
                  <input 
                    type="datetime-local" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full h-10 px-3 text-[13px] bg-canvas border border-border rounded-xl focus:outline-none focus:ring-1 focus:border-primary text-ink" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-ink">Ngày kết thúc chiến dịch <span className="text-error">*</span></label>
                  <input 
                    type="datetime-local" 
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full h-10 px-3 text-[13px] bg-canvas border border-border rounded-xl focus:outline-none focus:ring-1 focus:border-primary text-ink" 
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Cột phải: Cấu hình tham gia & Banner */}
        <div className="flex flex-col gap-6">

          {/* Cấu hình tham gia */}
          <div className="bg-surface border border-border rounded-2xl p-5 md:p-6 flex flex-col gap-4 shadow-sm">
            <h2 className="text-[14px] font-bold text-ink uppercase tracking-wider border-b border-border/80 pb-3">
              Cấu hình tham gia
            </h2>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-ink">Điểm rèn luyện <span className="text-error">*</span></label>
              <div className="relative">
                <input 
                  type="number" 
                  disabled={eventType === "interactive"}
                  value={eventType === "interactive" ? totalInteractivePoints : points}
                  onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                  className="w-full h-10 px-3.5 text-[13.5px] bg-canvas border border-border rounded-xl focus:outline-none focus:ring-1 focus:border-primary text-ink font-bold" 
                />
                <span className="absolute right-3.5 top-2.5 text-[12px] text-muted font-medium">điểm</span>
              </div>
              <span className="text-[11.5px] text-muted">
                {eventType === "interactive" 
                  ? "Tự động tính theo tổng điểm các hành động tương tác." 
                  : "Số điểm sinh viên nhận được khi tham dự."}
              </span>
            </div>

            {eventType === "standard" ? (
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-ink">Sức chứa tối đa <span className="text-error">*</span></label>
                <input 
                  type="number" 
                  value={capacity}
                  onChange={(e) => setCapacity(parseInt(e.target.value) || 100)}
                  className="w-full h-10 px-3.5 text-[13.5px] bg-canvas border border-border rounded-xl focus:outline-none focus:ring-1 focus:border-primary text-ink" 
                />
                <span className="text-[11.5px] text-muted">Số lượng vé phát hành cho sinh viên.</span>
              </div>
            ) : (
              <div className="p-3.5 bg-canvas rounded-xl border border-border/70 text-[12.5px] flex flex-col gap-1">
                <span className="font-semibold text-ink flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-success"></span>
                  Không giới hạn & Không phát hành vé
                </span>
                <span className="text-muted leading-relaxed">
                  Sự kiện tương tác trực tuyến không cần vé tham dự. Mọi sinh viên đều có thể tham gia tương tác trên Fanpage để tích điểm.
                </span>
              </div>
            )}

            {/* GPS check-in (Chỉ áp dụng sự kiện tiêu chuẩn) */}
            {eventType === "standard" ? (
              <div className="flex flex-col gap-1.5 pt-2 border-t border-border/80">
                <label className="text-[13px] font-semibold text-ink">Cấu hình GPS (100m)</label>
                <label className="flex items-center gap-2.5 mt-1 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={gpsRequired}
                    onChange={(e) => setGpsRequired(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary" 
                  />
                  <span className="text-[13px] text-body">Bắt buộc quét QR tại bán kính 100m</span>
                </label>
              </div>
            ) : (
              <div className="p-3 bg-canvas rounded-xl border border-border/70 text-[12px] text-muted flex items-start gap-2">
                <Globe className="h-4 w-4 text-[#1877F2] shrink-0 mt-0.5" />
                <p>Chiến dịch tương tác trực tuyến qua Facebook, không áp dụng điểm danh GPS.</p>
              </div>
            )}
          </div>

          {/* Banner sự kiện */}
          <div className="bg-surface border border-border rounded-2xl p-5 md:p-6 flex flex-col gap-4 shadow-sm">
            <h2 className="text-[14px] font-bold text-ink uppercase tracking-wider border-b border-border/80 pb-3">
              Banner sự kiện
            </h2>
            <div className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-border rounded-xl bg-canvas hover:bg-canvas-soft transition-colors cursor-pointer group">
              <div className="h-10 w-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-[13px] text-primary font-semibold">Tải ảnh banner lên</span>
              <span className="text-[11.5px] text-muted mt-0.5">PNG, JPG (Tỷ lệ 16:9, tối đa 5MB)</span>
            </div>
          </div>

        </div>
      </div>

      {/* Success Modal */}
      {successModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-2xl border border-border p-6 max-w-md w-full shadow-2xl flex flex-col items-center text-center gap-3 animate-in fade-in zoom-in-95">
            <div className="h-14 w-14 rounded-full bg-success/10 text-success flex items-center justify-center mb-1">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-ink">{successModal.title}</h3>
            <p className="text-[13.5px] text-body leading-relaxed">
              {successModal.message}
            </p>
            <div className="flex items-center gap-3 w-full mt-3">
              <Button 
                variant="outline" 
                onClick={() => setSuccessModal(null)}
                className="flex-1 h-10 rounded-xl text-[13px]"
              >
                Tiếp tục sửa
              </Button>
              <Button 
                variant="primary" 
                onClick={() => router.push("/demo/MOD/events")}
                className="flex-1 h-10 rounded-xl text-[13px]"
              >
                Về danh sách
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
