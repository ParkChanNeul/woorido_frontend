import type { Preview } from "@storybook/react-vite";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initialize, mswLoader } from "msw-storybook-addon";
import "../src/styles.css"; // Tailwind CSS

// MSW 초기화
initialize();

// React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Infinity,
    },
  },
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      test: "todo",
    },
  },

  loaders: [mswLoader],

  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="p-4">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
};

export default preview;
