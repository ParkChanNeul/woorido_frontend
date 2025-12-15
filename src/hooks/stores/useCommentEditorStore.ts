/**
 * Comment Editor UI 상태 관리 Store
 * 댓글 작성 중인 내용, 대댓글 대상 관리
 */

import { create } from "zustand";

export interface CommentEditorState {
  // 작성 중인 댓글 내용 (postId별로 관리)
  commentDrafts: Record<string, string>;

  // 대댓글 작성 중인 대상 댓글 ID
  replyingToCommentId?: string;

  // Actions
  setCommentDraft: (postId: string, content: string) => void;
  clearCommentDraft: (postId: string) => void;
  setReplyingToCommentId: (commentId?: string) => void;
  reset: () => void;
}

export const useCommentEditorStore = create<CommentEditorState>((set) => ({
  commentDrafts: {},
  replyingToCommentId: undefined,

  setCommentDraft: (postId, content) =>
    set((state) => ({
      commentDrafts: {
        ...state.commentDrafts,
        [postId]: content,
      },
    })),

  clearCommentDraft: (postId) =>
    set((state) => {
      const { [postId]: _, ...rest } = state.commentDrafts;
      return { commentDrafts: rest };
    }),

  setReplyingToCommentId: (commentId) =>
    set({ replyingToCommentId: commentId }),

  reset: () =>
    set({
      commentDrafts: {},
      replyingToCommentId: undefined,
    }),
}));
