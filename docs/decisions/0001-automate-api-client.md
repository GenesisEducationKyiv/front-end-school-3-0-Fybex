# ADR 0001: Automate API Client and Schema Generation from OpenAPI Spec

## Status

Proposed

## Context

Right now we hand-write our API calls [`lib/api.ts`](https://github.com/GenesisEducationKyiv/front-end-school-3-0-Fybex/blob/e90d0967659f37ef8218b4680d609241badfe6a7/src/lib/api.ts) and Zod schemas [`lib/schemas.ts`](https://github.com/GenesisEducationKyiv/front-end-school-3-0-Fybex/blob/e90d0967659f37ef8218b4680d609241badfe6a7/src/lib/schemas.ts) for every endpoint. This is tedious, can lead to errors, and doesn't comply with our OpenAPI specification.

**Key forces driving this decision:**

1. **Our Zod usage**  
   - We already define Zod schemas by hand for each endpoint  
   - Use them for runtime validation of API requests/responses  
   - Infer TypeScript types via `z.infer<>`  
   - Drive form parsing/validation  
   - Ensure frontend/backend type consistency

2. **Sync headaches**  
   - Hand-written code drifts from the OpenAPI spec  
   - Type mismatches lead to runtime bugs

3. **Project goals**  
   - Cut boilerplate  
   - Automatically stay up-to-date with API changes

## Decision

We will adopt [openapi-zod-client](https://www.npmjs.com/package/openapi-zod-client) to generate both a typed HTTP client (via Zodios) and Zod schemas directly from our OpenAPI spec. To ensure the spec and generated code remain current, we will use two coordinated workflows:

### 1. Backend CI: keep `openapi/swagger.yaml` current

– **Trigger**: any push (PR branches or merges) to the backend repo.  
– **Process**:  

  1. Checkout code & install dependencies.  
  2. Start the backend server in CI (e.g. `npm ci && npm run start:ci`) on `localhost:8000`.  
  3. Fetch the live spec:  

     ```bash
     curl -fsSL http://localhost:8000/documentation/yaml \
       -o tmp/swagger.yaml
     ```

  4. Compare `tmp/swagger.yaml` to the version in the branch at  
     `openapi/swagger.yaml`.  
     - If they differ, overwrite `openapi/swagger.yaml`, commit, and push back  
       to the same branch.  
  5. If the branch is `main`, send a `repository_dispatch` event  
     (`event_type: swagger-updated`) to the frontend repo.

> There is always an `openapi/swagger.yaml` in each backend branch, and the CI job ensures it matches that branch’s running server spec.

### 2. Frontend CI: generate & verify client

– **Triggers**:  

  1. Any push or pull-request on the frontend repo (all branches).  
  2. Any `repository_dispatch` event `swagger-updated` from backend `main`.  
– **Setup**: in `package.json` add:

   ```json
   {
     "scripts": {
       "generate:api":
         "openapi-zod-client \
           -i \"${OPENAPI_URL:-http://localhost:8000/documentation/yaml}\" \
           -o src/generated/api.ts \
           --export-schemas"
     }
   }
   ```

- **Local dev**: omit `OPENAPI_URL`, so the script reads from your  
    local `localhost:8000`.  
- **CI**: set  
    `OPENAPI_URL=https://raw.githubusercontent.com/<org>/backend/main/openapi/swagger.yaml` to pull the checked-in spec.

– **Process**:  

  1. Checkout & install dependencies.  
  2. Run `npm run generate:api`.  
  3. Compare generated `src/generated/api.ts` to the committed file:  

     ```bash
     git diff --quiet src/generated/api.ts
     ```  

  4. If there’s any difference, fail CI and notify(Slack/GitHub):
     > ERROR: `src/generated/api.ts` is out of date.  
     > Run `npm run generate:api`, commit the changes, and push.  

### Example flow

1. A backend engineer merges a new `/users` endpoint into `main`.  
2. Backend CI spins up the server, fetches `/documentation/yaml`,  
   updates `openapi/swagger.yaml`, and pushes that commit.  
3. That push to `main` fires a `swagger-updated` dispatch to frontend.  
4. Frontend CI (via dispatch) sets `OPENAPI_URL=…/backend/main/openapi/swagger.yaml`, runs `npm run generate:api`, regenerates `src/generated/api.ts` (with `/users`), sees a diff, fails and notifies(Slack/GitHub) the frontend team.  
5. The frontend engineer pulls, runs `npm run generate:api` locally, checks if there any other changes related to API changes need to be done, commits the new `src/generated/api.ts` and pushes.  
6. Next CI run finds no diff and succeeds.

## Rationale

- **Enforced alignment:** any mismatch between `openapi/swagger.yaml` from backend repository and the generated client immediately fails CI.
- **Remove boilerplate:** No more manual fetch/error parsing and schema maintenance.
- **Single source of truth:** The OpenAPI file drives both types and runtime validation.
- **Local-first workflow:** developers can run `npm run generate:api` against their local backend server without CI.  
- **Fast feedback & notifications:** Slack/Github alerts inform the team as soon as specs change.

## Consequences

**Good things:**

- Up-to-date, type-safe client and schemas with zero manual edits.
- Faster development and fewer runtime surprises.
- Reduced debugging overhead due to early detection of API mismatches.
- Deployments blocked if schemas mismatch.

**Bad things / Risks:**

- Vendor lock-in: reliance on [openapi-zod-client](https://www.npmjs.com/package/openapi-zod-client) and the Zodios ecosystem.
  - Mitigation: wrap the generator behind our own script API so we can swap tools later.  
- CI dependency on backend spec availability or validity  
  - Mitigation: fail early with a clear "cannot fetch/parse spec" error; optionally send alerts (Slack/GitHub).  
- Additional CI job which takes some time due to schema and client generation
  - Mitigation: cache dependencies, parallelize setup steps.
