/**
 * Spring Boot - Gye (계) API
 * 계 생성, 가입, 탈퇴, 멤버 관리
 */

import { springClient } from "../client";
import { SPRING_ENDPOINTS } from "@/constants/api";
import type { Gye, GyeDetail, GyeMember, CreateGyeRequest } from "@/types";

/**
 * 계 목록 조회
 */
export async function getGyeList() {
  const { data } = await springClient.get(SPRING_ENDPOINTS.GYE.LIST);
  return data.data;
}

/**
 * 계 상세 조회
 */
export async function getGyeDetail(id: string): Promise<GyeDetail> {
  const { data } = await springClient.get<{ data: GyeDetail }>(
    SPRING_ENDPOINTS.GYE.DETAIL(id)
  );
  return data.data;
}

/**
 * 계 생성
 */
export async function createGye(request: CreateGyeRequest): Promise<Gye> {
  const { data } = await springClient.post<{ data: Gye }>(
    SPRING_ENDPOINTS.GYE.CREATE,
    request
  );
  return data.data;
}

/**
 * 계 수정
 */
export async function updateGye(
  gyeId: string,
  request: Partial<CreateGyeRequest>
): Promise<Gye> {
  const { data } = await springClient.put<{ data: Gye }>(
    SPRING_ENDPOINTS.GYE.UPDATE(gyeId),
    request
  );
  return data.data;
}

/**
 * 계 가입
 */
export async function joinGye(gyeId: string, message?: string): Promise<GyeMember> {
  const { data } = await springClient.post<{ data: { member: GyeMember } }>(
    SPRING_ENDPOINTS.GYE.JOIN(gyeId),
    { message }
  );
  return data.data.member;
}

/**
 * 계 탈퇴
 */
export async function leaveGye(
  gyeId: string,
  reason?: string
): Promise<{ leftAt: string; depositForfeited: boolean; forfeitAmount: number }> {
  const { data } = await springClient.post<{
    data: { leftAt: string; depositForfeited: boolean; forfeitAmount: number };
  }>(SPRING_ENDPOINTS.GYE.LEAVE(gyeId), { reason });
  return data.data;
}

/**
 * 계 멤버 목록 조회
 */
export async function getGyeMembers(gyeId: string): Promise<GyeMember[]> {
  const { data } = await springClient.get<{ data: { members: GyeMember[] } }>(
    SPRING_ENDPOINTS.GYE.MEMBERS(gyeId)
  );
  return data.data.members;
}
