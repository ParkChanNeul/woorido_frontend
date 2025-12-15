/**
 * Django - 매칭(취향/위치) API
 */

import { djangoClient } from "../client";
import { DJANGO_ENDPOINTS } from "@/constants/api";

export interface MatchingRecommendRequest {
  userId?: string;
  tags?: string[];
  location?: {
    lat: number;
    lon: number;
  };
  limit?: number;
}

/**
 * 추천 챌린지 조회 (취향 기반)
 */
export async function getRecommendedChallenges(
  request: MatchingRecommendRequest
) {
  const { data } = await djangoClient.post(
    DJANGO_ENDPOINTS.MATCHING.RECOMMEND,
    request
  );
  return data.data;
}

/**
 * 인기 태그 조회
 */
export async function getPopularTags() {
  const { data } = await djangoClient.get(DJANGO_ENDPOINTS.MATCHING.TAGS);
  return data.data;
}

/**
 * 지역 기반 챌린지 조회
 */
export async function getGeoChallenges(lat: number, lon: number, radius = 3) {
  const { data } = await djangoClient.get(DJANGO_ENDPOINTS.MATCHING.GEO, {
    params: { lat, lon, radius },
  });
  return data.data;
}
