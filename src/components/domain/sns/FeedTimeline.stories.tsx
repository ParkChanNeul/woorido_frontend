import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse, delay } from "msw";
import { FeedTimeline } from "./FeedTimeline";
import type { Post, PostListResponse } from "@/types/post";
import type { Announcement, AnnouncementListResponse } from "@/types/announcement";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * FeedTimeline 컴포넌트 스토리
 *
 * 계 타임라인 피드를 표시하는 컨테이너 컴포넌트로, 다음 기능을 제공합니다:
 * - 포스트 목록 표시 (무한 스크롤)
 * - 공지사항 표시
 * - 정렬 (최신순/인기순)
 * - 필터링 (전체/공지사항만)
 * - 포스트 작성 버튼 (모바일 FAB, 데스크톱 인라인)
 */
const meta: Meta<typeof FeedTimeline> = {
  title: "Domain/SNS/FeedTimeline",
  component: FeedTimeline,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-2xl mx-auto min-h-screen">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof FeedTimeline>;

// Mock Data Generators
const mockAuthor = {
  id: "user-1",
  nickname: "홍길동",
  profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=user1",
  creditScore: 850,
};

const mockAuthors = [
  mockAuthor,
  {
    id: "user-2",
    nickname: "김철수",
    profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=user2",
    creditScore: 720,
  },
  {
    id: "user-3",
    nickname: "이영희",
    profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=user3",
    creditScore: 680,
  },
  {
    id: "user-4",
    nickname: "박민수",
    profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=user4",
    creditScore: 790,
  },
];

const createMockPost = (id: number, overrides?: Partial<Post>): Post => {
  const author = mockAuthors[id % mockAuthors.length] || mockAuthor;
  const minutesAgo = id * 15;

  return {
    id: `post-${id}`,
    gyeId: "gye-1",
    authorId: author.id,
    author,
    type: "normal",
    content: `샘플 포스트 #${id} - 계 활동에 대한 내용입니다.`,
    media: [],
    likeCount: Math.floor(Math.random() * 100),
    commentCount: Math.floor(Math.random() * 50),
    isLiked: Math.random() > 0.7,
    createdAt: new Date(Date.now() - 1000 * 60 * minutesAgo).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * minutesAgo).toISOString(),
    ...overrides,
  };
};

const createMockAnnouncement = (
  id: number,
  overrides?: Partial<Announcement>
): Announcement => ({
  id: `announcement-${id}`,
  gyeId: "gye-1",
  authorId: "user-1",
  author: {
    id: "user-1",
    nickname: "계주",
    profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
  },
  title: `공지사항 #${id}`,
  content: `공지사항 내용입니다. ${id}번째 공지사항입니다.`,
  priority: id === 1 ? "urgent" : id === 2 ? "important" : "normal",
  isPinned: id === 1,
  viewCount: Math.floor(Math.random() * 200),
  isRead: id > 2,
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * id).toISOString(),
  updatedAt: new Date(Date.now() - 1000 * 60 * 60 * id).toISOString(),
  ...overrides,
});

// Generate mock posts
const generateMockPosts = (count: number): Post[] =>
  Array.from({ length: count }, (_, i) => createMockPost(i + 1));

// Generate posts with images
const generatePostsWithImages = (): Post[] => [
  createMockPost(1, {
    content: "오늘 점심 메뉴 추천! 😋",
    media: [
      {
        id: "media-1",
        type: "image",
        url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop",
        width: 800,
        height: 600,
        size: 153600,
        order: 0,
      },
    ],
    likeCount: 45,
    commentCount: 12,
  }),
  createMockPost(2, {
    content: "계 모임 사진 공유합니다! 📸",
    media: [
      {
        id: "media-2",
        type: "image",
        url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop",
        width: 800,
        height: 600,
        size: 153600,
        order: 0,
      },
      {
        id: "media-3",
        type: "image",
        url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop",
        width: 800,
        height: 600,
        size: 163800,
        order: 1,
      },
    ],
    likeCount: 78,
    commentCount: 23,
  }),
  createMockPost(3, {
    content: "다음 달 계 일정 확인 부탁드립니다!",
    likeCount: 34,
    commentCount: 8,
  }),
];

// MSW Handlers
const createFeedHandlers = (posts: Post[]) => [
  // Get Feed (Infinite Query)
  http.get(`${API_BASE_URL}/api/v1/gyes/:gyeId/feed`, async ({ request, params }) => {
    await delay(500);

    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor");
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);

    const startIndex = cursor ? parseInt(cursor, 10) : 0;
    const endIndex = startIndex + limit;
    const pagePosts = posts.slice(startIndex, endIndex);

    const response: PostListResponse = {
      posts: pagePosts,
      total: posts.length,
      hasMore: endIndex < posts.length,
      nextCursor: endIndex < posts.length ? String(endIndex) : undefined,
    };

    return HttpResponse.json(response);
  }),

  // Get Announcements
  http.get(`${API_BASE_URL}/api/v1/gyes/:gyeId/announcements`, async () => {
    await delay(300);

    const announcements = [
      createMockAnnouncement(1, {
        title: "🚨 긴급 공지",
        content: "이번 달 계 일정이 변경되었습니다. 확인 부탁드립니다.",
        priority: "urgent",
        isPinned: true,
        isRead: false,
      }),
      createMockAnnouncement(2, {
        title: "중요 안내사항",
        content: "계 규칙이 업데이트되었습니다.",
        priority: "important",
        isPinned: false,
        isRead: false,
      }),
      createMockAnnouncement(3, {
        title: "정기 모임 안내",
        content: "다음 정기 모임은 다음 주 토요일입니다.",
        priority: "normal",
        isPinned: false,
        isRead: true,
      }),
    ];

    const response: AnnouncementListResponse = {
      announcements,
      total: announcements.length,
    };

    return HttpResponse.json(response);
  }),

  // Mark Announcement as Read
  http.post(
    `${API_BASE_URL}/api/v1/announcements/:announcementId/read`,
    async () => {
      await delay(200);
      return HttpResponse.json({ success: true });
    }
  ),

  // Like Post
  http.post(`${API_BASE_URL}/api/v1/posts/:postId/like`, async () => {
    await delay(300);
    return HttpResponse.json({ success: true });
  }),

  // Unlike Post
  http.delete(`${API_BASE_URL}/api/v1/posts/:postId/like`, async () => {
    await delay(300);
    return HttpResponse.json({ success: true });
  }),
];

/**
 * 기본 타임라인 (여러 포스트)
 */
export const Default: Story = {
  args: {
    gyeId: "gye-1",
  },
  parameters: {
    msw: {
      handlers: createFeedHandlers(generateMockPosts(15)),
    },
  },
};

/**
 * 이미지가 포함된 포스트들
 */
export const WithImages: Story = {
  args: {
    gyeId: "gye-1",
  },
  parameters: {
    msw: {
      handlers: createFeedHandlers(generatePostsWithImages()),
    },
  },
};

/**
 * 빈 피드 (포스트 없음)
 */
export const Empty: Story = {
  args: {
    gyeId: "gye-1",
  },
  parameters: {
    msw: {
      handlers: createFeedHandlers([]),
    },
  },
};

/**
 * 로딩 상태 (느린 응답)
 */
export const Loading: Story = {
  args: {
    gyeId: "gye-1",
  },
  parameters: {
    msw: {
      handlers: [
        http.get(`${API_BASE_URL}/api/v1/gyes/:gyeId/feed`, async () => {
          await delay(5000); // 5초 지연
          return HttpResponse.json({
            posts: generateMockPosts(10),
            total: 10,
            hasMore: false,
          });
        }),
        ...createFeedHandlers(generateMockPosts(10)).slice(1),
      ],
    },
  },
};

/**
 * 무한 스크롤 (많은 포스트)
 */
export const InfiniteScroll: Story = {
  args: {
    gyeId: "gye-1",
  },
  parameters: {
    msw: {
      handlers: createFeedHandlers(generateMockPosts(50)),
    },
  },
};

/**
 * 미읽은 공지사항 있음
 */
export const WithUnreadAnnouncements: Story = {
  args: {
    gyeId: "gye-1",
  },
  parameters: {
    msw: {
      handlers: [
        ...createFeedHandlers(generateMockPosts(10)),
        http.get(`${API_BASE_URL}/api/v1/gyes/:gyeId/announcements`, async () => {
          await delay(300);

          const announcements = [
            createMockAnnouncement(1, {
              title: "🚨 긴급 공지",
              content:
                "이번 달 계 일정이 변경되었습니다. 확인 부탁드립니다. 변경 내역은 다음과 같습니다: 날짜가 15일에서 20일로 변경되었습니다.",
              priority: "urgent",
              isPinned: true,
              isRead: false,
            }),
            createMockAnnouncement(2, {
              title: "⚠️ 중요 안내사항",
              content: "계 규칙이 업데이트되었습니다. 모든 계원분들은 필독 부탁드립니다.",
              priority: "important",
              isPinned: false,
              isRead: false,
            }),
            createMockAnnouncement(3, {
              title: "📢 정기 모임 안내",
              content: "다음 정기 모임은 다음 주 토요일 오후 2시입니다.",
              priority: "normal",
              isPinned: false,
              isRead: false,
            }),
          ];

          return HttpResponse.json({
            announcements,
            total: announcements.length,
          });
        }),
      ],
    },
  },
};

/**
 * 공지사항만 표시 (필터링된 상태)
 */
export const AnnouncementsOnly: Story = {
  args: {
    gyeId: "gye-1",
  },
  parameters: {
    msw: {
      handlers: [
        ...createFeedHandlers(generateMockPosts(10)),
        http.get(`${API_BASE_URL}/api/v1/gyes/:gyeId/announcements`, async () => {
          await delay(300);

          const announcements = [
            createMockAnnouncement(1, {
              title: "🚨 긴급 공지",
              content: "이번 달 계 일정이 변경되었습니다.",
              priority: "urgent",
              isPinned: true,
              isRead: false,
            }),
            createMockAnnouncement(2, {
              title: "중요 안내사항",
              content: "계 규칙이 업데이트되었습니다.",
              priority: "important",
              isPinned: false,
              isRead: true,
            }),
            createMockAnnouncement(3, {
              title: "정기 모임 안내",
              content: "다음 정기 모임은 다음 주 토요일입니다.",
              priority: "normal",
              isPinned: false,
              isRead: true,
            }),
            createMockAnnouncement(4, {
              title: "월간 보고서",
              content: "이번 달 계 활동 보고서입니다.",
              priority: "normal",
              isPinned: false,
              isRead: true,
            }),
          ];

          return HttpResponse.json({
            announcements,
            total: announcements.length,
          });
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    // Note: You can add Storybook interactions here to click the "공지사항" tab
    // For now, users will need to manually click the tab in Storybook
  },
};

/**
 * 인기 포스트 (높은 참여도)
 */
export const PopularPosts: Story = {
  args: {
    gyeId: "gye-1",
  },
  parameters: {
    msw: {
      handlers: createFeedHandlers([
        createMockPost(1, {
          content: "계 모임 장소 투표합니다! 댓글로 의견 남겨주세요 📍",
          likeCount: 156,
          commentCount: 89,
          isLiked: true,
        }),
        createMockPost(2, {
          content: "이번 달 우수 계원 투표 시작합니다! 🏆",
          likeCount: 142,
          commentCount: 67,
          isLiked: false,
        }),
        createMockPost(3, {
          content: "계 활동 1주년 기념 이벤트 안내 🎉",
          likeCount: 203,
          commentCount: 112,
          isLiked: true,
        }),
      ]),
    },
  },
};

/**
 * 에러 상태 (API 실패)
 */
export const ErrorState: Story = {
  args: {
    gyeId: "gye-1",
  },
  parameters: {
    msw: {
      handlers: [
        http.get(`${API_BASE_URL}/api/v1/gyes/:gyeId/feed`, async () => {
          await delay(500);
          return HttpResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
          );
        }),
        ...createFeedHandlers([]).slice(1),
      ],
    },
  },
};

/**
 * 모바일 뷰 (FAB 버튼 표시)
 */
export const MobileView: Story = {
  args: {
    gyeId: "gye-1",
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    msw: {
      handlers: createFeedHandlers(generateMockPosts(10)),
    },
  },
};

/**
 * 데스크톱 뷰 (인라인 작성 버튼)
 */
export const DesktopView: Story = {
  args: {
    gyeId: "gye-1",
  },
  parameters: {
    viewport: {
      defaultViewport: "desktop",
    },
    msw: {
      handlers: createFeedHandlers(generateMockPosts(10)),
    },
  },
};
