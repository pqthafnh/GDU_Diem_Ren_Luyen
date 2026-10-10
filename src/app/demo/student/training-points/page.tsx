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


        <div className="lg:col-span-3 rounded-[20px] bg-white border border-black/5 p-7 md:p-10 flex flex-col shadow-[0_12px_40px_rgb(0,0,0,0.06)] relative overflow-hidden group">
          {/* Subtle top accent line */}
          <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-[#173A67] via-[#173A67]/60 to-transparent"></div>
          
          <div className="flex flex-col md:flex-row gap-8 lg:gap-14 items-center flex-1">
            {/* Left side: Circular Chart */}
            <div className="w-full md:w-[260px] flex flex-col items-center shrink-0">
              <div className="w-full text-center md:text-left mb-8 flex flex-col gap-1.5">
                 <h3 className="text-[17px] font-bold text-[#173A67] tracking-tight uppercase flex items-center justify-center md:justify-start gap-2">
                   Kết quả rèn luyện
                 </h3>
                 <span className="text-[12px] text-muted font-medium bg-canvas px-3 py-1 rounded-md border border-border/50 inline-flex w-fit mx-auto md:mx-0 shadow-sm">
                   Căn cứ QĐ 251/2023/GDU/QĐ-HT
                 </span>
              </div>
              
              <div className="relative w-[160px] h-[160px] flex items-center justify-center">
                {/* SVG Circular Chart */}
                <svg className="w-full h-full transform -rotate-90 drop-shadow-md" viewBox="0 0 100 100">
                  {/* Track */}
                  <circle cx="50" cy="50" r="42" className="stroke-[#eaf0f7]" strokeWidth="8" fill="none" />
                  {/* Progress */}
                  <circle 
                    cx="50" cy="50" r="42" 
                    className="stroke-[#173A67]" 
                    strokeWidth="8" 
                    fill="none" 
                    strokeDasharray="264" 
                    strokeDashoffset={264 - (264 * MOCK_STUDENT.totalPoints) / 100}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
                  />
                </svg>
                {/* Score */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-[44px] font-black text-[#173A67] leading-none tracking-tighter">{MOCK_STUDENT.totalPoints}</span>
                </div>
              </div>
              

            </div>

            {/* Soft Divider for desktop */}
            <div className="hidden md:block w-px h-[260px] bg-gradient-to-b from-transparent via-border/80 to-transparent shrink-0"></div>

            {/* Right side: Classification Table */}
            <div className="flex-1 w-full flex flex-col justify-center">
               <div className="rounded-[12px] overflow-hidden border border-border/60 bg-white text-[13px] shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-canvas border-b border-border/80">
                        <th className="px-5 py-3.5 font-semibold text-muted w-1/2 uppercase tracking-wide text-[11px]">Thang điểm</th>
                        <th className="px-5 py-3.5 font-semibold text-muted w-1/2 uppercase tracking-wide text-[11px]">Xếp loại</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { range: "90 - 100", label: "Xuất sắc", condition: MOCK_STUDENT.totalPoints >= 90 },
                        { range: "80 - dưới 90", label: "Giỏi", condition: MOCK_STUDENT.totalPoints >= 80 && MOCK_STUDENT.totalPoints < 90 },
                        { range: "65 - dưới 80", label: "Khá", condition: MOCK_STUDENT.totalPoints >= 65 && MOCK_STUDENT.totalPoints < 80 },
                        { range: "50 - dưới 65", label: "Trung bình", condition: MOCK_STUDENT.totalPoints >= 50 && MOCK_STUDENT.totalPoints < 65 },
                        { range: "35 - dưới 50", label: "Yếu", condition: MOCK_STUDENT.totalPoints >= 35 && MOCK_STUDENT.totalPoints < 50 },
                        { range: "Dưới 35", label: "Kém", condition: MOCK_STUDENT.totalPoints < 35 },
                      ].map((row, idx) => (
                        <tr key={idx} className={`border-b border-border/50 last:border-0 transition-colors ${row.condition ? 'bg-[#eaf0f7]' : 'bg-white hover:bg-canvas/40'}`}>
                          <td className={`py-3 ${row.condition ? 'font-bold text-[#173A67] border-l-4 border-[#173A67] pl-4' : 'text-body font-medium border-l-4 border-transparent pl-5'}`}>
                            {row.range}
                          </td>
                          <td className={`px-5 py-3 ${row.condition ? 'font-bold text-[#173A67]' : 'text-ink font-medium'}`}>
                            {row.label}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-border/50 flex justify-between items-center">
            <p className="text-[13px] font-semibold text-[#173A67] flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Điểm rèn luyện theo 5 tiêu chí
            </p>
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
