/**
 * Simulation Form UI 상태 관리 Store
 * 시뮬레이션 폼 입력값 관리 (서버 데이터 아님)
 */

import { create } from "zustand";
import type { SimulationInput } from "@/types/simulation";

interface SimulationFormState {
  formData: SimulationInput;
  currentStep: number;

  setFormData: (data: Partial<SimulationInput>) => void;
  setCurrentStep: (step: number) => void;
  resetForm: () => void;
}

const initialFormData: SimulationInput = {
  monthlyIncome: 0,
  monthlyExpense: 0,
  savingsGoal: 0,
  preferredMonthlyAmount: undefined,
  tags: [],
};

export const useSimulationFormStore = create<SimulationFormState>((set) => ({
  formData: initialFormData,
  currentStep: 1,

  setFormData: (data) => set((state) => ({
    formData: { ...state.formData, ...data },
  })),

  setCurrentStep: (step) => set({ currentStep: step }),

  resetForm: () => set({
    formData: initialFormData,
    currentStep: 1,
  }),
}));
