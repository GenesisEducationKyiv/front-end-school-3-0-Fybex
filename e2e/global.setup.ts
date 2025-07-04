import { test as setup } from "@playwright/test";

import { checkBackendHealth } from "./health-check";

setup("Check backend health", async () => {
  await checkBackendHealth();
});
