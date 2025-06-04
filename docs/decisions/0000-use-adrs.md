# ADR 0000: Use Architecture Decision Records

## Status

Accepted

## Context

Right now, we make architecture choices on the fly. As `sona` grows, we might forget why we made certain choices, talk about the same things twice, and it will be harder for new people to join. We need a simple, clear way to write down important design choices.

## Decision

We will start using Architecture Decision Records (ADRs). Every major design choice will be a numbered Markdown file (`0000-adopt-adr.md`) in an `adr/` folder. Files will follow a simple plan: What led to this (Context), What we decided (Decision), Why we decided it (Rationale), Its current state (Status), and What happens next (Consequences). A main [`adr/INDEX.md`](./INDEX.md) file will list all of them. When writing a new ADR, copy and edit the [`TEMPLATE.md`](./TEMPLATE.md) file.

## Rationale

- **Remembering:** Helps us recall why we chose something.
- **New People:** Helps new team members quickly learn our history.
- **Clear:** All decisions look the same, making them easy to read.
- **Simple:** Markdown files are easy to use and review.

We didn't choose:

- **Random notes:** Too messy, easy to lose.
- **Separate wiki:** Another system to manage, not that close to code.
- **Code comments:** Too focused on small details, spread across the codebase.

## Consequences

**Good things:**

- Clear history of design choices.
- New team members learn faster.
- Less time spent re-discussing old choices.

**Bad things / Risks:**

- We must maintain the ADRs.
- Takes time to write and update ADRs.
