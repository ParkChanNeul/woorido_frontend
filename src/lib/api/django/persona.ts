/**
 * Django - 성향(Archetype) 분석 API
 */

import { djangoClient } from "../client";
import { DJANGO_ENDPOINTS } from "@/constants/api";
import type {
  PersonaAnalyzeRequest,
  PersonaAnalyzeResponse,
  PersonaType,
} from "@/types";

/**
 * 성향 분석
 */
export async function analyzePersona(
  request: PersonaAnalyzeRequest
): Promise<PersonaAnalyzeResponse> {
  const { data } = await djangoClient.post<{ data: PersonaAnalyzeResponse }>(
    DJANGO_ENDPOINTS.PERSONA.ANALYZE,
    request
  );
  return data.data;
}

/**
 * 성향 상세 조회
 */
export async function getPersonaDetail(userId: string) {
  const { data } = await djangoClient.get(DJANGO_ENDPOINTS.PERSONA.DETAIL, {
    params: { userId },
  });
  return data.data;
}

/**
 * 성향 타입 목록 조회
 */
export async function getPersonaTypes(): Promise<PersonaType[]> {
  const { data } = await djangoClient.get<{ data: PersonaType[] }>(
    DJANGO_ENDPOINTS.PERSONA.TYPES
  );
  return data.data;
}
