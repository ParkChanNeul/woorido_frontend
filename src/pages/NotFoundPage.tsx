import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen min-h-dvh bg-surface-bg flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-woorido mb-4">404</h1>
        <h2 className="text-xl font-semibold text-content-primary mb-2">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="text-content-secondary mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-woorido text-white rounded-xl font-semibold hover:bg-woorido-light transition-colors"
        >
          <Home className="w-5 h-5" />
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
