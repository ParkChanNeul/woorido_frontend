/**
 * Demo - 계 전용 SNS 피드 페이지
 * Post, Comment, Announcement 기능 시연
 */

// @ts-nocheck
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Heart, MessageCircle, Send, Image as ImageIcon, MoreVertical } from "lucide-react";
import {
  useGyeFeed,
  useCreatePost,
  useLikePost,
  useUnlikePost,
  useCreateComment,
  useAnnouncements,
} from "@/hooks/queries";
import { usePostEditorStore, useFeedFilterStore } from "@/hooks/stores";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Post, Comment } from "@/types";

// 포스트 카드 컴포넌트
function PostCard({ post }: { post: Post }) {
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();
  const [showComments, setShowComments] = useState(false);

  const handleLike = () => {
    if (post.isLiked) {
      unlikePost.mutate(post.id);
    } else {
      likePost.mutate(post.id);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={post.author.profileImage} />
              <AvatarFallback>{post.author.nickname[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{post.author.nickname}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(post.createdAt).toLocaleDateString("ko-KR")}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>수정</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">삭제</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>
        <p className="whitespace-pre-wrap">{post.content}</p>

        {post.media.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {post.media.map((media) => (
              <img
                key={media.id}
                src={media.url}
                alt=""
                className="rounded-lg object-cover w-full h-48"
              />
            ))}
          </div>
        )}

        {post.quotedPost && (
          <Card className="mt-4 bg-muted">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={post.quotedPost.author.profileImage} />
                  <AvatarFallback>{post.quotedPost.author.nickname[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{post.quotedPost.author.nickname}</span>
              </div>
              <p className="text-sm line-clamp-3">{post.quotedPost.content}</p>
            </CardContent>
          </Card>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
          <span>좋아요 {post.likeCount}개</span>
          <span>댓글 {post.commentCount}개</span>
        </div>

        <Separator />

        <div className="flex items-center gap-2 w-full">
          <Button
            variant="ghost"
            size="sm"
            className={cn("flex-1", post.isLiked && "text-red-500")}
            onClick={handleLike}
          >
            <Heart className={cn("h-4 w-4 mr-2", post.isLiked && "fill-current")} />
            좋아요
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            댓글
          </Button>
        </div>

        {showComments && <CommentSection postId={post.id} />}
      </CardFooter>
    </Card>
  );
}

// 댓글 섹션 컴포넌트
function CommentSection({ postId }: { postId: string }) {
  const { data } = usePostComments(postId, { limit: 10 });
  const createComment = useCreateComment();
  const [commentText, setCommentText] = useState("");

  const handleSubmit = () => {
    if (!commentText.trim()) return;

    createComment.mutate(
      {
        postId,
        content: commentText,
      },
      {
        onSuccess: () => {
          setCommentText("");
        },
      }
    );
  };

  return (
    <div className="w-full space-y-3">
      <Separator />

      {/* 댓글 작성 */}
      <div className="flex gap-2">
        <Textarea
          placeholder="댓글을 입력하세요..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="min-h-[60px]"
        />
        <Button onClick={handleSubmit} disabled={!commentText.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* 댓글 목록 */}
      <div className="space-y-3">
        {data?.pages.flatMap((page) => page.comments).map((comment) => (
          <CommentCard key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}

// 댓글 카드 컴포넌트
function CommentCard({ comment }: { comment: Comment }) {
  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.author.profileImage} />
        <AvatarFallback>{comment.author.nickname[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="bg-muted rounded-lg p-3">
          <p className="font-semibold text-sm">{comment.author.nickname}</p>
          <p className="text-sm mt-1">{comment.content}</p>
        </div>
        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
          <button className="hover:text-foreground">좋아요 {comment.likeCount}</button>
          <button className="hover:text-foreground">답글</button>
          <span>{new Date(comment.createdAt).toLocaleDateString("ko-KR")}</span>
        </div>
      </div>
    </div>
  );
}

// 포스트 작성 컴포넌트
function PostComposer({ gyeId }: { gyeId: string }) {
  const createPost = useCreatePost();
  const { content, setContent, reset } = usePostEditorStore();

  const handleSubmit = () => {
    if (!content.trim()) return;

    createPost.mutate(
      {
        gyeId,
        content,
      },
      {
        onSuccess: () => {
          reset();
        },
      }
    );
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <Textarea
          placeholder="무슨 생각을 하고 계신가요?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[100px] mb-4"
        />
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon">
            <ImageIcon className="h-5 w-5" />
          </Button>
          <Button onClick={handleSubmit} disabled={!content.trim() || createPost.isPending}>
            {createPost.isPending ? "게시 중..." : "게시"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// 공지사항 목록 컴포넌트
function AnnouncementList({ gyeId }: { gyeId: string }) {
  const { data: announcements } = useAnnouncements(gyeId);

  const priorityColors = {
    urgent: "destructive",
    important: "default",
    normal: "secondary",
  } as const;

  const priorityLabels = {
    urgent: "긴급",
    important: "중요",
    normal: "일반",
  };

  return (
    <div className="space-y-3">
      {announcements?.map((announcement) => (
        <Card key={announcement.id} className={announcement.isPinned ? "border-primary" : ""}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={priorityColors[announcement.priority]}>
                    {priorityLabels[announcement.priority]}
                  </Badge>
                  {announcement.isPinned && <Badge variant="outline">📌 고정됨</Badge>}
                </div>
                <h3 className="font-bold text-lg">{announcement.title}</h3>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{announcement.content}</p>
            <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
              <span>{announcement.author.nickname}</span>
              <span>조회 {announcement.viewCount}</span>
              <span>{new Date(announcement.createdAt).toLocaleDateString("ko-KR")}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// 메인 페이지 컴포넌트
export function DemoGyeFeedPage() {
  const { gyeId = "gye-1" } = useParams();
  const { sortBy, setSortBy, showAnnouncementsOnly, setShowAnnouncementsOnly } =
    useFeedFilterStore();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useGyeFeed({
    gyeId,
    sortBy,
    limit: 10,
  });

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">계 피드</h1>
        <p className="text-muted-foreground">멤버들과 소통하고 정보를 공유하세요</p>
      </div>

      <Tabs
        defaultValue="feed"
        onValueChange={(value) => setShowAnnouncementsOnly(value === "announcements")}
      >
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="feed">피드</TabsTrigger>
          <TabsTrigger value="announcements">공지사항</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-6">
          {/* 정렬 옵션 */}
          <div className="flex gap-2">
            <Button
              variant={sortBy === "latest" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("latest")}
            >
              최신순
            </Button>
            <Button
              variant={sortBy === "popular" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("popular")}
            >
              인기순
            </Button>
          </div>

          {/* 포스트 작성 */}
          <PostComposer gyeId={gyeId} />

          {/* 포스트 목록 */}
          <div>
            {data?.pages.flatMap((page) => page.posts).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}

            {hasNextPage && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? "로딩 중..." : "더 보기"}
              </Button>
            )}
          </div>
        </TabsContent>

        <TabsContent value="announcements">
          <AnnouncementList gyeId={gyeId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
