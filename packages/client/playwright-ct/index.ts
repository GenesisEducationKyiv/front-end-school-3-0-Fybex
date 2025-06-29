import { TransportProvider } from "@connectrpc/connect-query";
import { createConnectTransport } from "@connectrpc/connect-web";
import { beforeMount } from "@playwright/experimental-ct-react/hooks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import "../src/index.css";
import { DEFAULT_MOCK_BASE_URL } from "../src/playwrightFixtures";

const queryClient = new QueryClient();

// eslint-disable-next-line @typescript-eslint/require-await
beforeMount(async ({ App }) => {
  const transport = createConnectTransport({ baseUrl: DEFAULT_MOCK_BASE_URL });
  return React.createElement(
    QueryClientProvider,
    { client: queryClient },
    React.createElement(
      TransportProvider,
      { transport },
      React.createElement(App)
    )
  );
});
