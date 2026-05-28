// ============================================================
// Shared Entity Interfaces - API response shapes
// ============================================================

import {
  EmployeeStatus,
  ProjectStatus,
  TaskStatus,
  TaskType,
  Priority,
  AttendanceStatus,
  LeaveType,
  LeaveStatus,
  NotificationType,
} from './enums';

/** Base entity with common fields */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/** User entity (public-facing, no passwordHash) */
export interface UserEntity extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt: string | null;
  roles: RoleEntity[];
}

/** Role entity */
export interface RoleEntity {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions?: PermissionEntity[];
}

/** Permission entity */
export interface PermissionEntity {
  id: string;
  name: string;
  description: string | null;
  module: string;
  action: string;
}

/** Employee entity */
export interface EmployeeEntity extends BaseEntity {
  userId: string;
  employeeCode: string;
  department: string | null;
  designation: string | null;
  phone: string | null;
  dateOfJoining: string;
  dateOfBirth: string | null;
  status: EmployeeStatus;
  user?: UserEntity;
}

/** Project entity */
export interface ProjectEntity extends BaseEntity {
  name: string;
  key: string;
  description: string | null;
  status: ProjectStatus;
  priority: Priority;
  startDate: string | null;
  endDate: string | null;
  ownerId: string;
  teams?: TeamEntity[];
}

/** Task entity */
export interface TaskEntity extends BaseEntity {
  taskNumber: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  type: TaskType;
  storyPoints: number | null;
  dueDate: string | null;
  startedAt: string | null;
  completedAt: string | null;
  projectId: string;
  assigneeId: string | null;
  reporterId: string;
  parentId: string | null;
  project?: ProjectEntity;
  assignee?: UserEntity;
  reporter?: UserEntity;
}

/** Team entity */
export interface TeamEntity extends BaseEntity {
  name: string;
  description: string | null;
  leadId: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  departmentId: string | null;
  maxCapacity: number;
  avatar: string | null;
  tags: string[];
}

/** Attendance entity */
export interface AttendanceEntity extends BaseEntity {
  employeeId: string;
  date: string;
  checkInTime: string;
  checkOutTime: string | null;
  status: AttendanceStatus;
  totalHours: number | null;
  notes: string | null;
}

/** Leave request entity */
export interface LeaveRequestEntity extends BaseEntity {
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
}

/** Notification entity */
export interface NotificationEntity {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

/** Activity log entity */
export interface ActivityLogEntity {
  id: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string;
  changes: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}
