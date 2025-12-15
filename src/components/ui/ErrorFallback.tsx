import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./Card";

/**
 * 에러 발생 시 보여줄 대체 UI (가이드라인 [O] B안)
 */
export interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary?: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <CardTitle>문제가 발생했습니다</CardTitle>
          </div>
          <CardDescription>
            일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <details className="rounded-lg bg-gray-50 p-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-700">
              오류 상세 정보
            </summary>
            <pre className="mt-2 text-xs text-gray-600 overflow-auto">
              {error.message}
            </pre>
          </details>
        </CardContent>
        {resetErrorBoundary && (
          <CardFooter>
            <Button onClick={resetErrorBoundary} className="w-full">
              다시 시도
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
