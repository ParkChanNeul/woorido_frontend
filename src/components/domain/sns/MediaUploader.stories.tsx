import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse, delay } from "msw";
import { MediaUploader } from "./MediaUploader";
import type { MediaUploadResponse } from "@/types/post";
import { BrowserRouter } from "react-router-dom";
import { useEffect } from "react";
import { usePostEditorStore } from "@/hooks/stores";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * MediaUploader 컴포넌트 스토리
 *
 * 파일 업로드를 담당하는 컴포넌트로, 다음 기능을 제공합니다:
 * - 드래그 앤 드롭으로 파일 업로드
 * - 파일 선택 버튼으로 업로드
 * - 업로드 진행률 표시
 * - 미리보기 그리드
 * - 파일 제거
 * - 파일 타입 및 크기 검증
 */
const meta: Meta<typeof MediaUploader> = {
  title: "Domain/SNS/MediaUploader",
  component: MediaUploader,
  tags: ["autodocs"],
  decorators: [
    (Story) => {
      // Reset store before each story
      useEffect(() => {
        usePostEditorStore.getState().reset();
      }, []);

      return (
        <BrowserRouter>
          <div className="max-w-2xl mx-auto p-4">
            <Story />
          </div>
        </BrowserRouter>
      );
    },
  ],
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof MediaUploader>;

// Mock upload handler that simulates file upload
const createMockUploadHandler = (delayMs: number = 1000) =>
  http.post(`${API_BASE_URL}/api/v1/gyes/:gyeId/media`, async ({ request }) => {
    await delay(delayMs);

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return HttpResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Mock response
    const response: MediaUploadResponse = {
      id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: file.type.startsWith("image/") ? "image" : "video",
      url: URL.createObjectURL(file), // Create blob URL for preview
      thumbnailUrl: file.type.startsWith("video/")
        ? "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&h=200&fit=crop"
        : undefined,
      width: 800,
      height: 600,
      size: file.size,
    };

    return HttpResponse.json(response, { status: 201 });
  });

/**
 * 기본 업로더 (빈 상태)
 */
export const Default: Story = {
  args: {
    gyeId: "gye-1",
  },
  parameters: {
    msw: {
      handlers: [createMockUploadHandler()],
    },
  },
};

/**
 * 파일 업로드 후 미리보기
 *
 * 실제로 파일을 업로드해서 테스트해보세요!
 */
export const WithPreview: Story = {
  args: {
    gyeId: "gye-1",
  },
  parameters: {
    msw: {
      handlers: [createMockUploadHandler()],
    },
  },
};

/**
 * 빠른 업로드 (응답 속도 빠름)
 */
export const FastUpload: Story = {
  args: {
    gyeId: "gye-1",
  },
  parameters: {
    msw: {
      handlers: [createMockUploadHandler(300)],
    },
  },
};

/**
 * 느린 업로드 (응답 속도 느림)
 *
 * 진행률 표시를 확인할 수 있습니다.
 */
export const SlowUpload: Story = {
  args: {
    gyeId: "gye-1",
  },
  parameters: {
    msw: {
      handlers: [createMockUploadHandler(3000)],
    },
  },
};

/**
 * 업로드 실패
 */
export const UploadError: Story = {
  args: {
    gyeId: "gye-1",
  },
  parameters: {
    msw: {
      handlers: [
        http.post(`${API_BASE_URL}/api/v1/gyes/:gyeId/media`, async () => {
          await delay(1000);
          return HttpResponse.json(
            { error: "Upload failed" },
            { status: 500 }
          );
        }),
      ],
    },
  },
};

/**
 * 최대 파일 개수 제한 (3개)
 */
export const MaxFilesThree: Story = {
  args: {
    gyeId: "gye-1",
    maxFiles: 3,
  },
  parameters: {
    msw: {
      handlers: [createMockUploadHandler()],
    },
  },
};

/**
 * 최대 파일 개수 제한 (1개)
 */
export const MaxFileOne: Story = {
  args: {
    gyeId: "gye-1",
    maxFiles: 1,
  },
  parameters: {
    msw: {
      handlers: [createMockUploadHandler()],
    },
  },
};

/**
 * 비활성화 상태
 */
export const Disabled: Story = {
  args: {
    gyeId: "gye-1",
    disabled: true,
  },
  parameters: {
    msw: {
      handlers: [createMockUploadHandler()],
    },
  },
};

/**
 * 모바일 뷰 (2열 그리드)
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
      handlers: [createMockUploadHandler()],
    },
  },
};

/**
 * 데스크톱 뷰 (3열 그리드)
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
      handlers: [createMockUploadHandler()],
    },
  },
};

/**
 * 이미 업로드된 파일이 있는 상태
 *
 * 이 스토리는 Zustand store를 통해 사전에 업로드된 미디어를 시뮬레이션합니다.
 */
export const WithExistingMedia: Story = {
  args: {
    gyeId: "gye-1",
  },
  decorators: [
    (Story) => {
      useEffect(() => {
        const store = usePostEditorStore.getState();
        store.reset();

        // Add mock uploaded media
        store.addMedia({
          id: "media-1",
          type: "image",
          url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop",
          width: 800,
          height: 600,
          size: 153600,
        });
        store.addMedia({
          id: "media-2",
          type: "image",
          url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
          width: 800,
          height: 600,
          size: 163800,
        });
        store.addMedia({
          id: "media-3",
          type: "video",
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          thumbnailUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&h=200&fit=crop",
          width: 1920,
          height: 1080,
          size: 5253880,
        });
      }, []);

      return (
        <BrowserRouter>
          <div className="max-w-2xl mx-auto p-4">
            <Story />
          </div>
        </BrowserRouter>
      );
    },
  ],
  parameters: {
    msw: {
      handlers: [createMockUploadHandler()],
    },
  },
};

/**
 * 최대 개수 도달 (업로드 존 숨김)
 */
export const MaxFilesReached: Story = {
  args: {
    gyeId: "gye-1",
    maxFiles: 3,
  },
  decorators: [
    (Story) => {
      useEffect(() => {
        const store = usePostEditorStore.getState();
        store.reset();

        // Add 3 media to reach max
        store.addMedia({
          id: "media-1",
          type: "image",
          url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop",
          width: 800,
          height: 600,
          size: 153600,
        });
        store.addMedia({
          id: "media-2",
          type: "image",
          url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
          width: 800,
          height: 600,
          size: 163800,
        });
        store.addMedia({
          id: "media-3",
          type: "image",
          url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop",
          width: 800,
          height: 600,
          size: 173900,
        });
      }, []);

      return (
        <BrowserRouter>
          <div className="max-w-2xl mx-auto p-4">
            <Story />
          </div>
        </BrowserRouter>
      );
    },
  ],
  parameters: {
    msw: {
      handlers: [createMockUploadHandler()],
    },
  },
};

/**
 * 대용량 파일 (크기 정보 표시)
 */
export const LargeFiles: Story = {
  args: {
    gyeId: "gye-1",
  },
  decorators: [
    (Story) => {
      useEffect(() => {
        const store = usePostEditorStore.getState();
        store.reset();

        // Add large files
        store.addMedia({
          id: "media-1",
          type: "video",
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          thumbnailUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&h=200&fit=crop",
          width: 1920,
          height: 1080,
          size: 8500000, // 8.5MB
        });
        store.addMedia({
          id: "media-2",
          type: "image",
          url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop",
          width: 4000,
          height: 3000,
          size: 9800000, // 9.8MB
        });
      }, []);

      return (
        <BrowserRouter>
          <div className="max-w-2xl mx-auto p-4">
            <Story />
          </div>
        </BrowserRouter>
      );
    },
  ],
  parameters: {
    msw: {
      handlers: [createMockUploadHandler()],
    },
  },
};

/**
 * 혼합 미디어 (이미지 + 동영상)
 */
export const MixedMedia: Story = {
  args: {
    gyeId: "gye-1",
  },
  decorators: [
    (Story) => {
      useEffect(() => {
        const store = usePostEditorStore.getState();
        store.reset();

        store.addMedia({
          id: "media-1",
          type: "image",
          url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop",
          width: 800,
          height: 600,
          size: 153600,
        });
        store.addMedia({
          id: "media-2",
          type: "video",
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          thumbnailUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&h=200&fit=crop",
          width: 1920,
          height: 1080,
          size: 5253880,
        });
        store.addMedia({
          id: "media-3",
          type: "image",
          url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
          width: 800,
          height: 600,
          size: 163800,
        });
        store.addMedia({
          id: "media-4",
          type: "image",
          url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop",
          width: 800,
          height: 600,
          size: 173900,
        });
      }, []);

      return (
        <BrowserRouter>
          <div className="max-w-2xl mx-auto p-4">
            <Story />
          </div>
        </BrowserRouter>
      );
    },
  ],
  parameters: {
    msw: {
      handlers: [createMockUploadHandler()],
    },
  },
};
