import { Outlet, Link } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="min-h-screen min-h-dvh bg-surface-bg flex flex-col">
      {/* 헤더 */}
      <header className="p-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-woorido flex items-center justify-center">
            <span className="text-white font-bold text-sm">W</span>
          </div>
          <span className="text-content-primary font-bold text-lg">
            WOORIDO
          </span>
        </Link>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      {/* 푸터 */}
      <footer className="p-4 text-center text-content-tertiary text-sm">
        © 2025 WOORIDO. All rights reserved.
      </footer>
    </div>
  );
}
