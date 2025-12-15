import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  type RouteObject,
} from "react-router-dom";
import { AppShell, AuthLayout } from "@/layouts";

// Lazy load pages
const HomePage = lazy(() => import("@/features/home/pages/HomePage"));
const ExplorePage = lazy(() => import("@/features/gye/pages/ExplorePage"));
const GyeDetailPage = lazy(() => import("@/features/gye/pages/GyeDetailPage"));
const CreateGyePage = lazy(() => import("@/features/gye/pages/CreateGyePage"));
const WalletPage = lazy(() => import("@/features/wallet/pages/WalletPage"));
const ProfilePage = lazy(() => import("@/features/profile/pages/ProfilePage"));
const SettingsPage = lazy(() => import("@/features/profile/pages/SettingsPage"));
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/features/auth/pages/RegisterPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

// Demo pages
const DemoSimplePage = lazy(() =>
  import("@/features/demo/pages/DemoSimplePage").then((m) => ({
    default: m.DemoSimplePage,
  }))
);

// 로딩 컴포넌트
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 border-2 border-woorido border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// 페이지 래퍼
function PageWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

const routes: RouteObject[] = [
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: (
          <PageWrapper>
            <HomePage />
          </PageWrapper>
        ),
      },
      {
        path: "explore",
        element: (
          <PageWrapper>
            <ExplorePage />
          </PageWrapper>
        ),
      },
      {
        path: "gye/:id",
        element: (
          <PageWrapper>
            <GyeDetailPage />
          </PageWrapper>
        ),
      },
      {
        path: "create",
        element: (
          <PageWrapper>
            <CreateGyePage />
          </PageWrapper>
        ),
      },
      {
        path: "wallet",
        element: (
          <PageWrapper>
            <WalletPage />
          </PageWrapper>
        ),
      },
      {
        path: "profile",
        element: (
          <PageWrapper>
            <ProfilePage />
          </PageWrapper>
        ),
      },
      {
        path: "settings",
        element: (
          <PageWrapper>
            <SettingsPage />
          </PageWrapper>
        ),
      },
      // Demo route - 구현 완료 상태 표시
      {
        path: "demo",
        element: (
          <PageWrapper>
            <DemoSimplePage />
          </PageWrapper>
        ),
      },
    ],
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: (
          <PageWrapper>
            <LoginPage />
          </PageWrapper>
        ),
      },
      {
        path: "register",
        element: (
          <PageWrapper>
            <RegisterPage />
          </PageWrapper>
        ),
      },
    ],
  },
  {
    path: "*",
    element: (
      <PageWrapper>
        <NotFoundPage />
      </PageWrapper>
    ),
  },
];

const router = createBrowserRouter(routes);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
