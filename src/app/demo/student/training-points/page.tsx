import Image from "next/image"
import { MOCK_STUDENT, MOCK_TRAINING_POINTS } from "@/mocks"
import { Award, TrendingUp, Calendar as CalendarIcon, Filter, CheckCircle2, Medal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"

export default function StudentTrainingPointsPage() {
  return (
    <div className="container py-6 flex flex-col gap-6">
      <div className="flex flex-col gap-2 border-b border-border pb-3">
        <h1 className="text-xl font-bold text-ink">Điểm rèn luyện</h1>
        <p className="text-[14px] text-body">Theo dõi điểm rèn luyện tích lũy trong toàn bộ chu kỳ 3 năm.</p>
      </div>

      {/* Student Profile Card */}
      <section className="relative overflow-hidden bg-primary rounded-2xl p-6 md:p-8 flex items-center shadow-sm">
        <div className="relative z-10 flex items-center gap-4 md:gap-5">
          <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-white text-primary flex items-center justify-center font-bold text-[20px] md:text-[24px] shadow-sm shrink-0">
            {MOCK_STUDENT.fullName.charAt(0)}
          </div>
          <div className="flex flex-col">
            <h1 className="text-[18px] md:text-[20px] font-bold text-white tracking-tight">{MOCK_STUDENT.fullName}</h1>
            <p className="text-[14px] text-white/80 mt-1 flex flex-col max-[430px]:items-start min-[431px]:flex-row min-[431px]:items-center">
              <span>MSSV: {MOCK_STUDENT.studentId}</span>
              <span className="hidden min-[431px]:inline mx-2 text-white/40">•</span>
              <span>{MOCK_STUDENT.major}</span>
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2 rounded-[16px] p-6 md:p-8 flex flex-col relative overflow-hidden shadow-[0_8px_30px_rgb(23,58,103,0.15)] border border-[#315781]/50">
          {/* Background & Material */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#173A67] to-[#102B4D] z-0"></div>
          
          {/* Faint blue light at one corner */}
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#5B9BFF]/15 blur-3xl rounded-full pointer-events-none z-0"></div>
          
          {/* Low contrast geometric line/arc */}
          <div className="absolute right-[-40px] bottom-[-20px] w-48 h-48 border border-[#5B9BFF]/10 rounded-full pointer-events-none z-0"></div>
          <div className="absolute left-0 top-1/2 w-full h-px bg-gradient-to-r from-transparent via-[#5B9BFF]/10 to-transparent pointer-events-none z-0"></div>

          {/* Header */}
          <div className="relative z-10 flex justify-between items-start mb-6">
            <h2 className="text-[11px] font-semibold text-[#B9CBE0] uppercase tracking-[0.15em]">
              Tổng điểm rèn luyện
            </h2>
            <div className="h-9 w-9 rounded-full border border-[#315781] flex items-center justify-center bg-[#102B4D]/50 shadow-sm">
              <Award className="h-4 w-4 text-[#5B9BFF]" />
            </div>
          </div>

          {/* Center */}
          <div className="relative z-10 flex flex-col mb-8">
            <div className="flex items-baseline gap-1.5">
              <span className="text-6xl md:text-7xl font-bold text-[#FFFFFF] tracking-tight">
                {MOCK_STUDENT.totalPoints}
              </span>
              <span className="text-[18px] font-medium text-[#B9CBE0]">/ 100</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-[#102B4D] rounded-full mt-4 overflow-hidden border border-[#315781]/30">
              <div 
                className="h-full bg-[#5B9BFF] rounded-full" 
                style={{ width: `${Math.min(100, (MOCK_STUDENT.totalPoints / 100) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 mt-auto flex items-center gap-6 pt-5 border-t border-[#315781]">
            <div className="flex-1 flex flex-col gap-1.5">
              <span className="text-[10px] font-medium text-[#B9CBE0] uppercase tracking-[0.1em]">Xếp loại</span>
              <div className="flex items-center gap-2">
                <Medal className="w-3.5 h-3.5 text-[#5B9BFF]" />
                <span className="text-[16px] font-bold text-[#FFFFFF]">{MOCK_STUDENT.classification}</span>
              </div>
            </div>
            <div className="w-px h-10 bg-[#315781]"></div>
            <div className="flex-1 flex flex-col gap-1.5 pl-2">
              <span className="text-[10px] font-medium text-[#B9CBE0] uppercase tracking-[0.1em]">Trạng thái</span>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#5B9BFF]" />
                <span className="text-[16px] font-bold text-[#FFFFFF]">Đạt tín chỉ</span>
              </div>
            </div>
          </div>
        </div>


        <div className="lg:col-span-3 rounded-[16px] bg-surface border border-black/5 p-6 md:p-8 flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
          {/* Subtle academic top accent line */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary to-transparent"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-black/5 pb-4 mb-6 gap-3">
            <div className="flex flex-col gap-1">
               <h3 className="text-[16px] font-bold text-primary flex items-center gap-2 tracking-tight uppercase">
                 <TrendingUp className="h-4 w-4" />
                 Tăng trưởng tích lũy
               </h3>
               <span className="text-[13px] text-muted font-medium">Lộ trình rèn luyện 3 năm học</span>
            </div>
            
            {/* Academic Growth Indicator (Gold accent) */}
            <div className="flex items-center gap-2 bg-accent-soft border border-accent/20 px-3 py-1.5 rounded-lg w-fit">
              <span className="text-[12px] font-bold text-warning">Tiến độ vượt mức 12.5%</span>
            </div>
          </div>
          
          <div className="flex-1 relative h-[180px] flex mt-2">
            {/* Y-axis labels */}
            <div className="flex flex-col justify-between text-[11px] font-medium text-muted pb-[28px] pr-3 w-8 text-right shrink-0">
              <span>45</span>
              <span>30</span>
              <span>15</span>
              <span>0</span>
            </div>
            
            {/* Chart Area */}
            <div className="flex-1 relative h-full flex items-end pb-[28px]">
              {/* Grid lines (Y-axis) - Refined dashed lines */}
              <div className="absolute inset-0 pb-[28px] flex flex-col justify-between pointer-events-none z-0">
                <div className="w-full h-[1px] border-t border-dashed border-black/10"></div>
                <div className="w-full h-[1px] border-t border-dashed border-black/10"></div>
                <div className="w-full h-[1px] border-t border-dashed border-black/10"></div>
                {/* X-axis solid line */}
                <div className="w-full h-[1px] bg-black/15"></div>
              </div>
              
              {/* Bars */}
              <div className="relative z-10 w-full h-full flex items-end justify-around px-4 md:px-12 gap-4">
                {[
                  { label: "Năm 1", value: 35 },
                  { label: "Năm 2", value: 37 },
                  { label: "Năm 3", value: 13 },
                ].map((item, index) => (
                  <div key={item.label} className="relative flex flex-col items-center h-full justify-end group cursor-default w-full max-w-[48px] md:max-w-[64px]">
                    {/* Tooltip */}
                    <span className="absolute -top-8 text-[11px] font-bold text-white opacity-0 group-hover:opacity-100 transition-all duration-300 bg-primary px-2 py-0.5 rounded shadow-md translate-y-1 group-hover:translate-y-0">
                      {item.value > 0 ? `+${item.value}` : '0'}
                    </span>
                    
                    {/* Bar */}
                    <div 
                      className={`w-full rounded-t-[6px] transition-all duration-300 relative overflow-hidden ${
                        index === 2 
                          ? 'bg-primary shadow-[0_4px_12px_rgb(23,58,103,0.25)]' 
                          : 'bg-primary-muted group-hover:bg-primary/50' 
                      }`}
                      style={{ height: `${Math.max((item.value / 45) * 100, 4)}%` }}
                    >
                    </div>
                    
                    {/* X-axis Label */}
                    <span className={`absolute -bottom-[26px] text-[11px] transition-colors whitespace-nowrap ${
                      index === 2 ? 'text-primary font-bold' : 'text-muted font-medium group-hover:text-ink'
                    }`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-2">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h2 className="text-lg font-semibold text-ink">Lịch sử tích lũy</h2>
          <Button variant="outline" size="sm" className="h-8 text-[13px] gap-1.5">
            <Filter className="h-3.5 w-3.5" /> Lọc
          </Button>
        </div>

        <div className="flex flex-col rounded-xl border border-border bg-surface shadow-sm">
          {MOCK_TRAINING_POINTS.map((entry, index) => (
            <div 
              key={entry.id} 
              className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                index !== MOCK_TRAINING_POINTS.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <div className="flex flex-col gap-1.5">
                <p className="font-semibold text-[15px] text-ink">{entry.eventTitle}</p>
                <div className="flex flex-wrap items-center gap-2 text-[12px] text-muted">
                  <StatusBadge status={entry.category} variant="accent" className="text-[10px] px-1.5 py-0" />
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    <span>{new Date(entry.earnedAt).toLocaleDateString("vi-VN")}</span>
                  </div>
                  <span className="hidden sm:inline text-border-strong">•</span>
                  <span className="truncate max-w-[150px]">{entry.organizer}</span>
                </div>
              </div>
              <div className="flex items-center sm:justify-end">
                <span className="inline-flex items-center justify-center px-3 py-1 rounded-md bg-success/10 text-success font-bold text-[14px]">
                  +{entry.points}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
