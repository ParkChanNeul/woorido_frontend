import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { useIsMobile } from "@/lib/hooks";

export function AppShell() {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen min-h-dvh bg-surface-bg flex flex-col">
      {/* 헤더 */}
      <Header />

      {/* 메인 콘텐츠 */}
      <main className="flex-1 pb-20 md:pb-6">
        <div className="max-w-screen-lg mx-auto px-4">
          <Outlet />
        </div>
      </main>

      {/* 모바일 하단 내비게이션 */}
      {isMobile && <BottomNav />}
    </div>
  );
}
