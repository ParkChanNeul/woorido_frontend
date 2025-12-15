import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Skeleton 로딩 UI (가이드라인 [O] A안)
 * CLS(레이아웃 이동) 방지 및 고급스러운 UX 제공
 */
function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      {...props}
    />
  );
}

export { Skeleton };
