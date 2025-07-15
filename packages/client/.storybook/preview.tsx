import { TransportProvider } from "@connectrpc/connect-query";
import type { Preview } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import { mockTransport } from "./mocks/connectHandlers";

import "../src/index.css";

const queryClient = new QueryClient();

const preview: Preview = {
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <TransportProvider transport={mockTransport}>
        <QueryClientProvider client={queryClient}>
          <Story />
          <Toaster />
        </QueryClientProvider>
      </TransportProvider>
    ),
  ],
};

export default preview;
