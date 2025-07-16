# sona - music tracks manager

A web application for managing music tracks, built as part of the Genesis Front-End School 3.0 case study.

## Features Implemented

Based on the case requirements, the application includes:

- Track listing with pagination, sorting, filtering, and search.
- Creating new tracks (metadata only).
- Editing existing track metadata.
- Uploading audio files for existing tracks.
- Deleting individual tracks.
- Inline playback for tracks with uploaded files.

### Extra Tasks Completed

- Bulk delete functionality for managing multiple tracks at once.

## Getting Started

### Prerequisites

- Node.js version v20.13.1 or later.
- A running instance of the backend API server accessible at `http://localhost:8000` (can be changed in `.env`, see `.env.sample`).

### Installation

1. Clone the repository.
2. Navigate to the project directory.
3. Install the dependencies:

```bash
    npm install
```

### Running the Application

1. Start the development server:

    ```bash
        npm start
    ```

2. Open your browser and navigate to `http://localhost:3000`.

## Build Commands

```bash
npm run build              # Production build
npm run build:analyze      # Build with bundle analysis
npm run preview            # Preview production build
```

## Testing Strategy

### Test Types & Placement

- **Unit Tests** (`*.unit.test.ts`): Test individual functions/hooks in `src/components/*/__tests__/`
- **Integration Tests** (`*.integration.test.ts`): Test component interactions in `src/components/*/__tests__/`
- **Component Tests** (`*.ct.tsx`): Test UI components in isolation in `src/components/*/__tests__/`
- **E2E Tests** (`*.spec.ts`): Test complete user workflows in `e2e/`

### Key Commands

```bash
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:ct            # Component tests only
npm run test:e2e           # E2E tests (Chromium only)
npm run test:e2e:full      # E2E tests (all browsers)
```

See more in [package.json](./package.json).
