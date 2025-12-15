// @ts-nocheck
/**
 * MSW Handlers - Ledger (공개 장부) API
 */

import { http, HttpResponse, delay } from "msw";
import {
  generateMockLedgerTimeline,
  generateMockLedgerSummary,
  type LedgerTransaction,
  type LedgerSummary,
} from "../data/generators";

const BASE_URL = import.meta.env.VITE_SPRING_API_URL || "http://localhost:8080";

// In-memory storage
const ledgerTimelines: Map<string, LedgerTransaction[]> = new Map();
const ledgerSummaries: Map<string, LedgerSummary> = new Map();

export const ledgerHandlers = [
  // GET /api/ledger/:gyeId/timeline - 공개 장부 타임라인 조회
  http.get(`${BASE_URL}/api/ledger/:gyeId/timeline`, async ({ params, request }) => {
    await delay(400);

    const { gyeId } = params;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    // 캐시된 데이터가 없으면 생성
    if (!ledgerTimelines.has(gyeId as string)) {
      ledgerTimelines.set(gyeId as string, generateMockLedgerTimeline(gyeId as string, 100));
    }

    let timeline = ledgerTimelines.get(gyeId as string) || [];

    // 날짜 필터링
    if (startDate) {
      timeline = timeline.filter((t) => new Date(t.createdAt) >= new Date(startDate));
    }
    if (endDate) {
      timeline = timeline.filter((t) => new Date(t.createdAt) <= new Date(endDate));
    }

    // 페이지네이션
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTimeline = timeline.slice(startIndex, endIndex);

    return HttpResponse.json({
      success: true,
      data: {
        transactions: paginatedTimeline,
        pagination: {
          page,
          limit,
          total: timeline.length,
          totalPages: Math.ceil(timeline.length / limit),
        },
      },
    });
  }),

  // GET /api/ledger/:gyeId/summary - 공개 장부 요약 조회
  http.get(`${BASE_URL}/api/ledger/:gyeId/summary`, async ({ params }) => {
    await delay(300);

    const { gyeId } = params;

    // 캐시된 데이터가 없으면 생성
    if (!ledgerSummaries.has(gyeId as string)) {
      ledgerSummaries.set(gyeId as string, generateMockLedgerSummary());
    }

    const summary = ledgerSummaries.get(gyeId as string);

    return HttpResponse.json({
      success: true,
      data: summary,
    });
  }),
];
