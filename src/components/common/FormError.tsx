import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FormErrorProps {
  message?: string;
  className?: string;
}

/**
 * 폼 에러 메시지 표시
 */
export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null;

  return (
    <div className={cn("flex items-center gap-2 text-sm text-red-500", className)}>
      <AlertCircle className="h-4 w-4" />
      <p>{message}</p>
    </div>
  );
}
