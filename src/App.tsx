import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AppRouter } from "./routes";
import { queryClient } from "./lib/queryClient";

// i18n 초기화
import "./i18n";

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      
      {/* 토스트 알림 */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "var(--color-surface-1)",
            border: "1px solid var(--color-surface-border)",
            color: "var(--color-content-primary)",
          },
        }}
      />
    </QueryClientProvider>
  );
}
