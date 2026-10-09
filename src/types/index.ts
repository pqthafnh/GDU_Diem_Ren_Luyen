export type EventCategory = "Hội thảo" | "Workshop" | "Kỹ năng mềm" | "Ngoại khóa" | "Học thuật" | "Tình nguyện";

export type EventStatus = "Bản nháp" | "Chờ duyệt" | "Yêu cầu chỉnh sửa" | "Public" | "Đang diễn ra" | "Đã kết thúc" | "Đã cancel" | "Đã xóa";

export type RegistrationStatus = "Vé chính thức" | "Danh sách chờ" | "Đã hủy";

export type AttendanceResult = "Đã check-in" | "No-show" | "Chưa điểm danh";

export interface Event {
  id: string;
  title: string;
  banner: string;
  content: string;
  category: EventCategory;
  organizer: string;
  startTime: string; // ISO string
  endTime: string;
  location: string;
  targetAudience: string;
  capacity: number;
  registeredCount: number;
  status: EventStatus;
  points: number;
  cancellationDeadline?: string;
}

export interface Ticket {
  id: string;
  eventId: string;
  event: Event;
  studentId: string;
  status: RegistrationStatus;
  registeredAt: string;
  sequenceNumber?: number;
  seatNumber?: string;
  waitlistPosition?: number;
  attendance: AttendanceResult;
  checkInTime?: string;
}

export type TrainingPointCategory = "Học thuật" | "Kỹ năng mềm" | "Tình nguyện" | "Thể thao - Văn hóa" | "Khác";

export interface TrainingPointEntry {
  id: string;
  eventId: string;
  eventTitle: string;
  category: TrainingPointCategory;
  points: number;
  earnedAt: string; // ISO string
  organizer: string;
}

export interface StudentSummary {
  studentId: string;
  fullName: string;
  major: string;
  totalPoints: number;
  classification: "Xuất sắc" | "Giỏi" | "Khá" | "Trung bình" | "Yếu" | "Kém";
}
