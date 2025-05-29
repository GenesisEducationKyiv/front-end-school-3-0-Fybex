# ADR 0001: Automate API Client and Schema Generation from OpenAPI Spec

Right now we hand-write our API calls [`lib/api.ts`](https://github.com/GenesisEducationKyiv/front-end-school-3-0-Fybex/blob/e90d0967659f37ef8218b4680d609241badfe6a7/src/lib/api.ts) and Zod schemas [`lib/schemas.ts`](https://github.com/GenesisEducationKyiv/front-end-school-3-0-Fybex/blob/e90d0967659f37ef8218b4680d609241badfe6a7/src/lib/schemas.ts) for every endpoint. This is tedious, can lead to errors, and doesn't comply with our OpenAPI specification. We don't yet have a stable deployed backend—developers run a local server. We need a simple way to keep client code and schemas in sync with the spec.

## Decision

We will adopt [openapi-zod-client](https://www.npmjs.com/package/openapi-zod-client) to generate both a typed HTTP client (via Zodios) and Zod schemas directly from our OpenAPI spec. To ensure the spec and generated code remain current, we will add a Git pre-commit hook that:

1. Fetches the latest OpenAPI YAML from the local backend (`https://localhost:8000/documentation/yaml` into `openapi/spec.yaml`).
2. Runs `openapi-zod-client` for the received YAML, producing the generated code (for example, to `rc/generated/api.ts`).  
3. Stages any changes to `openapi/spec.yaml` and `src/generated/api.ts` before the commit.  

## Rationale

- **Always in sync:** Client code and schemas reflect the spec on every commit
- **Remove boilerplate:** No more manual fetch/error parsing and schema maintenance
- **Immediate feedback:** API mismatches surface before code lands in Git
- **Single source of truth:** The OpenAPI file drives both types and runtime validation

We rejected:

- Manual updates (too easy to forget)
- CI-only generation (early for this because we don't have a deployed backend)

## Status

Proposed

## Consequences

Good things:

- Up-to-date, type-safe client and schemas with zero manual edits.
- Faster development and fewer runtime surprises.

Bad things / Risks:

- Commits block if local backend isn't running or spec fetch fails.
- Vendor lock-in: reliance on openapi-zod-client and the Zodios ecosystem.
