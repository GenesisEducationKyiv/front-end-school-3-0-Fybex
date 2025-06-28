import { beforeMount } from "@playwright/experimental-ct-react/hooks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import "../src/index.css";

const queryClient = new QueryClient();

// eslint-disable-next-line @typescript-eslint/require-await
beforeMount(async ({ App }) => {
  return React.createElement(
    QueryClientProvider,
    { client: queryClient },
    React.createElement(App)
  );
});
