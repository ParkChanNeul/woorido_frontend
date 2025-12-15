/**
 * Demo Navigation Component
 * 데모 페이지 간 네비게이션 메뉴
 */

// @ts-nocheck
import { Link, useLocation } from "react-router-dom";
import { Presentation, MessageSquare, Settings, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const demoLinks = [
  {
    path: "/demo/feed/gye-1",
    label: "SNS 피드",
    icon: MessageSquare,
    description: "포스트, 댓글, 좋아요 기능",
    features: ["무한 스크롤", "실시간 좋아요", "댓글/대댓글", "공지사항"],
  },
  {
    path: "/demo/manage",
    label: "계 관리",
    icon: Settings,
    description: "계 생성, 가입, 탈퇴",
    features: ["계 생성", "멤버 가입", "보증금 관리", "멤버 목록"],
  },
  {
    path: "/demo/ledger/gye-1",
    label: "공개 장부",
    icon: FileText,
    description: "거래 내역 투명성",
    features: ["거래 타임라인", "요약 정보", "날짜 필터", "통계"],
  },
];

export function DemoNavigation() {
  const location = useLocation();

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Presentation className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold">Woorido 데모</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          백엔드 API 없이 프론트엔드 기능을 시연합니다.
          <br />
          MSW(Mock Service Worker)로 실제 API 호출을 시뮬레이션합니다.
        </p>
        <Badge variant="secondary" className="mt-4">
          Phase 3 TODO + Phase 5A SNS 완전 구현
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {demoLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname.startsWith(link.path.split("/").slice(0, 3).join("/"));

          return (
            <Link key={link.path} to={link.path}>
              <Card
                className={cn(
                  "p-6 hover:shadow-lg transition-all cursor-pointer h-full",
                  isActive && "border-primary shadow-md"
                )}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{link.label}</h3>
                    <p className="text-sm text-muted-foreground">{link.description}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    주요 기능
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {link.features.map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-12 p-6 bg-muted/50 rounded-lg">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          📚 데모 사용 가이드
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            • <strong>SNS 피드</strong>: 포스트 작성, 댓글 달기, 좋아요 등 소셜 기능을
            체험하세요
          </li>
          <li>
            • <strong>계 관리</strong>: 새로운 계를 만들고 멤버를 관리해보세요
          </li>
          <li>
            • <strong>공개 장부</strong>: 거래 내역을 필터링하고 요약 정보를 확인하세요
          </li>
          <li className="mt-4 pt-4 border-t">
            💡 <strong>Tip</strong>: 브라우저 개발자 도구의 Network 탭에서 MSW가 가로챈
            API 요청을 확인할 수 있습니다!
          </li>
        </ul>
      </div>
    </div>
  );
}
