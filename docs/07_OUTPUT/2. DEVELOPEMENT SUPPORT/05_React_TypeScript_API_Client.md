파일 구조
src/
├── api/
│   ├── index.ts
│   ├── types/
│   │   ├── common.ts
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   ├── account.ts
│   │   ├── challenge.ts
│   │   ├── member.ts
│   │   ├── meeting.ts
│   │   ├── vote.ts
│   │   ├── expense.ts
│   │   ├── ledger.ts
│   │   ├── post.ts
│   │   ├── comment.ts
│   │   ├── notification.ts
│   │   ├── report.ts
│   │   ├── refund.ts
│   │   ├── settlement.ts
│   │   ├── search.ts
│   │   └── analytics.ts
│   └── services/
│       ├── authService.ts
│       ├── userService.ts
│       ├── accountService.ts
│       ├── challengeService.ts
│       ├── memberService.ts
│       ├── meetingService.ts
│       ├── voteService.ts
│       ├── expenseService.ts
│       ├── ledgerService.ts
│       ├── postService.ts
│       ├── commentService.ts
│       ├── notificationService.ts
│       ├── reportService.ts
│       ├── refundService.ts
│       ├── settlementService.ts
│       ├── searchService.ts
│       └── analyticsService.ts
api/index.ts
Copyimport axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.woorido.com/api/v1';
const DJANGO_URL = import.meta.env.VITE_DJANGO_URL || 'https://api.woorido.com/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export const djangoClient: AxiosInstance = axios.create({
  baseURL: DJANGO_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export const getAccessToken = (): string | null => localStorage.getItem('accessToken');
export const getRefreshToken = (): string | null => localStorage.getItem('refreshToken');
export const setTokens = (access: string, refresh: string): void => {
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
};
export const clearTokens = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

const requestInterceptor = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

apiClient.interceptors.request.use(requestInterceptor);
djangoClient.interceptors.request.use(requestInterceptor);

const handleTokenRefresh = async (error: AxiosError): Promise<any> => {
  const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token');
      const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
      const { accessToken, refreshToken: newRefresh } = response.data.data;
      setTokens(accessToken, newRefresh);
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      }
      return apiClient(originalRequest);
    } catch (refreshError) {
      clearTokens();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    }
  }
  return Promise.reject(error);
};

apiClient.interceptors.response.use((res) => res, handleTokenRefresh);
djangoClient.interceptors.response.use((res) => res, handleTokenRefresh);

export default apiClient;
api/types/common.ts
Copyexport interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: { code: string; message: string; details?: Record<string, string> };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: { number: number; size: number; totalElements: number; totalPages: number };
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'WITHDRAWN';
export type ChallengeStatus = 'RECRUITING' | 'IN_PROGRESS' | 'COMPLETED';
export type ChallengeCategory = 'HOBBY' | 'STUDY' | 'EXERCISE' | 'SAVINGS' | 'TRAVEL' | 'FOOD' | 'CULTURE' | 'OTHER';
export type MemberRole = 'LEADER' | 'FOLLOWER';
export type DepositStatus = 'NONE' | 'LOCKED' | 'USED' | 'UNLOCKED';
export type PrivilegeStatus = 'ACTIVE' | 'REVOKED';
export type VoteType = 'EXPENSE' | 'KICK' | 'MEETING_ATTENDANCE' | 'LEADER_KICK' | 'DISSOLVE';
export type VoteStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
export type VoteChoice = 'AGREE' | 'DISAGREE' | 'ABSTAIN' | 'ATTEND' | 'ABSENT';
export type MeetingStatus = 'PLANNED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export type AttendanceStatus = 'REGISTERED' | 'ATTENDED' | 'NO_SHOW';
export type TransactionType = 'CHARGE' | 'WITHDRAW' | 'LOCK' | 'UNLOCK' | 'SUPPORT' | 'ENTRY_FEE' | 'REFUND';
export type LedgerType = 'INCOME' | 'EXPENSE';
export type LedgerCategory = 'SUPPORT' | 'ENTRY_FEE' | 'OTHER_INCOME' | 'MEETING' | 'FOOD' | 'SUPPLIES' | 'OTHER_EXPENSE';
export type NotificationType = 'VOTE' | 'MEETING' | 'EXPENSE' | 'SNS' | 'SYSTEM';
export type ReportReason = 'SPAM' | 'ABUSE' | 'FRAUD' | 'INAPPROPRIATE' | 'OTHER';
export type ReportStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'FALSE_REPORT';
export type ReportTargetType = 'USER' | 'POST' | 'COMMENT' | 'CHALLENGE';
export type RefundStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
export type SettlementStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type ExpenseStatus = 'PENDING' | 'VOTING' | 'APPROVED' | 'REJECTED' | 'EXECUTED' | 'CANCELLED';
export type ExpenseCategory = 'MEETING' | 'FOOD' | 'SUPPLIES' | 'OTHER';
api/types/auth.ts
Copyexport interface SignupRequest {
  email: string;
  password: string;
  passwordConfirm: string;
  nickname: string;
  phone?: string;
  birthDate?: string;
  agreedTerms: boolean;
  agreedPrivacy: boolean;
  agreedMarketing?: boolean;
}

export interface SignupResponse {
  userId: string;
  email: string;
  nickname: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: { userId: string; email: string; nickname: string; profileImage?: string };
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface LogoutResponse {
  loggedOut: boolean;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface EmailVerifyRequest {
  email: string;
  type: 'SIGNUP' | 'PASSWORD_RESET';
}

export interface EmailVerifyResponse {
  email: string;
  expiresIn: number;
  retryAfter: number;
}

export interface EmailConfirmRequest {
  email: string;
  code: string;
}

export interface EmailConfirmResponse {
  email: string;
  verified: boolean;
  verificationToken: string;
}

export interface PasswordResetRequestBody {
  email: string;
}

export interface PasswordResetRequestResponse {
  email: string;
  expiresIn: number;
}

export interface PasswordResetExecuteRequest {
  token: string;
  newPassword: string;
  newPasswordConfirm: string;
}

export interface PasswordResetExecuteResponse {
  passwordReset: boolean;
}
api/types/user.ts
Copyimport { UserStatus } from './common';

export interface UserAccount {
  accountId: string;
  balance: number;
  availableBalance: number;
  lockedBalance: number;
}

export interface UserStats {
  challengeCount: number;
  completedChallenges: number;
  totalSupportAmount: number;
}

export interface MyInfoResponse {
  userId: string;
  email: string;
  nickname: string;
  phone?: string;
  birthDate?: string;
  profileImage?: string;
  status: UserStatus;
  brix: number;
  account: UserAccount;
  stats: UserStats;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateMyInfoRequest {
  nickname?: string;
  profileImage?: string;
  phone?: string;
}

export interface UpdateMyInfoResponse {
  userId: string;
  nickname: string;
  profileImage?: string;
  phone?: string;
  updatedAt: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}

export interface ChangePasswordResponse {
  passwordChanged: boolean;
}

export interface WithdrawRequest {
  password: string;
  reason?: string;
}

export interface WithdrawResponse {
  userId: string;
  status: 'WITHDRAWN';
  withdrawnAt: string;
  dataDeletedAt: string;
}

export interface UserProfileResponse {
  userId: string;
  nickname: string;
  profileImage?: string;
  brix: number;
  stats: { completedChallenges: number; totalMeetings: number };
  commonChallenges: Array<{ challengeId: string; name: string }>;
  isVerified: boolean;
  createdAt: string;
}

export interface CheckNicknameParams {
  nickname: string;
}

export interface CheckNicknameResponse {
  nickname: string;
  available: boolean;
}
api/types/account.ts
Copyimport { TransactionType } from './common';

export interface MyAccountResponse {
  accountId: string;
  balance: number;
  availableBalance: number;
  lockedBalance: number;
  bankCode?: string;
  accountNumber?: string;
  accountHolder?: string;
  dailyWithdrawLimit: number;
  dailyWithdrawn: number;
  monthlyWithdrawLimit: number;
  monthlyWithdrawn: number;
}

export interface TransactionListParams {
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export interface Transaction {
  transactionId: string;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description?: string;
  relatedChallenge?: { challengeId: string; name: string };
  createdAt: string;
}

export interface ChargeRequest {
  amount: number;
  returnUrl: string;
}

export interface ChargeResponse {
  chargeId: string;
  amount: number;
  fee: number;
  totalAmount: number;
  paymentUrl: string;
  expiresAt: string;
}

export interface ChargeCallbackRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

export interface ChargeCallbackResponse {
  chargeId: string;
  amount: number;
  fee: number;
  newBalance: number;
  completedAt: string;
}

export interface AccountWithdrawRequest {
  amount: number;
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
}

export interface AccountWithdrawResponse {
  withdrawId: string;
  amount: number;
  fee: number;
  newBalance: number;
  estimatedArrival: string;
}

export interface SupportPaymentRequest {
  challengeId: string;
  amount: number;
}

export interface SupportPaymentResponse {
  transactionId: string;
  challengeId: string;
  amount: number;
  newBalance: number;
  paidAt: string;
}

export interface FeePolicy {
  tier: string;
  minAmount: number;
  maxAmount?: number;
  rate: number;
  description: string;
}

export interface FeePolicyResponse {
  chargeFees: FeePolicy[];
  withdrawFee: number;
  minChargeAmount: number;
  chargeUnit: number;
}
api/types/challenge.ts
Copyimport { ChallengeStatus, ChallengeCategory, MemberRole } from './common';

export interface Challenge {
  challengeId: string;
  name: string;
  description?: string;
  category: ChallengeCategory;
  status: ChallengeStatus;
  leader: { userId: string; nickname: string; profileImage?: string };
  currentMembers: number;
  minMembers: number;
  maxMembers: number;
  monthlyFee: number;
  depositAmount: number;
  balance: number;
  isPublic: boolean;
  isVerified: boolean;
  thumbnailUrl?: string;
  createdAt: string;
  activatedAt?: string;
}

export interface CreateChallengeRequest {
  name: string;
  description?: string;
  category: ChallengeCategory;
  minMembers: number;
  maxMembers: number;
  monthlyFee: number;
  depositAmount: number;
  isPublic?: boolean;
  thumbnailUrl?: string;
  bannerUrl?: string;
}

export interface CreateChallengeResponse {
  challengeId: string;
  name: string;
  status: 'RECRUITING';
  createdAt: string;
}

export interface ChallengeListParams {
  status?: ChallengeStatus;
  category?: ChallengeCategory;
  sort?: 'created' | 'members' | 'popular';
  page?: number;
  size?: number;
}

export interface ChallengeDetailResponse extends Challenge {
  bannerUrl?: string;
  account: { balance: number; lockedDeposit: number; availableBalance: number };
  stats: { totalMeetings: number; totalExpenses: number; completionRate: number };
  myMembership?: { memberId: string; role: MemberRole; joinedAt: string; depositStatus: string; privilegeStatus: string };
}

export interface UpdateChallengeRequest {
  name?: string;
  description?: string;
  isPublic?: boolean;
  thumbnailUrl?: string;
  bannerUrl?: string;
}

export interface UpdateChallengeResponse {
  challengeId: string;
  name: string;
  updatedAt: string;
}

export interface DeleteChallengeResponse {
  challengeId: string;
  deleted: boolean;
  deletedAt: string;
}

export interface MyChallengeListParams {
  role?: MemberRole;
  includeDeleted?: boolean;
  page?: number;
  size?: number;
}

export interface MyChallenge extends Challenge {
  myRole: MemberRole;
  joinedAt: string;
}

export interface ChallengeAccountResponse {
  challengeId: string;
  balance: number;
  lockedDeposit: number;
  availableBalance: number;
  recentTransactions: Array<{ type: string; amount: number; description: string; createdAt: string }>;
  stats: { totalIncome: number; totalExpense: number; thisMonthIncome: number; thisMonthExpense: number };
}

export interface SupportSettingsRequest {
  autoPayEnabled: boolean;
  paymentDay?: number;
}

export interface SupportSettingsResponse {
  challengeId: string;
  autoPayEnabled: boolean;
  paymentDay?: number;
  updatedAt: string;
}
api/types/member.ts
Copyimport { MemberRole, DepositStatus, PrivilegeStatus } from './common';

export interface ChallengeMember {
  memberId: string;
  user: { userId: string; nickname: string; profileImage?: string; brix: number };
  role: MemberRole;
  depositStatus: DepositStatus;
  privilegeStatus: PrivilegeStatus;
  joinedAt: string;
  totalSupportPaid: number;
  lastSupportPaidAt?: string;
}

export interface JoinChallengeResponse {
  memberId: string;
  challengeId: string;
  role: 'FOLLOWER';
  entryFee: number;
  depositAmount: number;
  totalPaid: number;
  joinedAt: string;
}

export interface LeaveChallengeResponse {
  memberId: string;
  challengeId: string;
  refundAmount: number;
  leftAt: string;
}

export interface MemberListParams {
  role?: MemberRole;
  page?: number;
  size?: number;
}

export interface MemberListResponse {
  members: ChallengeMember[];
  summary: { totalMembers: number; leaderCount: number; followerCount: number; activeCount: number; revokedCount: number };
}

export interface MemberDetailResponse extends ChallengeMember {
  supportHistory: Array<{ amount: number; paidAt: string }>;
  attendanceRate: number;
  voteParticipationRate: number;
}

export interface DelegateLeaderRequest {
  newLeaderId: string;
}

export interface DelegateLeaderResponse {
  challengeId: string;
  previousLeader: { userId: string; nickname: string };
  newLeader: { userId: string; nickname: string };
  delegatedAt: string;
}
api/types/meeting.ts
Copyimport { MeetingStatus, AttendanceStatus } from './common';

export interface Meeting {
  meetingId: string;
  challengeId: string;
  title: string;
  description?: string;
  meetingDate: string;
  location?: string;
  status: MeetingStatus;
  createdBy: { userId: string; nickname: string };
  attendees: { confirmed: number; declined: number; pending: number };
  createdAt: string;
}

export interface MeetingListParams {
  status?: MeetingStatus;
  page?: number;
  size?: number;
}

export interface MeetingDetailResponse extends Meeting {
  vote?: { voteId: string; status: string; expiresAt: string };
  attendeeList: Array<{ userId: string; nickname: string; profileImage?: string; status: AttendanceStatus }>;
  myAttendance?: { status: AttendanceStatus; respondedAt?: string };
}

export interface CreateMeetingRequest {
  title: string;
  description?: string;
  meetingDate: string;
  location?: string;
}

export interface CreateMeetingResponse {
  meetingId: string;
  title: string;
  meetingDate: string;
  voteId: string;
  voteExpiresAt: string;
  createdAt: string;
}

export interface UpdateMeetingRequest {
  title?: string;
  description?: string;
  meetingDate?: string;
  location?: string;
}

export interface UpdateMeetingResponse {
  meetingId: string;
  title: string;
  meetingDate: string;
  updatedAt: string;
}

export interface AttendanceRequest {
  status: 'CONFIRMED' | 'DECLINED';
}

export interface AttendanceResponse {
  meetingId: string;
  status: AttendanceStatus;
  respondedAt: string;
}

export interface CompleteMeetingRequest {
  actualAttendees: string[];
}

export interface CompleteMeetingResponse {
  meetingId: string;
  status: 'COMPLETED';
  attendedCount: number;
  noShowCount: number;
  completedAt: string;
}

export interface CancelAttendanceResponse {
  meetingId: string;
  cancelled: boolean;
  cancelledAt: string;
}
api/types/vote.ts
Copyimport { VoteType, VoteStatus, VoteChoice } from './common';

export interface Vote {
  voteId: string;
  challengeId: string;
  type: VoteType;
  title: string;
  description?: string;
  status: VoteStatus;
  createdBy: { userId: string; nickname: string };
  voteCount: { agree: number; disagree: number; abstain: number; total: number };
  requiredApproval: number;
  deadline: string;
  createdAt: string;
}

export interface VoteListParams {
  type?: VoteType;
  status?: VoteStatus;
  page?: number;
  size?: number;
}

export interface VoteDetailResponse extends Vote {
  targetInfo?: { userId?: string; nickname?: string; meetingId?: string; meetingTitle?: string; expenseAmount?: number };
  myVote?: { choice: VoteChoice; votedAt: string };
  eligibleVoters: number;
}

export interface CreateVoteRequest {
  type: VoteType;
  title: string;
  description?: string;
  targetId?: string;
  meetingId?: string;
  deadline: string;
}

export interface CreateVoteResponse {
  voteId: string;
  type: VoteType;
  title: string;
  requiredApproval: number;
  deadline: string;
  createdAt: string;
}

export interface CastVoteRequest {
  choice: VoteChoice;
}

export interface CastVoteResponse {
  voteId: string;
  myVote: VoteChoice;
  voteCount: { agree: number; disagree: number; abstain: number };
  votedAt: string;
}

export interface VoteResultResponse {
  voteId: string;
  type: VoteType;
  title: string;
  status: VoteStatus;
  result: { passed: boolean; agree: number; disagree: number; abstain: number; total: number; requiredApproval: number; approvalRate: number };
  voters: Array<{ userId: string; nickname: string; choice: VoteChoice; votedAt: string }>;
  completedAt: string;
}
api/types/expense.ts
Copyimport { ExpenseStatus, ExpenseCategory } from './common';

export interface Expense {
  expenseId: string;
  challengeId: string;
  meetingId?: string;
  title: string;
  description?: string;
  amount: number;
  category: ExpenseCategory;
  status: ExpenseStatus;
  createdBy: { userId: string; nickname: string };
  vote?: { voteId: string; status: string };
  createdAt: string;
}

export interface ExpenseListParams {
  status?: ExpenseStatus;
  category?: ExpenseCategory;
  page?: number;
  size?: number;
}

export interface ExpenseDetailResponse extends Expense {
  voteDetail?: { voteId: string; agree: number; disagree: number; total: number; status: string };
  executionInfo?: { executedAt: string; executedBy: { userId: string; nickname: string }; ledgerEntryId: string };
}

export interface CreateExpenseRequest {
  title: string;
  description?: string;
  amount: number;
  category: ExpenseCategory;
  meetingId?: string;
}

export interface CreateExpenseResponse {
  expenseId: string;
  title: string;
  amount: number;
  voteId: string;
  voteExpiresAt: string;
  createdAt: string;
}

export interface UpdateExpenseRequest {
  title?: string;
  description?: string;
  amount?: number;
  category?: ExpenseCategory;
}

export interface UpdateExpenseResponse {
  expenseId: string;
  title: string;
  amount: number;
  updatedAt: string;
}

export interface DeleteExpenseResponse {
  expenseId: string;
  deleted: boolean;
  deletedAt: string;
}

export interface ExecuteExpenseResponse {
  expenseId: string;
  amount: number;
  newBalance: number;
  ledgerEntryId: string;
  executedAt: string;
}
api/types/ledger.ts
Copyimport { LedgerType, LedgerCategory } from './common';

export interface LedgerEntry {
  entryId: string;
  type: LedgerType;
  category: LedgerCategory;
  amount: number;
  description?: string;
  relatedUser?: { userId: string; nickname: string };
  approvedBy?: { userId: string; nickname: string };
  createdAt: string;
}

export interface LedgerListParams {
  type?: LedgerType;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export interface LedgerExportParams {
  format?: 'CSV' | 'EXCEL';
  startDate?: string;
  endDate?: string;
}

export interface LedgerExportResponse {
  downloadUrl: string;
  fileName: string;
  expiresAt: string;
}

export interface LedgerSummaryParams {
  period?: 'WEEK' | 'MONTH' | 'YEAR' | 'ALL';
}

export interface LedgerSummaryResponse {
  challengeId: string;
  period: string;
  periodRange: { start: string; end: string };
  balance: { current: number; lockedDeposit: number; available: number };
  summary: { totalIncome: number; totalExpense: number; netAmount: number };
  breakdown: {
    income: { support: number; entryFee: number; other: number };
    expense: { meeting: number; food: number; supplies: number; other: number };
  };
  memberStats: { paidCount: number; unpaidCount: number; totalMembers: number; paymentRate: number };
  trends: { incomeChange: number; expenseChange: number };
}

export interface CreateLedgerRequest {
  type: LedgerType;
  category: LedgerCategory;
  amount: number;
  description: string;
  transactionDate?: string;
}

export interface CreateLedgerResponse {
  entryId: string;
  type: LedgerType;
  category: LedgerCategory;
  amount: number;
  newBalance: number;
  createdBy: { userId: string; nickname: string };
  createdAt: string;
}

export interface UpdateLedgerRequest {
  category?: LedgerCategory;
  amount?: number;
  description?: string;
  transactionDate?: string;
}

export interface UpdateLedgerResponse {
  entryId: string;
  type: LedgerType;
  category: LedgerCategory;
  amount: number;
  previousAmount: number;
  amountDiff: number;
  newBalance: number;
  updatedBy: { userId: string; nickname: string };
  updatedAt: string;
}
api/types/post.ts
Copyexport interface Post {
  postId: string;
  challengeId: string;
  content: string;
  author: { userId: string; nickname: string; profileImage?: string };
  images: Array<{ imageId: string; imageUrl: string; displayOrder: number }>;
  isNotice: boolean;
  isPinned: boolean;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostListParams {
  isNotice?: boolean;
  page?: number;
  size?: number;
}

export interface PostDetailResponse extends Post {
  attachments: Array<{ fileId: string; fileName: string; fileUrl: string; fileSize: number; contentType: string }>;
}

export interface CreatePostRequest {
  content: string;
  imageIds?: string[];
  isNotice?: boolean;
}

export interface CreatePostResponse {
  postId: string;
  content: string;
  author: { userId: string; nickname: string };
  createdAt: string;
}

export interface UpdatePostRequest {
  content?: string;
  imageIds?: string[];
}

export interface UpdatePostResponse {
  postId: string;
  content: string;
  updatedAt: string;
}

export interface DeletePostResponse {
  postId: string;
  deleted: boolean;
  deletedAt: string;
}

export interface ToggleLikeResponse {
  postId: string;
  liked: boolean;
  likeCount: number;
}

export interface PinPostRequest {
  isPinned: boolean;
}

export interface PinPostResponse {
  postId: string;
  isPinned: boolean;
  updatedAt: string;
}

export interface UploadFileResponse {
  fileId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  contentType: string;
}

export interface MyPostListParams {
  page?: number;
  size?: number;
}

export interface MyPost extends Post {
  challengeName: string;
}
api/types/comment.ts
Copyexport interface Comment {
  commentId: string;
  postId: string;
  parentId?: string;
  content: string;
  author: { userId: string; nickname: string; profileImage?: string };
  likeCount: number;
  isLiked?: boolean;
  replies?: Comment[];
  replyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommentListParams {
  page?: number;
  size?: number;
}

export interface CreateCommentRequest {
  content: string;
}

export interface CreateCommentResponse {
  commentId: string;
  postId: string;
  content: string;
  author: { userId: string; nickname: string };
  createdAt: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface UpdateCommentResponse {
  commentId: string;
  content: string;
  updatedAt: string;
}

export interface DeleteCommentResponse {
  commentId: string;
  deleted: boolean;
  deletedAt: string;
}

export interface ToggleCommentLikeResponse {
  commentId: string;
  liked: boolean;
  likeCount: number;
}

export interface CreateReplyRequest {
  content: string;
}

export interface CreateReplyResponse {
  commentId: string;
  parentId: string;
  content: string;
  author: { userId: string; nickname: string };
  createdAt: string;
}
api/types/notification.ts
Copyimport { NotificationType } from './common';

export interface Notification {
  notificationId: string;
  type: NotificationType;
  title: string;
  content: string;
  linkUrl?: string;
  relatedEntity?: { type: string; id: string };
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface NotificationListParams {
  type?: NotificationType;
  isRead?: boolean;
  page?: number;
  size?: number;
}

export interface NotificationListResponse {
  notifications: Notification[];
  unreadCount: number;
}

export type NotificationDetailResponse = Notification;

export interface MarkAsReadResponse {
  notificationId: string;
  isRead: true;
  readAt: string;
}

export interface MarkAllAsReadResponse {
  markedCount: number;
  markedAt: string;
}

export interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  voteNotification: boolean;
  meetingNotification: boolean;
  expenseNotification: boolean;
  snsNotification: boolean;
  systemNotification: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export interface UpdateNotificationSettingsRequest {
  pushEnabled?: boolean;
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  voteNotification?: boolean;
  meetingNotification?: boolean;
  expenseNotification?: boolean;
  snsNotification?: boolean;
  systemNotification?: boolean;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}
api/types/report.ts
Copyimport { ReportReason, ReportStatus, ReportTargetType } from './common';

export interface Report {
  reportId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  createdAt: string;
  reviewedAt?: string;
}

export interface CreateReportRequest {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description?: string;
  evidenceUrls?: string[];
}

export interface CreateReportResponse {
  reportId: string;
  targetType: ReportTargetType;
  targetId: string;
  status: 'PENDING';
  createdAt: string;
}

export interface MyReportListParams {
  status?: ReportStatus;
  page?: number;
  size?: number;
}
api/types/refund.ts
Copyimport { RefundStatus } from './common';

export interface Refund {
  refundId: string;
  userId: string;
  challengeId: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  processedAt?: string;
  createdAt: string;
}

export interface CreateRefundRequest {
  challengeId: string;
  amount: number;
  reason: string;
}

export interface CreateRefundResponse {
  refundId: string;
  challengeId: string;
  amount: number;
  status: 'PENDING';
  createdAt: string;
}

export interface RefundDetailResponse extends Refund {
  processedBy?: { adminId: string; name: string };
  transactionId?: string;
}
api/types/settlement.ts
Copyimport { SettlementStatus } from './common';

export interface Settlement {
  settlementId: string;
  challengeId: string;
  totalAmount: number;
  feeAmount: number;
  netAmount: number;
  status: SettlementStatus;
  processedAt?: string;
  createdAt: string;
}

export interface SettlementDetailResponse extends Settlement {
  processedBy?: { adminId: string; name: string };
  breakdown: {
    totalDeposits: number;
    totalRefunds: number;
    platformFee: number;
    netPayout: number;
  };
  members: Array<{
    userId: string;
    nickname: string;
    payoutAmount: number;
    status: string;
  }>;
}

export interface ProcessSettlementRequest {
  confirm: boolean;
}

export interface ProcessSettlementResponse {
  settlementId: string;
  status: 'COMPLETED';
  totalAmount: number;
  feeAmount: number;
  netAmount: number;
  processedAt: string;
}
api/types/search.ts
Copyexport interface SearchParams {
  q: string;
  type?: 'ALL' | 'CHALLENGE' | 'POST' | 'USER';
  page?: number;
  size?: number;
}

export interface SearchResponse {
  query: string;
  totalResults: number;
  challenges: {
    items: Array<{ challengeId: string; title: string; description?: string; status: string; currentMembers: number }>;
    total: number;
  };
  posts: {
    items: Array<{ postId: string; title: string; challengeTitle: string; author: string }>;
    total: number;
  };
  users: {
    items: Array<{ userId: string; nickname: string; profileImage?: string }>;
    total: number;
  };
}

export interface ChallengeSearchParams {
  q: string;
  category?: string;
  status?: string;
  minDeposit?: number;
  maxDeposit?: number;
  minMembers?: number;
  maxMembers?: number;
  page?: number;
  size?: number;
}

export interface ChallengeSearchResult {
  challengeId: string;
  title: string;
  description?: string;
  category: string;
  status: string;
  leaderNickname: string;
  currentMembers: number;
  maxMembers: number;
  monthlyDeposit: number;
  startDate: string;
  endDate?: string;
  relevanceScore: number;
}

export interface AutocompleteParams {
  q: string;
  type?: 'CHALLENGE' | 'POST' | 'USER';
  limit?: number;
}

export interface AutocompleteResponse {
  suggestions: Array<{ text: string; type: 'CHALLENGE' | 'POST' | 'USER'; id: string; score: number }>;
}
api/types/analytics.ts
Copyexport interface UserActivityParams {
  period?: 'WEEK' | 'MONTH' | 'YEAR';
}

export interface UserActivityResponse {
  userId: string;
  period: string;
  summary: { totalDeposit: number; challengeCount: number; completionRate: number; postCount: number; commentCount: number };
  dailyTrend: Array<{ date: string; depositAmount: number; activityScore: number }>;
  ranking: { depositRank: number; activityRank: number; totalUsers: number };
}

export interface ChallengeAnalyticsResponse {
  challengeId: string;
  overview: { totalDeposit: number; averageDeposit: number; completionRate: number; activeMembers: number };
  trends: {
    depositTrend: Array<{ month: string; amount: number }>;
    memberTrend: Array<{ month: string; joined: number; left: number }>;
  };
  memberAnalysis: Array<{ userId: string; nickname: string; depositRate: number; activityScore: number; rank: number }>;
  predictions: { expectedTotal: number; successProbability: number };
}

export interface DashboardResponse {
  userStats: { totalUsers: number; activeUsers: number; newUsers: number };
  challengeStats: { totalChallenges: number; activeChallenges: number; completedRate: number };
  financialStats: { totalDeposit: number; averageDeposit: number; totalSettled: number };
  topChallenges: Array<{ challengeId: string; title: string; memberCount: number; totalDeposit: number }>;
}

export interface UserReportParams {
  period?: 'MONTH' | 'QUARTER' | 'YEAR';
  format?: 'JSON' | 'PDF';
}

export interface UserReportResponse {
  reportId: string;
  period: string;
  periodRange: { start: string; end: string };
  summary: { totalDeposit: number; totalChallenges: number; completionRate: number; savingsGrowth: number };
  achievements: Array<{ type: string; title: string; description: string; achievedAt: string }>;
  recommendations: Array<{ type: string; title: string; description: string }>;
  downloadUrl?: string;
}

export interface ChallengeRecommendationParams {
  limit?: number;
}

export interface ChallengeRecommendationResponse {
  recommendations: Array<{
    challengeId: string;
    title: string;
    category: string;
    matchScore: number;
    reason: string;
    currentMembers: number;
    maxMembers: number;
    monthlyDeposit: number;
    startDate: string;
  }>;
  basedOn: { userPreferences: string[]; similarUsers: number; algorithm: string };
}

export interface SavingsPlanParams {
  monthlyBudget?: number;
  goalAmount?: number;
  goalPeriod?: number;
}

export interface SavingsPlanResponse {
  plans: Array<{
    planId: string;
    name: string;
    description: string;
    monthlyDeposit: number;
    expectedReturn: number;
    duration: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    matchedChallenges?: Array<{ challengeId: string; title: string; monthlyDeposit: number }>;
  }>;
  analysis: { currentSavingRate: number; recommendedRate: number; projectedGoal: number };
}
api/services/authService.ts
Copyimport apiClient from '../index';
import { ApiResponse } from '../types/common';
import * as T from '../types/auth';

export const authService = {
  signup: (data: T.SignupRequest) =>
    apiClient.post<ApiResponse<T.SignupResponse>>('/auth/signup', data),
  login: (data: T.LoginRequest) =>
    apiClient.post<ApiResponse<T.LoginResponse>>('/auth/login', data),
  logout: (data: T.LogoutRequest) =>
    apiClient.post<ApiResponse<T.LogoutResponse>>('/auth/logout', data),
  refresh: (data: T.RefreshRequest) =>
    apiClient.post<ApiResponse<T.RefreshResponse>>('/auth/refresh', data),
  sendVerificationCode: (data: T.EmailVerifyRequest) =>
    apiClient.post<ApiResponse<T.EmailVerifyResponse>>('/auth/email/verify', data),
  confirmVerificationCode: (data: T.EmailConfirmRequest) =>
    apiClient.post<ApiResponse<T.EmailConfirmResponse>>('/auth/email/confirm', data),
  requestPasswordReset: (data: T.PasswordResetRequestBody) =>
    apiClient.post<ApiResponse<T.PasswordResetRequestResponse>>('/auth/password/reset', data),
  executePasswordReset: (data: T.PasswordResetExecuteRequest) =>
    apiClient.put<ApiResponse<T.PasswordResetExecuteResponse>>('/auth/password/reset', data),
};

export default authService;
api/services/userService.ts
Copyimport apiClient from '../index';
import { ApiResponse } from '../types/common';
import * as T from '../types/user';

export const userService = {
  getMyInfo: () =>
    apiClient.get<ApiResponse<T.MyInfoResponse>>('/users/me'),
  updateMyInfo: (data: T.UpdateMyInfoRequest) =>
    apiClient.put<ApiResponse<T.UpdateMyInfoResponse>>('/users/me', data),
  changePassword: (data: T.ChangePasswordRequest) =>
    apiClient.put<ApiResponse<T.ChangePasswordResponse>>('/users/me/password', data),
  withdraw: (data: T.WithdrawRequest) =>
    apiClient.delete<ApiResponse<T.WithdrawResponse>>('/users/me', { data }),
  getUserProfile: (userId: string) =>
    apiClient.get<ApiResponse<T.UserProfileResponse>>(`/users/${userId}`),
  checkNickname: (params: T.CheckNicknameParams) =>
    apiClient.get<ApiResponse<T.CheckNicknameResponse>>('/users/check-nickname', { params }),
};

export default userService;
api/services/accountService.ts
Copyimport apiClient from '../index';
import { ApiResponse, PaginatedResponse } from '../types/common';
import * as T from '../types/account';

export const accountService = {
  getMyAccount: () =>
    apiClient.get<ApiResponse<T.MyAccountResponse>>('/accounts/me'),
  getTransactions: (params?: T.TransactionListParams) =>
    apiClient.get<ApiResponse<PaginatedResponse<T.Transaction>>>('/accounts/me/transactions', { params }),
  charge: (data: T.ChargeRequest) =>
    apiClient.post<ApiResponse<T.ChargeResponse>>('/accounts/charge', data),
  chargeCallback: (data: T.ChargeCallbackRequest) =>
    apiClient.post<ApiResponse<T.ChargeCallbackResponse>>('/accounts/charge/callback', data),
  withdraw: (data: T.AccountWithdrawRequest) =>
    apiClient.post<ApiResponse<T.AccountWithdrawResponse>>('/accounts/withdraw', data),
  paySupport: (data: T.SupportPaymentRequest) =>
    apiClient.post<ApiResponse<T.SupportPaymentResponse>>('/accounts/support', data),
  getFeePolicy: () =>
    apiClient.get<ApiResponse<T.FeePolicyResponse>>('/accounts/fee-policy'),
};

export default accountService;
api/services/challengeService.ts
Copyimport apiClient from '../index';
import { ApiResponse, PaginatedResponse } from '../types/common';
import * as T from '../types/challenge';

export const challengeService = {
  create: (data: T.CreateChallengeRequest) =>
    apiClient.post<ApiResponse<T.CreateChallengeResponse>>('/challenges', data),
  getList: (params?: T.ChallengeListParams) =>
    apiClient.get<ApiResponse<PaginatedResponse<T.Challenge>>>('/challenges', { params }),
  getDetail: (challengeId: string) =>
    apiClient.get<ApiResponse<T.ChallengeDetailResponse>>(`/challenges/${challengeId}`),
  update: (challengeId: string, data: T.UpdateChallengeRequest) =>
    apiClient.put<ApiResponse<T.UpdateChallengeResponse>>(`/challenges/${challengeId}`, data),
  delete: (challengeId: string) =>
    apiClient.delete<ApiResponse<T.DeleteChallengeResponse>>(`/challenges/${challengeId}`),
  getMyList: (params?: T.MyChallengeListParams) =>
    apiClient.get<ApiResponse<PaginatedResponse<T.MyChallenge>>>('/challenges/me', { params }),
  getAccount: (challengeId: string) =>
    apiClient.get<ApiResponse<T.ChallengeAccountResponse>>(`/challenges/${challengeId}/account`),
  updateSupportSettings: (challengeId: string, data: T.SupportSettingsRequest) =>
    apiClient.put<ApiResponse<T.SupportSettingsResponse>>(`/challenges/${challengeId}/support/settings`, data),
};

export default challengeService;
api/services/memberService.ts
Copyimport apiClient from '../index';
import { ApiResponse } from '../types/common';
import * as T from '../types/member';

export const memberService = {
  join: (challengeId: string) =>
    apiClient.post<ApiResponse<T.JoinChallengeResponse>>(`/challenges/${challengeId}/join`),
  leave: (challengeId: string) =>
    apiClient.delete<ApiResponse<T.LeaveChallengeResponse>>(`/challenges/${challengeId}/leave`),
  getList: (challengeId: string, params?: T.MemberListParams) =>
    apiClient.get<ApiResponse<T.MemberListResponse>>(`/challenges/${challengeId}/members`, { params }),
  getDetail: (challengeId: string, memberId: string) =>
    apiClient.get<ApiResponse<T.MemberDetailResponse>>(`/challenges/${challengeId}/members/${memberId}`),
  delegateLeader: (challengeId: string, data: T.DelegateLeaderRequest) =>
    apiClient.post<ApiResponse<T.DelegateLeaderResponse>>(`/challenges/${challengeId}/delegate`, data),
};

export default memberService;
api/services/meetingService.ts
Copyimport apiClient from '../index';
import { ApiResponse, PaginatedResponse } from '../types/common';
import * as T from '../types/meeting';

export const meetingService = {
  getList: (challengeId: string, params?: T.MeetingListParams) =>
    apiClient.get<ApiResponse<PaginatedResponse<T.Meeting>>>(`/challenges/${challengeId}/meetings`, { params }),
  getDetail: (meetingId: string) =>
    apiClient.get<ApiResponse<T.MeetingDetailResponse>>(`/meetings/${meetingId}`),
  create: (challengeId: string, data: T.CreateMeetingRequest) =>
    apiClient.post<ApiResponse<T.CreateMeetingResponse>>(`/challenges/${challengeId}/meetings`, data),
  update: (meetingId: string, data: T.UpdateMeetingRequest) =>
    apiClient.put<ApiResponse<T.UpdateMeetingResponse>>(`/meetings/${meetingId}`, data),
  setAttendance: (meetingId: string, data: T.AttendanceRequest) =>
    apiClient.post<ApiResponse<T.AttendanceResponse>>(`/meetings/${meetingId}/attendance`, data),
  complete: (meetingId: string, data: T.CompleteMeetingRequest) =>
    apiClient.post<ApiResponse<T.CompleteMeetingResponse>>(`/meetings/${meetingId}/complete`, data),
  cancelAttendance: (meetingId: string) =>
    apiClient.delete<ApiResponse<T.CancelAttendanceResponse>>(`/meetings/${meetingId}/attendance`),
};

export default meetingService;
api/services/voteService.ts
Copyimport apiClient from '../index';
import { ApiResponse, PaginatedResponse } from '../types/common';
import * as T from '../types/vote';

export const voteService = {
  getList: (challengeId: string, params?: T.VoteListParams) =>
    apiClient.get<ApiResponse<PaginatedResponse<T.Vote>>>(`/challenges/${challengeId}/votes`, { params }),
  getDetail: (voteId: string) =>
    apiClient.get<ApiResponse<T.VoteDetailResponse>>(`/votes/${voteId}`),
  create: (challengeId: string, data: T.CreateVoteRequest) =>
    apiClient.post<ApiResponse<T.CreateVoteResponse>>(`/challenges/${challengeId}/votes`, data),
  cast: (voteId: string, data: T.CastVoteRequest) =>
    apiClient.put<ApiResponse<T.CastVoteResponse>>(`/votes/${voteId}/cast`, data),
  getResult: (voteId: string) =>
    apiClient.get<ApiResponse<T.VoteResultResponse>>(`/votes/${voteId}/result`),
};

export default voteService;
api/services/expenseService.ts
Copyimport apiClient from '../index';
import { ApiResponse, PaginatedResponse } from '../types/common';
import * as T from '../types/expense';

export const expenseService = {
  getList: (challengeId: string, params?: T.ExpenseListParams) =>
    apiClient.get<ApiResponse<PaginatedResponse<T.Expense>>>(`/challenges/${challengeId}/expenses`, { params }),
  getDetail: (expenseId: string) =>
    apiClient.get<ApiResponse<T.ExpenseDetailResponse>>(`/expenses/${expenseId}`),
  create: (challengeId: string, data: T.CreateExpenseRequest) =>
    apiClient.post<ApiResponse<T.CreateExpenseResponse>>(`/challenges/${challengeId}/expenses`, data),
  update: (expenseId: string, data: T.UpdateExpenseRequest) =>
    apiClient.put<ApiResponse<T.UpdateExpenseResponse>>(`/expenses/${expenseId}`, data),
  delete: (expenseId: string) =>
    apiClient.delete<ApiResponse<T.DeleteExpenseResponse>>(`/expenses/${expenseId}`),
  execute: (expenseId: string) =>
    apiClient.post<ApiResponse<T.ExecuteExpenseResponse>>(`/expenses/${expenseId}/execute`),
};

export default expenseService;
api/services/ledgerService.ts
Copyimport apiClient from '../index';
import { ApiResponse, PaginatedResponse } from '../types/common';
import * as T from '../types/ledger';

export const ledgerService = {
  getList: (challengeId: string, params?: T.LedgerListParams) =>
    apiClient.get<ApiResponse<PaginatedResponse<T.LedgerEntry>>>(`/challenges/${challengeId}/ledger`, { params }),
  export: (challengeId: string, params?: T.LedgerExportParams) =>
    apiClient.get<ApiResponse<T.LedgerExportResponse>>(`/challenges/${challengeId}/ledger/export`, { params }),
  getSummary: (challengeId: string, params?: T.LedgerSummaryParams) =>
    apiClient.get<ApiResponse<T.LedgerSummaryResponse>>(`/challenges/${challengeId}/ledger/summary`, { params }),
  create: (challengeId: string, data: T.CreateLedgerRequest) =>
    apiClient.post<ApiResponse<T.CreateLedgerResponse>>(`/challenges/${challengeId}/ledger`, data),
  update: (entryId: string, data: T.UpdateLedgerRequest) =>
    apiClient.put<ApiResponse<T.UpdateLedgerResponse>>(`/ledger/${entryId}`, data),
};

export default ledgerService;
api/services/postService.ts
Copyimport apiClient from '../index';
import { ApiResponse, PaginatedResponse } from '../types/common';
import * as T from '../types/post';

export const postService = {
  getList: (challengeId: string, params?: T.PostListParams) =>
    apiClient.get<ApiResponse<PaginatedResponse<T.Post>>>(`/challenges/${challengeId}/posts`, { params }),
  getDetail: (challengeId: string, postId: string) =>
    apiClient.get<ApiResponse<T.PostDetailResponse>>(`/challenges/${challengeId}/posts/${postId}`),
  create: (challengeId: string, data: T.CreatePostRequest) =>
    apiClient.post<ApiResponse<T.CreatePostResponse>>(`/challenges/${challengeId}/posts`, data),
  update: (challengeId: string, postId: string, data: T.UpdatePostRequest) =>
    apiClient.put<ApiResponse<T.UpdatePostResponse>>(`/challenges/${challengeId}/posts/${postId}`, data),
  delete: (challengeId: string, postId: string) =>
    apiClient.delete<ApiResponse<T.DeletePostResponse>>(`/challenges/${challengeId}/posts/${postId}`),
  toggleLike: (challengeId: string, postId: string) =>
    apiClient.post<ApiResponse<T.ToggleLikeResponse>>(`/challenges/${challengeId}/posts/${postId}/like`),
  pin: (challengeId: string, postId: string, data: T.PinPostRequest) =>
    apiClient.put<ApiResponse<T.PinPostResponse>>(`/challenges/${challengeId}/posts/${postId}/pin`, data),
  upload: (challengeId: string, formData: FormData) =>
    apiClient.post<ApiResponse<T.UploadFileResponse>>(`/challenges/${challengeId}/posts/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getMyPosts: (params?: T.MyPostListParams) =>
    apiClient.get<ApiResponse<PaginatedResponse<T.MyPost>>>('/posts/my', { params }),
};

export default postService;
api/services/commentService.ts
Copyimport apiClient from '../index';
import { ApiResponse, PaginatedResponse } from '../types/common';
import * as T from '../types/comment';

export const commentService = {
  getList: (challengeId: string, postId: string, params?: T.CommentListParams) =>
    apiClient.get<ApiResponse<PaginatedResponse<T.Comment>>>(`/challenges/${challengeId}/posts/${postId}/comments`, { params }),
  create: (challengeId: string, postId: string, data: T.CreateCommentRequest) =>
    apiClient.post<ApiResponse<T.CreateCommentResponse>>(`/challenges/${challengeId}/posts/${postId}/comments`, data),
  update: (commentId: string, data: T.UpdateCommentRequest) =>
    apiClient.put<ApiResponse<T.UpdateCommentResponse>>(`/comments/${commentId}`, data),
  delete: (commentId: string) =>
    apiClient.delete<ApiResponse<T.DeleteCommentResponse>>(`/comments/${commentId}`),
  toggleLike: (commentId: string) =>
    apiClient.post<ApiResponse<T.ToggleCommentLikeResponse>>(`/comments/${commentId}/like`),
  createReply: (commentId: string, data: T.CreateReplyRequest) =>
    apiClient.post<ApiResponse<T.CreateReplyResponse>>(`/comments/${commentId}/replies`, data),
};

export default commentService;
api/services/notificationService.ts
Copyimport apiClient from '../index';
import { ApiResponse, PaginatedResponse } from '../types/common';
import * as T from '../types/notification';

export const notificationService = {
  getList: (params?: T.NotificationListParams) =>
    apiClient.get<ApiResponse<T.NotificationListResponse>>('/notifications', { params }),
  getDetail: (notificationId: string) =>
    apiClient.get<ApiResponse<T.NotificationDetailResponse>>(`/notifications/${notificationId}`),
  markAsRead: (notificationId: string) =>
    apiClient.put<ApiResponse<T.MarkAsReadResponse>>(`/notifications/${notificationId}/read`),
  markAllAsRead: () =>
    apiClient.put<ApiResponse<T.MarkAllAsReadResponse>>('/notifications/read-all'),
  getSettings: () =>
    apiClient.get<ApiResponse<T.NotificationSettings>>('/notifications/settings'),
  updateSettings: (data: T.UpdateNotificationSettingsRequest) =>
    apiClient.put<ApiResponse<T.NotificationSettings>>('/notifications/settings', data),
};

export default notificationService;
api/services/reportService.ts
Copyimport apiClient from '../index';
import { ApiResponse, PaginatedResponse } from '../types/common';
import * as T from '../types/report';

export const reportService = {
  create: (data: T.CreateReportRequest) =>
    apiClient.post<ApiResponse<T.CreateReportResponse>>('/reports', data),
  getMyReports: (params?: T.MyReportListParams) =>
    apiClient.get<ApiResponse<PaginatedResponse<T.Report>>>('/reports/my', { params }),
};

export default reportService;
api/services/refundService.ts
Copyimport apiClient from '../index';
import { ApiResponse } from '../types/common';
import * as T from '../types/refund';

export const refundService = {
  create: (data: T.CreateRefundRequest) =>
    apiClient.post<ApiResponse<T.CreateRefundResponse>>('/refunds', data),
  getDetail: (refundId: string) =>
    apiClient.get<ApiResponse<T.RefundDetailResponse>>(`/refunds/${refundId}`),
};

export default refundService;
api/services/settlementService.ts
Copyimport apiClient from '../index';
import { ApiResponse } from '../types/common';
import * as T from '../types/settlement';

export const settlementService = {
  getDetail: (challengeId: string) =>
    apiClient.get<ApiResponse<T.SettlementDetailResponse>>(`/challenges/${challengeId}/settlement`),
  process: (challengeId: string, data: T.ProcessSettlementRequest) =>
    apiClient.post<ApiResponse<T.ProcessSettlementResponse>>(`/challenges/${challengeId}/settlement/process`, data),
};

export default settlementService;
api/services/searchService.ts (Django)
Copyimport { djangoClient } from '../index';
import { ApiResponse, PaginatedResponse } from '../types/common';
import * as T from '../types/search';

export const searchService = {
  search: (params: T.SearchParams) =>
    djangoClient.get<ApiResponse<T.SearchResponse>>('/search', { params }),
  searchChallenges: (params: T.ChallengeSearchParams) =>
    djangoClient.get<ApiResponse<PaginatedResponse<T.ChallengeSearchResult>>>('/search/challenges', { params }),
  autocomplete: (params: T.AutocompleteParams) =>
    djangoClient.get<ApiResponse<T.AutocompleteResponse>>('/search/autocomplete', { params }),
};

export default searchService;
api/services/analyticsService.ts (Django)
Copyimport { djangoClient } from '../index';
import { ApiResponse } from '../types/common';
import * as T from '../types/analytics';

export const analyticsService = {
  getUserActivity: (params?: T.UserActivityParams) =>
    djangoClient.get<ApiResponse<T.UserActivityResponse>>('/analytics/user/activity', { params }),
  getChallengeAnalytics: (challengeId: string) =>
    djangoClient.get<ApiResponse<T.ChallengeAnalyticsResponse>>(`/analytics/challenge/${challengeId}`),
  getDashboard: () =>
    djangoClient.get<ApiResponse<T.DashboardResponse>>('/analytics/dashboard'),
  getUserReport: (params?: T.UserReportParams) =>
    djangoClient.get<ApiResponse<T.UserReportResponse>>('/analytics/user/report', { params }),
  getRecommendations: (params?: T.ChallengeRecommendationParams) =>
    djangoClient.get<ApiResponse<T.ChallengeRecommendationResponse>>('/recommendations/challenges', { params }),
  getSavingsPlan: (params?: T.SavingsPlanParams) =>
    djangoClient.get<ApiResponse<T.SavingsPlanResponse>>('/recommendations/savings-plan', { params }),
};

export default analyticsService;