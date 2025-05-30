# ADR 0001: Automate API Client and Schema Generation from OpenAPI Spec

Right now we hand-write our API calls [`lib/api.ts`](https://github.com/GenesisEducationKyiv/front-end-school-3-0-Fybex/blob/e90d0967659f37ef8218b4680d609241badfe6a7/src/lib/api.ts) and Zod schemas [`lib/schemas.ts`](https://github.com/GenesisEducationKyiv/front-end-school-3-0-Fybex/blob/e90d0967659f37ef8218b4680d609241badfe6a7/src/lib/schemas.ts) for every endpoint. This is tedious, can lead to errors, and doesn't comply with our OpenAPI specification. With fast and active development of both frontend and backend, we need a simple way to keep client code and schemas in sync with the spec.

## Decision

We will adopt [openapi-zod-client](https://www.npmjs.com/package/openapi-zod-client) to generate both a typed HTTP client (via Zodios) and Zod schemas directly from our OpenAPI spec. To ensure the spec and generated code remain current, we will create a CI job that:

1. Gets the latest OpenAPI specification from the backend repository (the method of getting it depends on communication with the backend team: it is desirable that the current specification is always generated in their repository, so we can just fetch it from there)
2. Runs `openapi-zod-client` for the received YAML, producing the generated code (for example, to `src/generated/api.ts`).
3. Commits and pushes any changes to `src/generated/api.ts` if updates are detected.

Additionally, we will set up a hook in the backend repository to trigger this frontend CI job whenever the backend is updated, ensuring everything stays in sync.

To ensure stability, deployments will only proceed if the OpenAPI schema in both repositories matches exactly.

## Rationale

- **Always in sync:** Client code and schemas reflect the spec on every CI run.
- **Remove boilerplate:** No more manual fetch/error parsing and schema maintenance.
- **Single source of truth:** The OpenAPI file drives both types and runtime validation.

We rejected:

- Manual updates (too easy to forget).
- Pre-commit hooks (slows down commit time, depends on local backend version).

## Status

Proposed

## Consequences

**Good things:**

- Up-to-date, type-safe client and schemas with zero manual edits.
- Faster development and fewer runtime surprises.
- Reduced debugging overhead due to early detection of API mismatches.
- Deployments blocked if schemas mismatch.

**Bad things / Risks:**

- Vendor lock-in: reliance on openapi-zod-client and the Zodios ecosystem.
- CI job dependency on backend repository availability.
- Additional CI job which takes some time due to schema and client generation.
