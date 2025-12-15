import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse, delay } from "msw";
import { PostCard } from "./PostCard";
import type { Post } from "@/types/post";
import { BrowserRouter } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * PostCard 컴포넌트 스토리
 *
 * SNS 포스트를 표시하는 카드 컴포넌트로, 다음 기능을 제공합니다:
 * - 포스트 내용 및 미디어 표시
 * - 좋아요 / 댓글 인터랙션
 * - 인용 포스트 표시
 * - 긴 내용 자동 축약
 * - 작성자의 경우 수정/삭제 메뉴
 */
const meta: Meta<typeof PostCard> = {
  title: "Domain/SNS/PostCard",
  component: PostCard,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <BrowserRouter>
        <div className="max-w-2xl mx-auto">
          <Story />
        </div>
      </BrowserRouter>
    ),
  ],
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof PostCard>;

// Mock User Data
const mockAuthor = {
  id: "user-1",
  nickname: "홍길동",
  profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=user1",
  creditScore: 850,
};

const mockOtherUser = {
  id: "user-2",
  nickname: "김철수",
  profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=user2",
  creditScore: 720,
};

// Mock Post Data
const createMockPost = (overrides?: Partial<Post>): Post => ({
  id: "post-1",
  gyeId: "gye-1",
  authorId: "user-1",
  author: mockAuthor,
  type: "normal",
  content: "안녕하세요! WooriDo 플랫폼에 첫 포스트를 작성합니다. 🎉",
  media: [],
  likeCount: 42,
  commentCount: 7,
  isLiked: false,
  createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
  updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  ...overrides,
});

// MSW Handlers
const handlers = [
  // Like Post
  http.post(`${API_BASE_URL}/api/v1/posts/:postId/like`, async ({ params }) => {
    await delay(300);
    return HttpResponse.json({ success: true });
  }),

  // Unlike Post
  http.delete(`${API_BASE_URL}/api/v1/posts/:postId/like`, async ({ params }) => {
    await delay(300);
    return HttpResponse.json({ success: true });
  }),

  // Delete Post
  http.delete(`${API_BASE_URL}/api/v1/posts/:postId`, async ({ params }) => {
    await delay(500);
    return HttpResponse.json({ success: true });
  }),
];

/**
 * 기본 포스트 카드
 */
export const Default: Story = {
  args: {
    post: createMockPost(),
  },
  parameters: {
    msw: { handlers },
  },
};

/**
 * 좋아요를 누른 포스트
 */
export const Liked: Story = {
  args: {
    post: createMockPost({
      isLiked: true,
      likeCount: 43,
    }),
  },
  parameters: {
    msw: { handlers },
  },
};

/**
 * 이미지 1개가 포함된 포스트
 */
export const WithSingleImage: Story = {
  args: {
    post: createMockPost({
      content: "오늘 점심 메뉴입니다! 😋",
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
    }),
  },
  parameters: {
    msw: { handlers },
  },
};

/**
 * 이미지 2개가 포함된 포스트
 */
export const WithTwoImages: Story = {
  args: {
    post: createMockPost({
      content: "주말 여행 사진들 📸",
      media: [
        {
          id: "media-1",
          type: "image",
          url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
          width: 800,
          height: 600,
          size: 153600,
          order: 0,
        },
        {
          id: "media-2",
          type: "image",
          url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop",
          width: 800,
          height: 600,
          size: 163800,
          order: 1,
        },
      ],
    }),
  },
  parameters: {
    msw: { handlers },
  },
};

/**
 * 이미지 3개가 포함된 포스트
 */
export const WithThreeImages: Story = {
  args: {
    post: createMockPost({
      content: "계 모임 사진 공유합니다!",
      media: [
        {
          id: "media-1",
          type: "image",
          url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop",
          width: 800,
          height: 600,
          size: 153600,
          order: 0,
        },
        {
          id: "media-2",
          type: "image",
          url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop",
          width: 800,
          height: 600,
          size: 163800,
          order: 1,
        },
        {
          id: "media-3",
          type: "image",
          url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop",
          width: 800,
          height: 600,
          size: 173900,
          order: 2,
        },
      ],
    }),
  },
  parameters: {
    msw: { handlers },
  },
};

/**
 * 이미지 4개 이상 포함된 포스트
 */
export const WithMultipleImages: Story = {
  args: {
    post: createMockPost({
      content: "계 활동 하이라이트 모음 🎯",
      media: [
        {
          id: "media-1",
          type: "image",
          url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&h=600&fit=crop",
          width: 800,
          height: 600,
          size: 153600,
          order: 0,
        },
        {
          id: "media-2",
          type: "image",
          url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
          width: 800,
          height: 600,
          size: 163800,
          order: 1,
        },
        {
          id: "media-3",
          type: "image",
          url: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=600&fit=crop",
          width: 800,
          height: 600,
          size: 173900,
          order: 2,
        },
        {
          id: "media-4",
          type: "image",
          url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop",
          width: 800,
          height: 600,
          size: 183500,
          order: 3,
        },
        {
          id: "media-5",
          type: "image",
          url: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=600&fit=crop",
          width: 800,
          height: 600,
          size: 193200,
          order: 4,
        },
      ],
    }),
  },
  parameters: {
    msw: { handlers },
  },
};

/**
 * 동영상이 포함된 포스트
 */
export const WithVideo: Story = {
  args: {
    post: createMockPost({
      content: "계 모임 영상을 공유합니다!",
      media: [
        {
          id: "media-1",
          type: "video",
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          thumbnailUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=600&fit=crop",
          width: 1920,
          height: 1080,
          size: 5253880,
          order: 0,
        },
      ],
    }),
  },
  parameters: {
    msw: { handlers },
  },
};

/**
 * 긴 내용의 포스트 (자동 축약)
 */
export const WithLongContent: Story = {
  args: {
    post: createMockPost({
      content: `안녕하세요 여러분! 오늘은 계 관리에 대한 제 생각을 공유하고 싶습니다.

첫째, 정기적인 소통이 가장 중요합니다. 계원들과 자주 연락하고 상황을 공유해야 합니다.

둘째, 투명한 회계 관리가 필수입니다. 모든 거래 내역을 명확히 기록하고 공유해야 신뢰가 쌓입니다.

셋째, 규칙을 명확히 정하고 지켜야 합니다. 모호한 부분이 있으면 나중에 문제가 될 수 있습니다.

넷째, 유연성도 필요합니다. 상황에 따라 적절히 조정하는 지혜가 필요합니다.

다섯째, 계원들의 의견을 존중해야 합니다. 민주적인 의사결정이 중요합니다.`,
      likeCount: 128,
      commentCount: 34,
    }),
  },
  parameters: {
    msw: { handlers },
  },
};

/**
 * 인용 포스트
 */
export const WithQuotedPost: Story = {
  args: {
    post: createMockPost({
      id: "post-2",
      content: "정말 좋은 의견이네요! 저도 동의합니다. 👍",
      type: "quote",
      quotedPostId: "post-1",
      quotedPost: {
        id: "post-1",
        content: "계 관리는 신뢰가 가장 중요하다고 생각합니다. 여러분 생각은 어떠신가요?",
        author: mockOtherUser,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        media: [
          {
            id: "media-q1",
            type: "image",
            url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=600&fit=crop",
            width: 800,
            height: 600,
            size: 153600,
            order: 0,
          },
        ],
      },
    }),
  },
  parameters: {
    msw: { handlers },
  },
};

/**
 * 높은 인기의 포스트
 */
export const HighEngagement: Story = {
  args: {
    post: createMockPost({
      content: "계 모임 장소 투표합니다! 댓글로 의견 남겨주세요 📍",
      likeCount: 856,
      commentCount: 142,
      isLiked: true,
    }),
  },
  parameters: {
    msw: { handlers },
  },
};

/**
 * 방금 작성된 포스트
 */
export const JustPosted: Story = {
  args: {
    post: createMockPost({
      content: "방금 작성한 포스트입니다!",
      likeCount: 0,
      commentCount: 0,
      createdAt: new Date(Date.now() - 1000 * 10).toISOString(), // 10 seconds ago
      updatedAt: new Date(Date.now() - 1000 * 10).toISOString(),
    }),
  },
  parameters: {
    msw: { handlers },
  },
};

/**
 * 오래된 포스트
 */
export const OldPost: Story = {
  args: {
    post: createMockPost({
      content: "한 달 전 작성한 포스트입니다.",
      likeCount: 234,
      commentCount: 56,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    }),
  },
  parameters: {
    msw: { handlers },
  },
};

/**
 * 댓글 영역 표시
 */
export const WithCommentsSection: Story = {
  args: {
    post: createMockPost({
      content: "댓글 기능 테스트용 포스트입니다.",
      commentCount: 5,
    }),
    showComments: true,
  },
  parameters: {
    msw: { handlers },
  },
};

/**
 * 로딩 시뮬레이션 (좋아요 느린 응답)
 */
export const SlowLikeResponse: Story = {
  args: {
    post: createMockPost(),
  },
  parameters: {
    msw: {
      handlers: [
        http.post(`${API_BASE_URL}/api/v1/posts/:postId/like`, async () => {
          await delay(2000); // 2초 지연
          return HttpResponse.json({ success: true });
        }),
        ...handlers.slice(1),
      ],
    },
  },
};

/**
 * 좋아요 실패 시뮬레이션
 */
export const LikeError: Story = {
  args: {
    post: createMockPost(),
  },
  parameters: {
    msw: {
      handlers: [
        http.post(`${API_BASE_URL}/api/v1/posts/:postId/like`, async () => {
          await delay(500);
          return HttpResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
          );
        }),
        ...handlers.slice(1),
      ],
    },
  },
};
