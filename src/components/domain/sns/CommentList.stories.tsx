import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse, delay } from "msw";
import { CommentList } from "./CommentList";
import type { Comment, CommentListResponse } from "@/types/comment";
import { BrowserRouter } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * CommentList 컴포넌트 스토리
 *
 * 포스트의 댓글 목록을 표시하는 컴포넌트로, 다음 기능을 제공합니다:
 * - 댓글 목록 표시
 * - 대댓글 (1단계 중첩) 지원
 * - 댓글 작성/답글 작성
 * - 댓글 좋아요
 * - 답글 펼치기/접기
 */
const meta: Meta<typeof CommentList> = {
  title: "Domain/SNS/CommentList",
  component: CommentList,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <BrowserRouter>
        <div className="max-w-2xl mx-auto p-4">
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
type Story = StoryObj<typeof CommentList>;

// Mock Data
const mockAuthors = [
  {
    id: "user-1",
    nickname: "홍길동",
    profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=user1",
    creditScore: 850,
  },
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

const createMockComment = (
  id: number,
  overrides?: Partial<Comment>
): Comment => {
  const author = mockAuthors[id % mockAuthors.length] || mockAuthors[0];
  const minutesAgo = id * 5;

  return {
    id: `comment-${id}`,
    postId: "post-1",
    authorId: author.id,
    author,
    content: `댓글 내용 #${id} - 좋은 글 감사합니다!`,
    parentCommentId: undefined,
    replyCount: 0,
    likeCount: Math.floor(Math.random() * 20),
    isLiked: Math.random() > 0.7,
    createdAt: new Date(Date.now() - 1000 * 60 * minutesAgo).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * minutesAgo).toISOString(),
    ...overrides,
  };
};

const createMockReply = (
  parentId: string,
  id: number,
  overrides?: Partial<Comment>
): Comment => {
  const author = mockAuthors[id % mockAuthors.length] || mockAuthors[0];

  return {
    id: `reply-${parentId}-${id}`,
    postId: "post-1",
    authorId: author.id,
    author,
    content: `답글 내용 #${id} - 좋은 의견이시네요!`,
    parentCommentId: parentId,
    replyCount: 0,
    likeCount: Math.floor(Math.random() * 10),
    isLiked: false,
    createdAt: new Date(Date.now() - 1000 * 60 * (id * 3)).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * (id * 3)).toISOString(),
    ...overrides,
  };
};

// MSW Handlers
const createCommentHandlers = (
  topLevelComments: Comment[],
  repliesMap: Record<string, Comment[]> = {}
) => [
  // Get Comments (Top-level only)
  http.get(`${API_BASE_URL}/api/v1/posts/:postId/comments`, async ({ request }) => {
    await delay(500);

    const url = new URL(request.url);
    const parentCommentId = url.searchParams.get("parentCommentId");

    // If requesting top-level comments
    if (!parentCommentId) {
      const response: CommentListResponse = {
        comments: topLevelComments,
        total: topLevelComments.length,
        hasMore: false,
      };
      return HttpResponse.json(response);
    }

    // If requesting replies
    const replies = repliesMap[parentCommentId] || [];
    const response: CommentListResponse = {
      comments: replies,
      total: replies.length,
      hasMore: false,
    };
    return HttpResponse.json(response);
  }),

  // Create Comment
  http.post(`${API_BASE_URL}/api/v1/comments`, async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as {
      postId: string;
      content: string;
      parentCommentId?: string;
    };

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      postId: body.postId,
      authorId: "user-1",
      author: mockAuthors[0],
      content: body.content,
      parentCommentId: body.parentCommentId,
      replyCount: 0,
      likeCount: 0,
      isLiked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(newComment, { status: 201 });
  }),

  // Like Comment
  http.post(`${API_BASE_URL}/api/v1/comments/:commentId/like`, async () => {
    await delay(300);
    return HttpResponse.json({ success: true });
  }),

  // Unlike Comment
  http.delete(`${API_BASE_URL}/api/v1/comments/:commentId/like`, async () => {
    await delay(300);
    return HttpResponse.json({ success: true });
  }),

  // Delete Comment
  http.delete(`${API_BASE_URL}/api/v1/comments/:commentId`, async () => {
    await delay(500);
    return HttpResponse.json({ success: true });
  }),
];

/**
 * 빈 댓글 목록
 */
export const Empty: Story = {
  args: {
    postId: "post-1",
  },
  parameters: {
    msw: {
      handlers: createCommentHandlers([]),
    },
  },
};

/**
 * 기본 댓글 목록
 */
export const Default: Story = {
  args: {
    postId: "post-1",
  },
  parameters: {
    msw: {
      handlers: createCommentHandlers([
        createMockComment(1, {
          content: "좋은 글 감사합니다! 많은 도움이 되었어요.",
          likeCount: 5,
        }),
        createMockComment(2, {
          content: "저도 동의합니다. 특히 중간 부분이 인상적이었어요.",
          likeCount: 3,
        }),
        createMockComment(3, {
          content: "질문이 있는데요, 추가 설명 부탁드려도 될까요?",
          likeCount: 1,
        }),
      ]),
    },
  },
};

/**
 * 답글이 있는 댓글
 */
export const WithReplies: Story = {
  args: {
    postId: "post-1",
  },
  parameters: {
    msw: {
      handlers: createCommentHandlers(
        [
          createMockComment(1, {
            content: "이 포스트에 대해 질문이 있습니다.",
            replyCount: 3,
            likeCount: 8,
          }),
          createMockComment(2, {
            content: "정말 유용한 정보네요!",
            replyCount: 1,
            likeCount: 5,
          }),
          createMockComment(3, {
            content: "다음 포스트도 기대하겠습니다!",
            replyCount: 0,
            likeCount: 2,
          }),
        ],
        {
          "comment-1": [
            createMockReply("comment-1", 1, {
              content: "답변 드립니다. 자세한 내용은 다음과 같습니다...",
              likeCount: 4,
            }),
            createMockReply("comment-1", 2, {
              content: "추가로 설명드리면, 이런 방법도 있습니다.",
              likeCount: 2,
            }),
            createMockReply("comment-1", 3, {
              content: "감사합니다! 이해가 잘 되었어요.",
              likeCount: 1,
            }),
          ],
          "comment-2": [
            createMockReply("comment-2", 1, {
              content: "감사합니다! 도움이 되어서 기쁩니다.",
              likeCount: 3,
            }),
          ],
        }
      ),
    },
  },
};

/**
 * 많은 답글이 있는 댓글
 */
export const WithManyReplies: Story = {
  args: {
    postId: "post-1",
  },
  parameters: {
    msw: {
      handlers: createCommentHandlers(
        [
          createMockComment(1, {
            content: "이 주제에 대해 토론해볼까요?",
            replyCount: 8,
            likeCount: 15,
          }),
        ],
        {
          "comment-1": [
            createMockReply("comment-1", 1, {
              content: "좋은 주제네요! 제 생각은...",
            }),
            createMockReply("comment-1", 2, {
              content: "저는 다른 의견인데요...",
            }),
            createMockReply("comment-1", 3, {
              content: "두 분 의견 모두 일리가 있네요.",
            }),
            createMockReply("comment-1", 4, {
              content: "추가로 이런 관점도 고려해볼 수 있을 것 같아요.",
            }),
            createMockReply("comment-1", 5, {
              content: "좋은 토론이네요! 배우는 게 많습니다.",
            }),
            createMockReply("comment-1", 6, {
              content: "관련 자료를 공유드립니다.",
            }),
            createMockReply("comment-1", 7, {
              content: "정말 유익한 대화였습니다.",
            }),
            createMockReply("comment-1", 8, {
              content: "다음에도 이런 토론 기대하겠습니다!",
            }),
          ],
        }
      ),
    },
  },
};

/**
 * 긴 내용의 댓글
 */
export const WithLongComments: Story = {
  args: {
    postId: "post-1",
  },
  parameters: {
    msw: {
      handlers: createCommentHandlers([
        createMockComment(1, {
          content: `정말 유익한 글이었습니다. 특히 중간 부분에서 설명하신 내용이 인상적이었는데요,

저도 비슷한 경험이 있어서 공감이 많이 되었습니다. 예전에 계 모임을 운영할 때 비슷한 상황을 겪었었는데, 그때 이런 정보가 있었다면 훨씬 수월했을 것 같습니다.

혹시 추가로 궁금한 점이 있는데, 이런 상황에서는 어떻게 대처하시는지 여쭤봐도 될까요?`,
          likeCount: 12,
        }),
        createMockComment(2, {
          content:
            "간단하게 의견 남깁니다. 좋은 글 감사합니다!",
          likeCount: 3,
        }),
      ]),
    },
  },
};

/**
 * 좋아요가 많은 댓글
 */
export const PopularComments: Story = {
  args: {
    postId: "post-1",
  },
  parameters: {
    msw: {
      handlers: createCommentHandlers([
        createMockComment(1, {
          content: "정말 핵심을 찌르는 내용이네요! 👍",
          likeCount: 89,
          isLiked: true,
        }),
        createMockComment(2, {
          content: "이 부분은 정말 중요한 것 같습니다. 모든 계원분들이 꼭 읽어보셨으면 좋겠네요.",
          likeCount: 56,
          isLiked: false,
        }),
        createMockComment(3, {
          content: "계 운영하면서 가장 도움이 된 글입니다.",
          likeCount: 42,
          isLiked: true,
        }),
      ]),
    },
  },
};

/**
 * 방금 작성된 댓글
 */
export const RecentComments: Story = {
  args: {
    postId: "post-1",
  },
  parameters: {
    msw: {
      handlers: createCommentHandlers([
        createMockComment(1, {
          content: "방금 댓글 작성했습니다!",
          likeCount: 0,
          isLiked: false,
          createdAt: new Date(Date.now() - 1000 * 10).toISOString(), // 10 seconds ago
        }),
        createMockComment(2, {
          content: "1분 전에 작성한 댓글입니다.",
          likeCount: 1,
          isLiked: false,
          createdAt: new Date(Date.now() - 1000 * 60).toISOString(), // 1 minute ago
        }),
        createMockComment(3, {
          content: "5분 전에 작성한 댓글입니다.",
          likeCount: 2,
          isLiked: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
        }),
      ]),
    },
  },
};

/**
 * 다양한 신용점수를 가진 사용자들의 댓글
 */
export const DiverseCreditScores: Story = {
  args: {
    postId: "post-1",
  },
  parameters: {
    msw: {
      handlers: createCommentHandlers([
        createMockComment(1, {
          author: { ...mockAuthors[0], creditScore: 950 },
          content: "신용점수 950점 사용자의 댓글입니다.",
        }),
        createMockComment(2, {
          author: { ...mockAuthors[1], creditScore: 750 },
          content: "신용점수 750점 사용자의 댓글입니다.",
        }),
        createMockComment(3, {
          author: { ...mockAuthors[2], creditScore: 550 },
          content: "신용점수 550점 사용자의 댓글입니다.",
        }),
        createMockComment(4, {
          author: { ...mockAuthors[3], creditScore: 350 },
          content: "신용점수 350점 사용자의 댓글입니다.",
        }),
      ]),
    },
  },
};

/**
 * 로딩 상태
 */
export const Loading: Story = {
  args: {
    postId: "post-1",
  },
  parameters: {
    msw: {
      handlers: [
        http.get(`${API_BASE_URL}/api/v1/posts/:postId/comments`, async () => {
          await delay(5000); // 5초 지연
          return HttpResponse.json({
            comments: [],
            total: 0,
            hasMore: false,
          });
        }),
      ],
    },
  },
};

/**
 * 댓글 작성 느린 응답
 */
export const SlowCommentSubmit: Story = {
  args: {
    postId: "post-1",
  },
  parameters: {
    msw: {
      handlers: [
        ...createCommentHandlers([
          createMockComment(1, {
            content: "기존 댓글입니다.",
          }),
        ]),
        http.post(`${API_BASE_URL}/api/v1/comments`, async ({ request }) => {
          await delay(3000); // 3초 지연
          const body = (await request.json()) as {
            postId: string;
            content: string;
          };

          return HttpResponse.json(
            {
              id: `comment-${Date.now()}`,
              postId: body.postId,
              authorId: "user-1",
              author: mockAuthors[0],
              content: body.content,
              parentCommentId: undefined,
              replyCount: 0,
              likeCount: 0,
              isLiked: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            { status: 201 }
          );
        }),
      ],
    },
  },
};

/**
 * API 에러 상태
 */
export const ErrorState: Story = {
  args: {
    postId: "post-1",
  },
  parameters: {
    msw: {
      handlers: [
        http.get(`${API_BASE_URL}/api/v1/posts/:postId/comments`, async () => {
          await delay(500);
          return HttpResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
          );
        }),
      ],
    },
  },
};

/**
 * 중첩된 답글 예시
 */
export const NestedRepliesExample: Story = {
  args: {
    postId: "post-1",
  },
  parameters: {
    msw: {
      handlers: createCommentHandlers(
        [
          createMockComment(1, {
            content: "계 모임 장소에 대한 의견을 나눠볼까요?",
            replyCount: 5,
            likeCount: 12,
          }),
          createMockComment(2, {
            content: "다음 달 일정은 어떻게 되나요?",
            replyCount: 2,
            likeCount: 6,
          }),
        ],
        {
          "comment-1": [
            createMockReply("comment-1", 1, {
              content: "강남역 근처가 어떨까요? 접근성이 좋을 것 같습니다.",
              likeCount: 5,
            }),
            createMockReply("comment-1", 2, {
              content: "저는 신촌이 더 좋을 것 같아요. 주차하기 편해요.",
              likeCount: 3,
            }),
            createMockReply("comment-1", 3, {
              content: "두 곳 다 좋네요! 투표로 결정하는 건 어떨까요?",
              likeCount: 7,
            }),
            createMockReply("comment-1", 4, {
              content: "좋은 생각입니다! 투표 진행해주세요.",
              likeCount: 2,
            }),
            createMockReply("comment-1", 5, {
              content: "투표 생성했습니다. 확인 부탁드려요!",
              likeCount: 4,
            }),
          ],
          "comment-2": [
            createMockReply("comment-2", 1, {
              content: "15일로 예정되어 있습니다.",
              likeCount: 3,
            }),
            createMockReply("comment-2", 2, {
              content: "감사합니다! 캘린더에 등록했습니다.",
              likeCount: 1,
            }),
          ],
        }
      ),
    },
  },
};
