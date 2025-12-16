import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse, delay } from "msw";
import { AnnouncementBanner } from "./AnnouncementBanner";
import type { Announcement } from "@/types/announcement";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * AnnouncementBanner 컴포넌트 스토리
 *
 * 계 공지사항을 표시하는 배너 컴포넌트로, 다음 기능을 제공합니다:
 * - 우선순위별 색상 구분 (긴급/중요/일반)
 * - 고정 표시
 * - 미읽음 표시 (NEW 뱃지)
 * - 긴 내용 자동 축약/펼치기
 * - 읽음 처리
 * - 닫기 버튼 (선택적)
 */
const meta: Meta<typeof AnnouncementBanner> = {
  title: "Domain/SNS/AnnouncementBanner",
  component: AnnouncementBanner,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-2xl mx-auto p-4">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    onDismiss: { action: "dismissed" },
    onClick: { action: "clicked" },
  },
};

export default meta;
type Story = StoryObj<typeof AnnouncementBanner>;

// Mock Data
const mockAuthor = {
  id: "user-1",
  nickname: "계주",
  profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
};

const createMockAnnouncement = (
  overrides?: Partial<Announcement>
): Announcement => ({
  id: "announcement-1",
  gyeId: "gye-1",
  authorId: "user-1",
  author: mockAuthor,
  title: "공지사항 제목",
  content: "공지사항 내용입니다.",
  priority: "normal",
  isPinned: false,
  viewCount: 0,
  isRead: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// MSW Handlers
const handlers = [
  http.post(
    `${API_BASE_URL}/api/v1/announcements/:announcementId/read`,
    async () => {
      await delay(300);
      return HttpResponse.json({ success: true });
    }
  ),
];

/**
 * 일반 공지사항
 */
export const Normal: Story = {
  args: {
    announcement: createMockAnnouncement({
      title: "정기 모임 안내",
      content: "다음 주 토요일 오후 2시에 정기 모임이 있습니다.",
      priority: "normal",
      viewCount: 45,
      isRead: true,
    }),
  },
  parameters: {
    msw: { handlers },
  },
};

/**
 * 중요 공지사항
 */
export const Important: Story = {
  args: {
    announcement: createMockAnnouncement({
      title: "⚠️ 계 규칙 변경 안내",
      content: "계 운영 규칙이 일부 변경되었습니다. 모든 계원분들은 필독 부탁드립니다.",
      priority: "important",
      viewCount: 123,
      isRead: false,
    }),
  },
  parameters: {
    msw: { handlers },
  },
};

/**
 * 긴급 공지사항
 */
export const Urgent: Story = {
  args: {
    announcement: createMockAnnouncement({
      title: "🚨 긴급 공지",
      content: "이번 달 계 일정이 변경되었습니다. 기존 15일에서 20일로 연기됩니다.",
      priority: "urgent",
      viewCount: 234,
      isRead: false,
    }),
  },
  parameters: {
    msw: { handlers },
  },
};

/**
 * 고정된 공지사항
 */
export const Pinned: Story = {
  args: {
    announcement: createMockAnnouncement({
      title: "📌 필독 공지사항",
      content: "계 운영에 관한 중요 공지사항입니다. 모든 계원분들은 꼭 읽어주세요.",
      priority: "important",
      isPinned: true,
      viewCount: 456,
      isRead: true,
    }),
  },
  parameters: {
    msw: { handlers },
  },
};

/**
 * 미읽음 공지사항 (NEW 뱃지)
 */
export const Unread: Story = {
  args: {
    announcement: createMockAnnouncement({
      title: "새로운 공지사항",
      content: "방금 작성된 공지사항입니다.",
      priority: "normal",
      viewCount: 12,
      isRead: false,
    }),
  },
  parameters: {
    msw: { handlers },
  },
};

/**
 * 긴급 + 고정 + 미읽음
 */
export const UrgentPinnedUnread: Story = {
  args: {
    announcement: createMockAnnouncement({
      title: "🚨 매우 중요한 긴급 공지",
      content: "즉시 확인이 필요한 긴급 공지사항입니다. 모든 계원분들은 꼭 읽어주세요!",
      priority: "urgent",
      isPinned: true,
      viewCount: 5,
      isRead: false,
    }),
  },
  parameters: {
    msw: { handlers },
  },
};

/**
 * 긴 내용의 공지사항
 */
export const LongContent: Story = {
  args: {
    announcement: createMockAnnouncement({
      title: "계 운영 가이드라인 업데이트",
      content: `안녕하세요 계원 여러분,

이번에 계 운영 가이드라인이 업데이트되었습니다. 주요 변경 사항은 다음과 같습니다:

1. 월 납입금 납부 기한이 매월 5일에서 10일로 변경되었습니다.
2. 계 모임 장소가 강남역 인근으로 고정되었습니다.
3. 긴급 연락망이 새로 구축되었습니다.

자세한 내용은 계 규정 문서를 참고해주세요. 궁금하신 사항이 있으시면 언제든지 문의 주시기 바랍니다.

감사합니다.`,
      priority: "important",
      viewCount: 89,
      isRead: false,
    }),
  },
  parameters: {
    msw: { handlers },
  },
};

/**
 * 닫기 버튼이 있는 공지사항
 */
export const WithDismiss: Story = {
  args: {
    announcement: createMockAnnouncement({
      title: "일시적 공지사항",
      content: "닫기 버튼으로 이 공지사항을 숨길 수 있습니다.",
      priority: "normal",
      viewCount: 23,
      isRead: false,
    }),
    onDismiss: () => console.log("dismissed"),
  },
  parameters: {
    msw: { handlers },
  },
};

/**
 * 높은 조회수
 */
export const HighViewCount: Story = {
  args: {
    announcement: createMockAnnouncement({
      title: "인기 공지사항",
      content: "많은 분들이 확인하신 공지사항입니다.",
      priority: "normal",
      viewCount: 1234,
      isRead: true,
    }),
  },
  parameters: {
    msw: { handlers },
  },
};

/**
 * 조회수 0
 */
export const ZeroViews: Story = {
  args: {
    announcement: createMockAnnouncement({
      title: "방금 작성된 공지",
      content: "아직 아무도 확인하지 않은 새 공지사항입니다.",
      priority: "normal",
      viewCount: 0,
      isRead: false,
    }),
  },
  parameters: {
    msw: { handlers },
  },
};

/**
 * 오래된 공지사항
 */
export const OldAnnouncement: Story = {
  args: {
    announcement: createMockAnnouncement({
      title: "지난 달 공지사항",
      content: "한 달 전에 작성된 공지사항입니다.",
      priority: "normal",
      viewCount: 345,
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    }),
  },
  parameters: {
    msw: { handlers },
  },
};

/**
 * 매우 긴 제목
 */
export const LongTitle: Story = {
  args: {
    announcement: createMockAnnouncement({
      title:
        "🚨 매우 중요하고 긴급한 공지사항입니다 - 모든 계원분들은 꼭 읽어주세요",
      content: "제목이 긴 공지사항의 예시입니다.",
      priority: "urgent",
      viewCount: 67,
      isRead: false,
    }),
  },
  parameters: {
    msw: { handlers },
  },
};

/**
 * 읽음 처리 느린 응답
 */
export const SlowMarkAsRead: Story = {
  args: {
    announcement: createMockAnnouncement({
      title: "클릭해서 읽음 처리 테스트",
      content: "이 공지사항을 클릭하면 읽음 처리됩니다 (느린 응답).",
      priority: "normal",
      viewCount: 45,
      isRead: false,
    }),
  },
  parameters: {
    msw: {
      handlers: [
        http.post(
          `${API_BASE_URL}/api/v1/announcements/:announcementId/read`,
          async () => {
            await delay(2000); // 2초 지연
            return HttpResponse.json({ success: true });
          }
        ),
      ],
    },
  },
};

/**
 * 읽음 처리 실패
 */
export const MarkAsReadError: Story = {
  args: {
    announcement: createMockAnnouncement({
      title: "읽음 처리 실패 시뮬레이션",
      content: "이 공지사항을 클릭하면 읽음 처리가 실패합니다.",
      priority: "normal",
      viewCount: 23,
      isRead: false,
    }),
  },
  parameters: {
    msw: {
      handlers: [
        http.post(
          `${API_BASE_URL}/api/v1/announcements/:announcementId/read`,
          async () => {
            await delay(500);
            return HttpResponse.json(
              { error: "Internal Server Error" },
              { status: 500 }
            );
          }
        ),
      ],
    },
  },
};

/**
 * 우선순위별 비교
 */
export const PriorityComparison: Story = {
  render: () => (
    <div className="space-y-4">
      <AnnouncementBanner
        announcement={createMockAnnouncement({
          title: "🚨 긴급 공지",
          content: "긴급 우선순위 공지사항입니다.",
          priority: "urgent",
          isRead: false,
        })}
      />
      <AnnouncementBanner
        announcement={createMockAnnouncement({
          id: "announcement-2",
          title: "⚠️ 중요 공지",
          content: "중요 우선순위 공지사항입니다.",
          priority: "important",
          isRead: false,
        })}
      />
      <AnnouncementBanner
        announcement={createMockAnnouncement({
          id: "announcement-3",
          title: "일반 공지",
          content: "일반 우선순위 공지사항입니다.",
          priority: "normal",
          isRead: true,
        })}
      />
    </div>
  ),
  parameters: {
    msw: { handlers },
  },
};

/**
 * 모바일 뷰
 */
export const MobileView: Story = {
  args: {
    announcement: createMockAnnouncement({
      title: "모바일에서 확인하는 공지사항",
      content: "모바일 화면에서의 공지사항 표시를 확인합니다.",
      priority: "important",
      isPinned: true,
      viewCount: 78,
      isRead: false,
    }),
    onDismiss: () => console.log("dismissed"),
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    msw: { handlers },
  },
};
