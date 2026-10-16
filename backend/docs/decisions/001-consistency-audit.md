# ADR-001: Consistency Audit — Resolving Conflicts Between BACKEND_GUIDE.md and BACKEND_API_SPECIFICATION.md

**Date:** 2026-10-14  
**Status:** Accepted  
**Decision Makers:** Automated consistency audit per AGENTS.md

---

## Context

Two documents describe the backend: `BACKEND_GUIDE.md` (high-level guide) and `docs/BACKEND_API_SPECIFICATION.md` (detailed specification). Several conflicts exist between them.

## Conflicts Identified & Resolutions

### 1. Technology Stack
- **BACKEND_GUIDE.md** suggests NodeJS/Express/NestJS with Prisma/TypeORM.
- **BACKEND_API_SPECIFICATION.md** is technology-agnostic (SQL-focused).
- **AGENTS.md** mandates: Python 3.12+, FastAPI, psycopg 3, raw SQL, uv.
- **Resolution:** Follow AGENTS.md (highest priority after user request). Use Python/FastAPI stack.

### 2. Database Schema
- **BACKEND_GUIDE.md** defines 5 tables: users, events, tickets, attendance, points_history.
- **BACKEND_API_SPECIFICATION.md** defines 7 tables: users, events, interactive_actions, interactive_submissions, tickets, attendance, training_points_ledger, system_audit_logs.
- **Resolution:** Follow BACKEND_API_SPECIFICATION.md (more detailed, higher priority per AGENTS.md). The `points_history` table is superseded by `training_points_ledger`.

### 3. Event Status Values
- **BACKEND_GUIDE.md** uses: DRAFT, PENDING_REVIEW, APPROVED, REJECTED, PUBLISHED, CANCELLED.
- **BACKEND_API_SPECIFICATION.md** uses: DRAFT, PENDING_REVIEW, CHANGES_REQUESTED, APPROVED, REJECTED, PUBLISHED, IN_PROGRESS, COMPLETED, CANCELLED.
- **Resolution:** Use the expanded set from API spec. Note: `CHANGES_REQUESTED` maps to what GUIDE calls returning to DRAFT with feedback. For simplicity and consistency with the spec SQL, we use the full enum but note that `REQUEST_CHANGE` action in the review decision sets status to `CHANGES_REQUESTED` (not back to DRAFT as stated in some parts of the spec). This is the safer choice since the spec SQL explicitly uses `CHANGES_REQUESTED` in the CHECK constraint.

### 4. API Endpoint Prefixes
- **BACKEND_GUIDE.md** uses `/api/events`, `/api/tickets`, `/api/admin/events`.
- **BACKEND_API_SPECIFICATION.md** uses `/api/mod/events`, `/api/student/events`, `/api/admin/reviews`.
- **Resolution:** Follow API spec's role-prefixed endpoints for RBAC clarity. All student APIs under `/api/student/`, MOD APIs under `/api/mod/`, Admin APIs under `/api/admin/`, Auth APIs under `/api/auth/`.

### 5. Attendance Status Values
- **BACKEND_GUIDE.md** uses: VALID, INVALID_LOCATION, LATE.
- **BACKEND_API_SPECIFICATION.md** uses: VALID, INVALID_GPS, EXPIRED_QR, CHECKED_IN, CHECKED_OUT, MISSING_CHECKOUT, MANUAL_OVERRIDE.
- **Resolution:** Use API spec's expanded set. LATE is not used; timing validation uses EXPIRED_QR for expired QR tokens.

### 6. Password Default Format
- **BACKEND_GUIDE.md** doesn't specify.
- **BACKEND_API_SPECIFICATION.md** specifies: `GDU@ + UPPER(UNACCENT(first_name)) + TO_CHAR(birth_date, 'DDMM')`.
- **Resolution:** Follow API spec.

### 7. Classification Thresholds
- **BACKEND_API_SPECIFICATION.md** uses two slightly different scales in different sections:
  - Section 1.4: >=90 Xuất sắc, >=80 Giỏi, >=65 Khá, >=50 Trung bình, <50 Yếu
  - Section 5.4: >=90 Xuất sắc, >=80 Tốt, >=65 Khá, >=50 Trung bình, <50 Yếu/Kém
- **Resolution:** Use "Xuất sắc", "Giỏi", "Khá", "Trung bình", "Yếu" from section 1.4 (referenced with QĐ 251). "Tốt" is treated as synonym for "Giỏi".

### 8. Review Decision Action Mapping
- API spec says `REQUEST_CHANGE` sets status to `DRAFT`, but the events table CHECK constraint includes `CHANGES_REQUESTED`.
- **Resolution:** `REQUEST_CHANGE` action sets status to `CHANGES_REQUESTED`. When MOD edits, the status condition allows both `DRAFT` and `CHANGES_REQUESTED` for editing. This preserves the distinct status while allowing the correct workflow.

## Decision

All conflicts resolved in favor of the BACKEND_API_SPECIFICATION.md with AGENTS.md tech stack constraints taking precedence. Implementation follows these resolutions throughout.
