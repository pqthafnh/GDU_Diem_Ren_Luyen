export type EventCategory = "Tương tác" | "Học thuật" | "Ngoại khóa" | "Thi đấu" | "Khác";

export type EventType = "standard" | "interactive";

export interface InteractiveAction {
  id: string;
  type: "like" | "share" | "comment" | "custom";
  label: string; // ví dụ: "Like / Thả cảm xúc bài viết"
  description?: string;
  points: number; // 1 điểm mỗi hành động
}

export interface InteractiveEventConfig {
  facebookPostUrl: string; // Link bài Facebook cần tương tác
  actions: InteractiveAction[]; // Danh sách các hành động người dùng cần làm
  instruction?: string; // Hướng dẫn chi tiết nộp minh chứng
}

export type EventStatus = "Bản nháp" | "Chờ duyệt" | "Yêu cầu chỉnh sửa" | "Public" | "Đang diễn ra" | "Đã kết thúc" | "Đã cancel" | "Đã xóa";

export type RegistrationStatus = "Vé chính thức" | "Danh sách chờ" | "Đã hủy";

export type AttendanceResult = "Đã check-in" | "No-show" | "Chưa điểm danh";

export interface Event {
  id: string;
  title: string;
  banner: string;
  content: string;
  category: EventCategory;
  eventType?: EventType; // "standard" | "interactive"
  interactiveConfig?: InteractiveEventConfig;
  organizer: string;
  startTime: string; // ISO string
  endTime: string;
  location: string;
  targetAudience: string;
  capacity: number;
  registeredCount: number;
  status: EventStatus;
  points: number;
  checkInMethod?: "qr_gps" | "manual_rollcall" | "social_interactive"; // "manual_rollcall" cho sự kiện Ngoại khóa ngoài trường hoặc Thi đấu
  cancellationDeadline?: string;
  speaker?: {
    name: string;
    role: string;
  };
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
  completedActions?: string[]; // IDs các hành động tương tác đã hoàn thành
  proofUrl?: string; // Link minh chứng Facebook
  proofNote?: string;
}

export type TrainingPointCategory = "Học thuật" | "Ngoại khóa" | "Thi đấu" | "Tương tác" | "Khác";

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
  lastName: string;
  firstName: string;
  fullName: string;
  gender: "Nam" | "Nữ";
  birthDate: string;
  className: string;
  major: string;
  schoolEmail: string;
  phoneNumber?: string;
  totalPoints: number;
  classification: "Xuất sắc" | "Giỏi" | "Khá" | "Trung bình" | "Yếu" | "Kém";
}

export interface EventRegistrationItem {
  id: string;
  studentId: string;
  fullName: string;
  className: string;
  major: string;
  phoneNumber?: string;
  registeredAt: string;
  status: "Chưa điểm danh" | "Đã check-in" | "Đã check-out" | "Vắng check-out";
  checkInTime?: string;
  checkOutTime?: string;
  verifiedBy?: string;
  callStatus?: "Chưa liên hệ" | "Đã gọi xác nhận" | "Không liên lạc được";
  callNote?: string;
}

export interface ExcelExportRecord {
  stt: number;
  studentId: string;
  lastName: string;
  firstName: string;
  gender: "Nam" | "Nữ";
  birthDate: string;
  className: string;
  major: string;
  activityTitle: string;
  totalPoints: number;
}

