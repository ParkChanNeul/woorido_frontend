// @ts-nocheck
/**
 * MSW Handlers - Gye (계) 관리 API
 */

import { http, HttpResponse, delay } from "msw";
import {
  MOCK_GYES,
  MOCK_USERS,
  CURRENT_USER,
  generateMockGye,
  generateMockGyeDetail,
  generateMockGyeMember,
  generateId,
} from "../data/generators";
import type { Gye, GyeDetail, GyeMember, CreateGyeRequest } from "@/types";

const BASE_URL = import.meta.env.VITE_SPRING_API_URL || "http://localhost:8080";

// In-memory storage
let gyes: Gye[] = [...MOCK_GYES];
let gyeMembers: Map<string, GyeMember[]> = new Map();

// 초기 멤버 데이터 생성
MOCK_GYES.forEach((gye) => {
  const members = MOCK_USERS.slice(0, gye.currentMembers).map((user) =>
    generateMockGyeMember(gye.id, user)
  );
  gyeMembers.set(gye.id, members);
});

export const gyeHandlers = [
  // GET /api/gye - 계 목록 조회
  http.get(`${BASE_URL}/api/gye`, async () => {
    await delay(300);

    return HttpResponse.json({
      success: true,
      data: gyes,
    });
  }),

  // GET /api/gye/:id - 계 상세 조회
  http.get(`${BASE_URL}/api/gye/:id`, async ({ params }) => {
    await delay(200);

    const { id } = params;
    const gye = gyes.find((g) => g.id === id);

    if (!gye) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "GYE_NOT_FOUND",
            message: "계를 찾을 수 없습니다",
          },
        },
        { status: 404 }
      );
    }

    const gyeDetail = generateMockGyeDetail(gye);

    return HttpResponse.json({
      success: true,
      data: gyeDetail,
    });
  }),

  // POST /api/gye - 계 생성
  http.post(`${BASE_URL}/api/gye`, async ({ request }) => {
    await delay(500);

    const body = (await request.json()) as CreateGyeRequest;

    const newGye: Gye = generateMockGye({
      id: generateId(),
      name: body.name,
      description: body.description,
      category: body.category,
      maxMembers: body.maxMembers,
      monthlyAmount: body.monthlyAmount,
      depositAmount: body.depositAmount,
      cycleMonths: body.cycleMonths,
      isPublic: body.isPublic,
      status: "recruiting",
      currentMembers: 1,
      hostUserId: CURRENT_USER.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    gyes = [newGye, ...gyes];

    // 호스트를 첫 멤버로 추가
    const hostMember = generateMockGyeMember(newGye.id, CURRENT_USER);
    gyeMembers.set(newGye.id, [hostMember]);

    return HttpResponse.json({
      success: true,
      data: newGye,
    });
  }),

  // PUT /api/gye/:id - 계 수정
  http.put(`${BASE_URL}/api/gye/:id`, async ({ params, request }) => {
    await delay(400);

    const { id } = params;
    const body = (await request.json()) as Partial<CreateGyeRequest>;

    const gyeIndex = gyes.findIndex((g) => g.id === id);

    if (gyeIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "GYE_NOT_FOUND",
            message: "계를 찾을 수 없습니다",
          },
        },
        { status: 404 }
      );
    }

    const updatedGye: Gye = {
      ...gyes[gyeIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    gyes[gyeIndex] = updatedGye;

    return HttpResponse.json({
      success: true,
      data: updatedGye,
    });
  }),

  // POST /api/gye/:id/join - 계 가입
  http.post(`${BASE_URL}/api/gye/:id/join`, async ({ params, request }) => {
    await delay(600);

    const { id } = params;
    const body = (await request.json()) as { message?: string };

    const gye = gyes.find((g) => g.id === id);

    if (!gye) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "GYE_NOT_FOUND",
            message: "계를 찾을 수 없습니다",
          },
        },
        { status: 404 }
      );
    }

    if (gye.currentMembers >= gye.maxMembers) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "GYE_FULL",
            message: "계의 인원이 가득 찼습니다",
          },
        },
        { status: 400 }
      );
    }

    // 멤버 추가
    const newMember = generateMockGyeMember(gye.id, CURRENT_USER);
    const currentMembers = gyeMembers.get(gye.id) || [];
    gyeMembers.set(gye.id, [...currentMembers, newMember]);

    // 계 업데이트
    const gyeIndex = gyes.findIndex((g) => g.id === id);
    gyes[gyeIndex] = {
      ...gye,
      currentMembers: gye.currentMembers + 1,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({
      success: true,
      data: {
        member: newMember,
      },
    });
  }),

  // POST /api/gye/:id/leave - 계 탈퇴
  http.post(`${BASE_URL}/api/gye/:id/leave`, async ({ params, request }) => {
    await delay(600);

    const { id } = params;
    const body = (await request.json()) as { reason?: string };

    const gye = gyes.find((g) => g.id === id);

    if (!gye) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: "GYE_NOT_FOUND",
            message: "계를 찾을 수 없습니다",
          },
        },
        { status: 404 }
      );
    }

    // 멤버 제거
    const currentMembers = gyeMembers.get(gye.id) || [];
    const updatedMembers = currentMembers.filter((m) => m.userId !== CURRENT_USER.id);
    gyeMembers.set(gye.id, updatedMembers);

    // 계 업데이트
    const gyeIndex = gyes.findIndex((g) => g.id === id);
    gyes[gyeIndex] = {
      ...gye,
      currentMembers: Math.max(0, gye.currentMembers - 1),
      updatedAt: new Date().toISOString(),
    };

    // 보증금 몰수 여부 (계가 진행 중이면 몰수)
    const depositForfeited = gye.status === "ongoing";

    return HttpResponse.json({
      success: true,
      data: {
        leftAt: new Date().toISOString(),
        depositForfeited,
        forfeitAmount: depositForfeited ? gye.depositAmount : 0,
      },
    });
  }),

  // GET /api/gye/:id/members - 계 멤버 목록 조회
  http.get(`${BASE_URL}/api/gye/:id/members`, async ({ params }) => {
    await delay(200);

    const { id } = params;
    const members = gyeMembers.get(id as string) || [];

    return HttpResponse.json({
      success: true,
      data: {
        members,
      },
    });
  }),
];
