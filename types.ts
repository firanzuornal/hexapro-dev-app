export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  DEVELOPER = 'DEVELOPER',
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum TicketType {
  BUG = 'BUG',
  FEATURE = 'FEATURE',
  ISSUE = 'ISSUE',
}

export interface User {
  id: string;
  username: string;
  password?: string; // In real app, never store plain text
  name: string;
  email?: string;
  role: UserRole;
  avatar: string;
  bio?: string;
  companyName?: string;
  clientId?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  dataUrl: string; // Base64 or Object URL for demo purposes
}

export type TaskApprovalStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Task {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  approvalStatus: TaskApprovalStatus;
  assignedToId?: string;
  dueDate?: string; // ISO String
  // Submission fields
  submissionNote?: string;
  submissionAttachments?: Attachment[];
}

export interface TicketLog {
  id: string;
  text: string;
  createdAt: string;
  userId: string;
  userName: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  type: TicketType;
  priority: TicketPriority;
  status: TicketStatus;
  createdById: string;
  createdByName: string;
  assignedToId?: string; // If null, unassigned
  createdAt: string;
  tasks: Task[];
  logs: TicketLog[];
  attachments: Attachment[];
  // Resolution fields
  resolutionNote?: string;
  resolutionAttachments?: Attachment[];
  // Rejection fields (when reopened)
  rejectionReason?: string;
  rejectionAttachments?: Attachment[];
}

export interface Comment {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}