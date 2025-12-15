/**
 * Auth 관련 React Query hooks
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login, logout, register, type LoginRequest, type RegisterRequest } from "@/lib/api";
import { queryKeys } from "@/lib/queryClient";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

/**
 * 로그인 Mutation
 */
export function useLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: () => {
      // 로그인 성공 시 모든 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      toast.success("로그인되었습니다");
      navigate("/");
    },
    onError: (error: Error) => {
      toast.error(error.message || "로그인에 실패했습니다");
    },
  });
}

/**
 * 회원가입 Mutation
 */
export function useRegister() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterRequest) => register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      toast.success("회원가입이 완료되었습니다");
      navigate("/");
    },
    onError: (error: Error) => {
      toast.error(error.message || "회원가입에 실패했습니다");
    },
  });
}

/**
 * 로그아웃 Mutation
 */
export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      // 로그아웃 시 모든 캐시 클리어
      queryClient.clear();
      toast.success("로그아웃되었습니다");
      navigate("/auth/login");
    },
    onError: (error: Error) => {
      toast.error(error.message || "로그아웃에 실패했습니다");
    },
  });
}
