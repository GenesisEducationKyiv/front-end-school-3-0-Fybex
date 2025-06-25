# ADR 0001: Automate API Client and Schema Generation from OpenAPI Spec

## Status

Accepted

## Context

Right now we hand-write our API calls [`lib/api.ts`](https://github.com/GenesisEducationKyiv/front-end-school-3-0-Fybex/blob/e90d0967659f37ef8218b4680d609241badfe6a7/src/lib/api.ts) and Zod schemas [`lib/schemas.ts`](https://github.com/GenesisEducationKyiv/front-end-school-3-0-Fybex/blob/e90d0967659f37ef8218b4680d609241badfe6a7/src/lib/schemas.ts) for every endpoint. This is tedious, can lead to errors, and doesn't comply with our OpenAPI specification.

**Key forces driving this decision:**

1. **Our Zod usage**  
   - We already define Zod schemas by hand for each endpoint  
   - Use them for types/runtime validation of API requests/responses  
   - Drive form parsing/validation  
   - Ensure frontend/backend type consistency

2. **Sync headaches**  
   - Hand-written code drifts from the OpenAPI spec  
   - Type mismatches lead to runtime bugs

3. **Project goals**  
   - Cut boilerplate  
   - Automatically stay up-to-date with API changes

## Decision

We will adopt an OpenAPI-driven code generation approach:

- Use [openapi-zod-client](https://www.npmjs.com/package/openapi-zod-client) to produce both:
  - A fully typed HTTP client (built on Zodios).
  - Corresponding Zod schemas for all endpoints.
- Integrate this generation into our CI pipelines so that:
  - Any divergence between the spec and generated code fails the CI pipeline & notifies the team.
  - Developers can regenerate locally against a running backend for fast feedback.

This ensures that the OpenAPI document is the single source of truth for request/response shapes and that all code deriving from it stays up to date.

## Rationale

- **Enforced alignment:** any mismatch between `openapi/swagger.yaml` from backend repository and the generated client immediately fails CI.
- **Remove boilerplate:** No more manual fetch/error parsing and schema maintenance.
- **Single source of truth:** The OpenAPI file drives both types and runtime validation.
- **Local-first workflow:** developers can run `npm run generate:api` against their local backend server without CI.  
- **Fast feedback & notifications:** Slack/Github alerts inform the team as soon as specs change.
- **Tool choice:** [openapi-zod-client](https://www.npmjs.com/package/openapi-zod-client) is the only solution we found that generates Zod schemas directly from an OpenAPI spec, minimizing changes to our existing Zod-based setup. Alternatives like [swagger-typescript-api](https://www.npmjs.com/package/swagger-typescript-api), [openapi-typescript](https://www.npmjs.com/package/openapi-typescript), and [openapi-client-axios](https://www.npmjs.com/package/openapi-client-axios) produce only TypeScript types/clients without runtime validation, and [zod-openapi](https://www.npmjs.com/package/zod-openapi) works in the opposite direction (Zod→OpenAPI).

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
