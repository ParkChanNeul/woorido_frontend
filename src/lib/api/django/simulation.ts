/**
 * Django - 시뮬레이션 API
 */

import { djangoClient } from "../client";
import { DJANGO_ENDPOINTS } from "@/constants/api";
import type { SimulationInput, SimulationResult } from "@/types";

/**
 * 시뮬레이션 계산 (비로그인 가능)
 */
export async function calculateSimulation(
  input: SimulationInput
): Promise<SimulationResult> {
  const { data } = await djangoClient.post<{ data: SimulationResult }>(
    DJANGO_ENDPOINTS.SIMULATION.CALCULATE,
    input
  );
  return data.data;
}

/**
 * 시뮬레이션 시나리오 목록 조회
 */
export async function getSimulationScenarios() {
  const { data } = await djangoClient.get(
    DJANGO_ENDPOINTS.SIMULATION.SCENARIOS
  );
  return data.data;
}
