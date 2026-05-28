// ============================================================
// Shared Enums - Single source of truth for both apps
// ============================================================

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
}

export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  TERMINATED = 'TERMINATED',
  RESIGNED = 'RESIGNED',
}

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export enum TaskStatus {
  BACKLOG = 'BACKLOG',
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED',
}

export enum TaskType {
  EPIC = 'EPIC',
  STORY = 'STORY',
  TASK = 'TASK',
  BUG = 'BUG',
  SUBTASK = 'SUBTASK',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  HALF_DAY = 'HALF_DAY',
  LATE = 'LATE',
  ON_LEAVE = 'ON_LEAVE',
  HOLIDAY = 'HOLIDAY',
  WEEKEND = 'WEEKEND',
  WORK_FROM_HOME = 'WORK_FROM_HOME',
  REMOTE = 'REMOTE',
}

export enum ShiftType {
  MORNING = 'MORNING',
  NIGHT = 'NIGHT',
  FLEXIBLE = 'FLEXIBLE',
  CUSTOM = 'CUSTOM',
}

export enum BreakType {
  LUNCH = 'LUNCH',
  TEA = 'TEA',
  IDLE = 'IDLE',
  OTHER = 'OTHER',
}

export enum CorrectionType {
  FORGOT_CHECKOUT = 'FORGOT_CHECKOUT',
  WRONG_TIMING = 'WRONG_TIMING',
  MISSED_ATTENDANCE = 'MISSED_ATTENDANCE',
}

export enum CorrectionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum LeaveType {
  CASUAL = 'CASUAL',
  SICK = 'SICK',
  EARNED = 'EARNED',
  MATERNITY = 'MATERNITY',
  PATERNITY = 'PATERNITY',
  UNPAID = 'UNPAID',
  COMPENSATORY = 'COMPENSATORY',
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum TeamStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export enum TeamRole {
  TEAM_LEAD = 'TEAM_LEAD',
  SENIOR_DEVELOPER = 'SENIOR_DEVELOPER',
  DEVELOPER = 'DEVELOPER',
  QA_ENGINEER = 'QA_ENGINEER',
  UI_UX_DESIGNER = 'UI_UX_DESIGNER',
  DEVOPS_ENGINEER = 'DEVOPS_ENGINEER',
  INTERN = 'INTERN',
  MEMBER = 'MEMBER',
}

export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_UPDATED = 'TASK_UPDATED',
  LEAVE_REQUEST = 'LEAVE_REQUEST',
  LEAVE_APPROVED = 'LEAVE_APPROVED',
  LEAVE_REJECTED = 'LEAVE_REJECTED',
  ATTENDANCE_REMINDER = 'ATTENDANCE_REMINDER',
  PROJECT_UPDATE = 'PROJECT_UPDATE',
  TEAM_MEMBER_ADDED = 'TEAM_MEMBER_ADDED',
  TEAM_PROJECT_ASSIGNED = 'TEAM_PROJECT_ASSIGNED',
  TEAM_UPDATE = 'TEAM_UPDATE',
  SYSTEM = 'SYSTEM',
}
