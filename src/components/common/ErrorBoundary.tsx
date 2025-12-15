import { type ReactNode } from "react";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "../ui/ErrorFallback";

/**
 * ErrorBoundary 컴포넌트 (가이드라인 [O] B안)
 * 부분적인 에러가 전체 서비스 중단으로 이어지는 것을 방지
 */

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

export function ErrorBoundary({ children, fallback, onReset }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={fallback ? () => <>{fallback}</> : ErrorFallback}
      onReset={onReset}
    >
      {children}
    </ReactErrorBoundary>
  );
}
