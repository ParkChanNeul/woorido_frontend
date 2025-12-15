/**
 * Post Editor UI 상태 관리 Store
 * 포스트 작성 중인 내용, 미디어 업로드 상태 관리
 */

import { create } from "zustand";
import type { MediaUploadResponse } from "@/types";

export interface PostEditorState {
  // 작성 중인 내용
  content: string;
  uploadedMedia: MediaUploadResponse[];
  quotedPostId?: string;

  // 업로드 진행 상태
  isUploading: boolean;
  uploadProgress: number;

  // Actions
  setContent: (content: string) => void;
  addMedia: (media: MediaUploadResponse) => void;
  removeMedia: (mediaId: string) => void;
  setQuotedPostId: (postId?: string) => void;
  setUploadProgress: (progress: number) => void;
  setIsUploading: (isUploading: boolean) => void;
  reset: () => void;
}

const initialState = {
  content: "",
  uploadedMedia: [],
  quotedPostId: undefined,
  isUploading: false,
  uploadProgress: 0,
};

export const usePostEditorStore = create<PostEditorState>((set) => ({
  ...initialState,

  setContent: (content) => set({ content }),

  addMedia: (media) =>
    set((state) => ({
      uploadedMedia: [...state.uploadedMedia, media],
    })),

  removeMedia: (mediaId) =>
    set((state) => ({
      uploadedMedia: state.uploadedMedia.filter((m) => m.id !== mediaId),
    })),

  setQuotedPostId: (postId) => set({ quotedPostId: postId }),

  setUploadProgress: (progress) => set({ uploadProgress: progress }),

  setIsUploading: (isUploading) => set({ isUploading }),

  reset: () => set(initialState),
}));
