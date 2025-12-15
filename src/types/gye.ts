import type { User } from "./user";

export type GyeStatus = "recruiting" | "ongoing" | "completed" | "cancelled";

export type GyeType = "savings" | "distribution";

export interface Gye {
  id: string;
  name: string;
  description?: string;
  type: GyeType;
  status: GyeStatus;
  hostId: string;
  host: Pick<User, "id" | "nickname" | "profileImage" | "creditScore">;
  monthlyAmount: number;
  targetAmount: number;
  currentAmount: number;
  maxMembers: number;
  currentMembers: number;
  startDate: string;
  endDate: string;
  currentRound: number;
  totalRounds: number;
  createdAt: string;
  updatedAt: string;
}

export interface GyeDetail extends Gye {
  members: GyeMember[];
  schedules: GyeSchedule[];
  rules: string[];
}

export type MemberRole = "host" | "member";

export type MemberStatus = "active" | "pending" | "left" | "kicked";

export interface GyeMember {
  id: string;
  gyeId: string;
  userId: string;
  user: Pick<User, "id" | "nickname" | "profileImage" | "creditScore">;
  role: MemberRole;
  status: MemberStatus;
  orderNumber: number; // 순번
  paidRounds: number;
  totalPaid: number;
  joinedAt: string;
}

export type ScheduleType = "payment" | "payout" | "meeting";

export type ScheduleStatus = "upcoming" | "completed" | "overdue";

export interface GyeSchedule {
  id: string;
  gyeId: string;
  type: ScheduleType;
  status: ScheduleStatus;
  round: number;
  date: string;
  amount?: number;
  targetMemberId?: string;
  targetMember?: Pick<User, "id" | "nickname" | "profileImage">;
  description?: string;
}

export interface CreateGyeRequest {
  name: string;
  description?: string;
  type: GyeType;
  monthlyAmount: number;
  maxMembers: number;
  startDate: string;
  rules?: string[];
}

export interface GyeListParams {
  status?: GyeStatus;
  type?: GyeType;
  search?: string;
  page?: number;
  limit?: number;
}
