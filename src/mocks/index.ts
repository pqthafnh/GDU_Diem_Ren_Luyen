import { Event, StudentSummary, Ticket, TrainingPointEntry } from "@/types";

export const MOCK_STUDENT: StudentSummary = {
  studentId: "2024001",
  fullName: "Nguyễn Văn A",
  major: "Công nghệ thông tin",
  totalPoints: 85,
  classification: "Giỏi",
};

export const MOCK_EVENTS: Event[] = [
  {
    id: "evt-01",
    title: "Hội thảo Kỹ năng phỏng vấn và xây dựng CV",
    banner: "https://placehold.co/800x400/173a67/ffffff?text=Interview+Skills",
    content: "Tham gia hội thảo để học hỏi kinh nghiệm từ các chuyên gia nhân sự hàng đầu...",
    category: "Kỹ năng mềm",
    organizer: "Phòng Công tác sinh viên",
    startTime: "2026-10-15T08:00:00Z",
    endTime: "2026-10-15T11:00:00Z",
    location: "Phòng A.805, cơ sở Tân Sơn Nhất",
    targetAudience: "Sinh viên năm 3, năm 4",
    capacity: 120,
    registeredCount: 96,
    status: "Public",
    points: 15,
    cancellationDeadline: "2026-10-13T20:00:00Z",
  },
  {
    id: "evt-02",
    title: "Workshop AI và Ứng dụng thực tiễn",
    banner: "https://placehold.co/800x400/214A7A/ffffff?text=AI+Workshop",
    content: "Khám phá cách AI đang thay đổi cách chúng ta làm việc và học tập.",
    category: "Học thuật",
    organizer: "Khoa CNTT",
    startTime: "2026-10-20T13:30:00Z",
    endTime: "2026-10-20T17:00:00Z",
    location: "Hội trường cơ sở Tân Sơn Nhất",
    targetAudience: "Toàn trường",
    capacity: 300,
    registeredCount: 300,
    status: "Public",
    points: 10,
    cancellationDeadline: "2026-10-18T20:00:00Z",
  },
  {
    id: "evt-03",
    title: "Ngày hội hiến máu tình nguyện 2026",
    banner: "https://placehold.co/800x400/c23b3b/ffffff?text=Blood+Donation",
    content: "Một giọt máu cho đi, một cuộc đời ở lại. Tham gia ngay ngày hội hiến máu.",
    category: "Tình nguyện",
    organizer: "Đoàn Thanh niên",
    startTime: "2026-10-25T07:00:00Z",
    endTime: "2026-10-25T11:30:00Z",
    location: "Sân trường cơ sở Tân Sơn Nhất",
    targetAudience: "Toàn trường",
    capacity: 500,
    registeredCount: 450,
    status: "Public",
    points: 20,
  }
];

export const MOCK_TICKETS: Ticket[] = [
  {
    id: "tk-001",
    eventId: "evt-01",
    event: MOCK_EVENTS[0],
    studentId: "2024001",
    status: "Vé chính thức",
    registeredAt: "2026-10-10T10:00:00Z",
    sequenceNumber: 45,
    attendance: "Chưa điểm danh",
  },
  {
    id: "tk-002",
    eventId: "evt-02",
    event: MOCK_EVENTS[1],
    studentId: "2024001",
    status: "Danh sách chờ",
    registeredAt: "2026-10-12T08:00:00Z",
    waitlistPosition: 5,
    attendance: "Chưa điểm danh",
  }
];

export const MOCK_TRAINING_POINTS: TrainingPointEntry[] = [
  {
    id: "tp-01",
    eventId: "evt-past-01",
    eventTitle: "Mùa hè xanh 2026",
    category: "Tình nguyện",
    points: 50,
    earnedAt: "2026-08-15T10:00:00Z",
    organizer: "Đoàn Thanh niên",
  },
  {
    id: "tp-02",
    eventId: "evt-past-02",
    eventTitle: "Cuộc thi lập trình Hackathon",
    category: "Học thuật",
    points: 35,
    earnedAt: "2026-05-20T16:00:00Z",
    organizer: "Khoa CNTT",
  }
];
