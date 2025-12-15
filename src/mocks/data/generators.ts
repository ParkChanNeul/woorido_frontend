// @ts-nocheck
/**
 * Mock 데이터 생성기
 * 실제와 유사한 데이터를 생성하여 MSW handlers에서 사용
 */

import type {
  User,
  Gye,
  GyeDetail,
  GyeMember,
  Post,
  Comment,
  Announcement,
  WalletBalance,
} from "@/types";

// UUID 생성
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 랜덤 날짜 생성 (과거 N일 이내)
function randomDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString();
}

// 랜덤 숫자 (min ~ max)
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 랜덤 배열 요소 선택
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ============================================
// User Mock Data
// ============================================

const MOCK_NAMES = [
  "김민수",
  "이지은",
  "박준형",
  "최서연",
  "정동훈",
  "강미래",
  "윤채원",
  "임태양",
  "송하늘",
  "한별",
];

const MOCK_PROFILE_IMAGES = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=3",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=4",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=5",
];

export function generateMockUser(override?: Partial<User>): User {
  const id = override?.id || generateId();
  const nickname = override?.nickname || randomChoice(MOCK_NAMES);

  return {
    id,
    email: `${nickname.toLowerCase()}@example.com`,
    nickname,
    profileImage: randomChoice(MOCK_PROFILE_IMAGES),
    creditScore: randomInt(300, 850),
    phoneNumber: "010-0000-0000",
    createdAt: randomDate(365),
    ...override,
  };
}

// 고정 사용자 (일관성 위해)
export const MOCK_USERS: User[] = Array.from({ length: 10 }, (_, i) =>
  generateMockUser({
    id: `user-${i + 1}`,
    nickname: MOCK_NAMES[i],
    profileImage: MOCK_PROFILE_IMAGES[i % MOCK_PROFILE_IMAGES.length],
  })
);

export const CURRENT_USER = MOCK_USERS[0]; // 현재 로그인 사용자

// ============================================
// Gye Mock Data
// ============================================

const GYE_NAMES = [
  "주말 등산 모임 계",
  "직장인 저축 계",
  "대학 동창 계",
  "독서 모임 계",
  "헬스장 회원 계",
];

const GYE_DESCRIPTIONS = [
  "매월 10만원씩 모아서 여행 가요!",
  "함께 저축하고 목표를 달성해봐요",
  "오랜만에 다시 모인 우리 동창들",
  "책 읽고 토론하며 성장하는 모임",
  "운동과 건강, 그리고 재테크까지",
];

export function generateMockGye(override?: Partial<Gye>): Gye {
  const id = override?.id || generateId();
  const name = override?.name || randomChoice(GYE_NAMES);

  return {
    id,
    name,
    description: randomChoice(GYE_DESCRIPTIONS),
    status: randomChoice(["recruiting", "ongoing", "completed"] as const),
    category: randomChoice(["savings", "investment", "social", "emergency"] as const),
    hostUserId: CURRENT_USER.id,
    currentMembers: randomInt(5, 15),
    maxMembers: randomInt(10, 20),
    monthlyAmount: randomInt(5, 20) * 10000,
    totalAmount: randomInt(100, 500) * 10000,
    depositAmount: randomInt(1, 5) * 10000,
    cycleMonths: randomInt(6, 24),
    startDate: randomDate(60),
    endDate: randomDate(-180), // 미래 날짜
    isPublic: randomChoice([true, false]),
    createdAt: randomDate(90),
    updatedAt: randomDate(30),
    ...override,
  };
}

export const MOCK_GYES: Gye[] = Array.from({ length: 5 }, (_, i) =>
  generateMockGye({
    id: `gye-${i + 1}`,
    name: GYE_NAMES[i],
    description: GYE_DESCRIPTIONS[i],
  })
);

export function generateMockGyeDetail(gye: Gye): GyeDetail {
  return {
    ...gye,
    host: CURRENT_USER,
    memberCount: gye.currentMembers,
    totalDeposit: gye.depositAmount * gye.currentMembers,
    nextPaymentDate: randomDate(-30),
  };
}

export function generateMockGyeMember(gyeId: string, user: User): GyeMember {
  return {
    id: generateId(),
    gyeId,
    userId: user.id,
    user: {
      id: user.id,
      nickname: user.nickname,
      profileImage: user.profileImage,
      creditScore: user.creditScore,
    },
    role: user.id === CURRENT_USER.id ? "host" : "member",
    joinedAt: randomDate(60),
    paidCount: randomInt(0, 5),
    totalPaid: randomInt(0, 50) * 10000,
    depositPaid: true,
    status: "active",
  };
}

// ============================================
// Post Mock Data
// ============================================

const POST_CONTENTS = [
  "오늘 첫 모임 정말 즐거웠어요! 다들 열정적이셔서 좋았습니다 😊",
  "다음 주 토요일 오전 10시 등산 어때요? 날씨도 좋을 것 같아요",
  "이번 달 목표 금액 달성했습니다! 다들 고생 많으셨어요 👏",
  "추천 책 공유합니다. 정말 인생책이에요!",
  "오늘 헬스장에서 새로운 운동법 배웠어요. 공유할게요",
  "월말 정산 결과 나왔습니다. 확인 부탁드려요",
  "다음 모임 장소 투표하실 분~",
  "감사합니다! 이 모임 덕분에 많이 성장했어요",
];

export function generateMockPost(gyeId: string, override?: Partial<Post>): Post {
  const id = override?.id || generateId();
  const author = randomChoice(MOCK_USERS);
  const hasMedia = Math.random() > 0.7;

  return {
    id,
    gyeId,
    authorId: author.id,
    author: {
      id: author.id,
      nickname: author.nickname,
      profileImage: author.profileImage,
      creditScore: author.creditScore,
    },
    type: Math.random() > 0.9 ? "quote" : "normal",
    content: randomChoice(POST_CONTENTS),
    media: hasMedia
      ? [
          {
            id: generateId(),
            type: "image",
            url: `https://picsum.photos/seed/${generateId()}/800/600`,
            thumbnailUrl: `https://picsum.photos/seed/${generateId()}/200/150`,
          },
        ]
      : [],
    likeCount: randomInt(0, 50),
    commentCount: randomInt(0, 20),
    isLiked: Math.random() > 0.7,
    createdAt: randomDate(30),
    updatedAt: randomDate(15),
    ...override,
  };
}

export function generateMockPosts(gyeId: string, count: number): Post[] {
  return Array.from({ length: count }, () => generateMockPost(gyeId));
}

// ============================================
// Comment Mock Data
// ============================================

const COMMENT_CONTENTS = [
  "좋은 생각이에요!",
  "저도 동의합니다 👍",
  "언제 시작하나요?",
  "참여하고 싶어요!",
  "감사합니다!",
  "정말 도움이 되네요",
  "저도 그렇게 생각해요",
  "궁금한 점이 있는데요...",
];

export function generateMockComment(postId: string, override?: Partial<Comment>): Comment {
  const id = override?.id || generateId();
  const author = randomChoice(MOCK_USERS);

  return {
    id,
    postId,
    authorId: author.id,
    author: {
      id: author.id,
      nickname: author.nickname,
      profileImage: author.profileImage,
      creditScore: author.creditScore,
    },
    content: randomChoice(COMMENT_CONTENTS),
    replyCount: randomInt(0, 5),
    likeCount: randomInt(0, 10),
    isLiked: Math.random() > 0.8,
    createdAt: randomDate(20),
    updatedAt: randomDate(10),
    ...override,
  };
}

export function generateMockComments(postId: string, count: number): Comment[] {
  return Array.from({ length: count }, () => generateMockComment(postId));
}

// ============================================
// Announcement Mock Data
// ============================================

const ANNOUNCEMENT_TITLES = [
  "📢 다음 모임 일정 공지",
  "⚠️ 필독! 계약 변경 사항 안내",
  "🎉 이번 달 우수 회원 선정",
  "📋 월간 보고서 확인 요청",
  "🔔 입금 기한 알림",
];

const ANNOUNCEMENT_CONTENTS = [
  "다음 모임은 12월 20일 토요일 오전 10시에 진행됩니다.\n장소: 강남역 2번 출구 스타벅스\n\n참석 여부 댓글로 남겨주세요!",
  "계약 조건이 일부 변경되었습니다.\n\n변경 사항:\n- 월 납입금: 10만원 → 12만원\n- 기간: 12개월 → 18개월\n\n자세한 내용은 첨부 문서를 확인해주세요.",
  "이번 달 우수 회원으로 김민수님이 선정되셨습니다!\n\n적극적인 참여와 성실한 납입에 감사드립니다 👏",
  "11월 월간 보고서가 업로드되었습니다.\n\n- 총 입금액\n- 총 출금액\n- 현재 잔액\n\n확인 후 문의사항 있으시면 댓글 남겨주세요.",
  "이번 달 입금 기한이 3일 남았습니다.\n\n아직 미입금하신 분들은 서둘러 주세요!",
];

export function generateMockAnnouncement(
  gyeId: string,
  override?: Partial<Announcement>
): Announcement {
  const id = override?.id || generateId();
  const priority = randomChoice(["normal", "important", "urgent"] as const);

  return {
    id,
    gyeId,
    authorId: CURRENT_USER.id,
    author: {
      id: CURRENT_USER.id,
      nickname: CURRENT_USER.nickname,
      profileImage: CURRENT_USER.profileImage,
    },
    title: randomChoice(ANNOUNCEMENT_TITLES),
    content: randomChoice(ANNOUNCEMENT_CONTENTS),
    priority,
    isPinned: priority === "urgent" || Math.random() > 0.7,
    viewCount: randomInt(10, 100),
    isRead: Math.random() > 0.5,
    createdAt: randomDate(30),
    updatedAt: randomDate(15),
    ...override,
  };
}

export function generateMockAnnouncements(gyeId: string, count: number): Announcement[] {
  return Array.from({ length: count }, () => generateMockAnnouncement(gyeId));
}

// ============================================
// Wallet Mock Data
// ============================================

export function generateMockWallet(): WalletBalance {
  return {
    totalBalance: randomInt(100, 1000) * 10000,
    availableBalance: randomInt(50, 500) * 10000,
    lockedBalance: randomInt(10, 100) * 10000,
    depositBalance: randomInt(5, 50) * 10000,
    currency: "KRW",
    lastUpdated: new Date().toISOString(),
  };
}

// ============================================
// Ledger Mock Data
// ============================================

export interface LedgerTransaction {
  id: string;
  type: "deposit" | "withdrawal" | "transfer";
  amount: number;
  balance: number;
  description: string;
  userId: string;
  user: Pick<User, "id" | "nickname" | "profileImage">;
  createdAt: string;
}

const LEDGER_DESCRIPTIONS = [
  "월 정기 납입",
  "보증금 입금",
  "수익금 분배",
  "벌금 납부",
  "긴급 출금",
  "이자 지급",
];

export function generateMockLedgerTransaction(gyeId: string): LedgerTransaction {
  const user = randomChoice(MOCK_USERS);
  const type = randomChoice(["deposit", "withdrawal", "transfer"] as const);

  return {
    id: generateId(),
    type,
    amount: randomInt(1, 50) * 10000,
    balance: randomInt(100, 1000) * 10000,
    description: randomChoice(LEDGER_DESCRIPTIONS),
    userId: user.id,
    user: {
      id: user.id,
      nickname: user.nickname,
      profileImage: user.profileImage,
    },
    createdAt: randomDate(90),
  };
}

export function generateMockLedgerTimeline(gyeId: string, count: number): LedgerTransaction[] {
  return Array.from({ length: count }, () => generateMockLedgerTransaction(gyeId));
}

export interface LedgerSummary {
  totalDeposit: number;
  totalWithdrawal: number;
  currentBalance: number;
  transactionCount: number;
  lastTransactionDate: string;
}

export function generateMockLedgerSummary(): LedgerSummary {
  const totalDeposit = randomInt(500, 2000) * 10000;
  const totalWithdrawal = randomInt(100, 500) * 10000;

  return {
    totalDeposit,
    totalWithdrawal,
    currentBalance: totalDeposit - totalWithdrawal,
    transactionCount: randomInt(50, 200),
    lastTransactionDate: randomDate(5),
  };
}
