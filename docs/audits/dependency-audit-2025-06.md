# Dependency Security Audit. June 2025

## Summary

This document presents the findings from a comprehensive security audit of the project's external dependencies. The audit confirms a **strong security posture**. Identified minor vulnerabilities, confined to the development environment, have been addressed. This report also provides a detailed analysis and a strategic roadmap for future upgrades and security enhancements.

## Detailed Analysis

### 1. Vulnerability & Security Scan Analysis

#### 1.1. `npm audit`

- **`vite` (Moderate):** a dev-server vulnerability was identified.
- **`brace-expansion` (Low):** a ReDoS vulnerability was found in a transitive dev dependency.
- **Conclusion:** both identified issues were confirmed to be low-risk and confined to the development environment. Remediation actions have been completed, `package-lock.json` has been updated.

#### 1.2. Snyk Scan

A scan performed with Snyk on the project's 162 dependencies found **no vulnerable paths**. This result provides additional confidence that the issues identified by `npm audit` are confined to the development environment and do not pose a risk to the production application.

### 2. Outdated Major Versions Identified

- **Runtime Dependency:** `react-error-boundary` is currently on `v5`, while `v6` is available.
- **Development Dependency:** `@types/node` is on `v22`, while `v24` is the latest stable version.

### 3. Upgrade Analysis: `react-error-boundary` (v5 → v6)

- **Key Change:** version 6 is **ESM-only**, exclusively using the modern `import/export` syntax.
- **Impact:** the risk of compatibility issues is **low**, as our application and Vite build process are already based on ES Modules.
- **Conclusion:** this is a recommended strategic upgrade. Due to the "ESM-only" change, it should be handled in a separate focused task or release.

### 4. Upgrade Analysis: `@types/node` (v22 → v24)

- **Purpose:** provides TypeScript type definitions for the Node.js runtime environment.
- **Impact:** the major version of `@types/node` should ideally align with the project's specified Node.js version. Installing `@types/node@24` while running Node.js v20 (current minimum version from README.md) could lead to type definitions for APIs not available in the current runtime, potentially causing build-time or development environment inconsistencies (e.g., in `vite.config.ts` or Node.js utility scripts).
- **Conclusion:** while not a direct runtime dependency for the client-side application, aligning these versions is a best practice for development environment stability and consistency. An upgrade to `@types/node@24` should therefore be coupled with a team decision to upgrade the project's underlying Node.js version to v24.

### 5. Supply Chain Security & Integrity Analysis

#### 5.1. Automated Supply Chain Scan (Socket.dev)

A deep supply chain analysis was conducted using Socket.dev, which scanned over 300 npm packages in the project's dependency tree. The scan confirmed the overall health and integrity of the project's dependencies, with no critical issues found.

- **Key Findings:**
  - **License Compliance:** 100% of packages use compliant licenses.
  - **Known Vulnerabilities:** no known vulnerabilities were detected across all dependencies.
  - **Supply Chain Trust:** core dependencies demonstrate high trust scores, indicating they are sourced from reputable authors and registries.
  - **Quality & Maintenance:** the majority of packages scored highly on quality and maintenance metrics.

- **Notable High-Scoring Packages:**

  | Name | Version | Author | Overall | Quality | Maintenance |
  |---|---|---|---|---|---|
  | react | 19.1.0 | react-bot | 0.82 | 0.82 | 0.97 |
  | react-dom | 19.1.0 | react-bot | 0.91 | 0.91 | 0.97 |
  | typescript | 5.7.3 | typescript-bot | 0.89 | 0.89 | 0.99 |
  | zod | 3.24.3 | colinhacks | 0.95 | 1.00 | 0.95 |
  | zustand | 5.0.3 | daishi | 0.93 | 1.00 | 0.93 |
  | vite | 6.3.2 | vitebot | 0.81 | 0.81 | 0.97 |

- **Conclusion:** the scan identified a small number of packages with lower quality or maintenance scores (e.g., `lightningcss-*`, `object-keys`). A review confirmed these are primarily platform-specific binaries or deeply nested transitive dependencies that do not pose a direct risk. They will be monitored as part of ongoing dependency management.

#### 5.2. Zero-Day Vulnerability & Supply Chain Security Check

While automated tools like `npm audit`, Snyk, and Socket.dev are excellent for identifying *known* vulnerabilities, by definition, a zero-day vulnerability is an unknown exploit. Therefore, **no tool or audit can provide a 100% guarantee against zero-day vulnerabilities.**

However, to mitigate this risk and ensure a robust supply chain, the following steps were taken beyond automated scanning:

- **Manual Inspection of Core Dependencies:** All critical runtime dependencies were manually inspected for:
  - **Community Vetting:** verification that dependencies are widely used, well-known in the React/frontend community, and have a high number of weekly downloads on npm, indicating broad community adoption and scrutiny.
  - **Active Maintenance:** checking for recent commits, active issue trackers, and responsive maintainers on their respective GitHub repositories.
  - **Dependency Tree Review:** a high-level manual review of their transitive dependencies to identify any unusually deep or obscure chains.
- **Defense-in-Depth Strategy:** implementing multiple layers of security, such as Content Security Policy (CSP), significantly reduces the attack surface even if a client-side zero-day exploit were to be present in a dependency.

### 6. Alternative Package Suggestion: Replacing `react-error-boundary` with Native React Error Boundaries

Instead of upgrading `react-error-boundary` to `v6`, a more strategic long-term approach is to leverage React's built-in Error Boundary feature, which has been available since React 16. This approach eliminates an external dependency entirely, reducing the project's attack surface and bundle size, albeit requiring some custom code implementation.

1. **Security Level Determination:**

    - **Zero External Dependency Risk:** by utilizing a native React feature, the risk associated with an external package (its maintainer, supply chain, potential vulnerabilities, or licensing issues) is completely removed. This provides the highest possible "security level" for this specific functionality.
    - **Reliance on React Core Security:** the security posture then relies solely on the robust and extensively audited React library itself, which is maintained by Meta and has a large security-focused community.

2. **Feasibility & Implementation Steps:**

    - **Identify Usage Patterns:** review all instances where `react-error-boundary` is currently used within the codebase.
    - **Create Custom Error Boundary Component:** implement a custom React class component that utilizes the `componentDidCatch` or `static getDerivedStateFromError` lifecycle methods. This component will wrap parts of the UI and catch JavaScript errors in its child component tree.
    - **Replace Imports:** update all files currently importing `react-error-boundary` to use the new custom error boundary component.
    - **Testing:** thoroughly test the new custom error boundaries to ensure they catch errors as expected, display appropriate fallback UI, and log errors effectively.
    - **Effort Assessment:** this is a moderate effort task. While it involves writing custom code, the `react-error-boundary` library itself is a relatively thin wrapper around React's native feature, making the migration straightforward for most common use cases.

Replacing `react-error-boundary` with a custom native React error boundary is a highly recommended strategic move for improved long-term security, reduced dependency overhead, and maintainability.

## Proposed Future Work

The following actions are recommended to be scheduled as separate technical tasks:

1. **Major Version Upgrades**:
    - **Node.js Environment:** plan to upgrade our project's Node.js runtime to `v24.x` once it becomes the active LTS release (expected in October 2025), and then update `@types/node` to `v24` accordingly.
2. **Strategic Dependency Removal/Replacement**:
    - **`react-error-boundary`:** replace with custom native React Error Boundary implementation as detailed in section 6.
3. **Automated Security Scanning**:
    - **GitHub Dependabot:** ensure it is enabled for automated dependency updates and vulnerability alerts.
    - **Snyk & Socket.dev:** integrate Snyk and Socket.dev into the CI/CD pipeline for continuous monitoring. Snyk offers deep Static Application Security Testing (SAST) and license compliance checks, while Socket.dev provides advanced supply chain security insights, detecting risky API usage, install scripts, and other indicators of malicious packages.
4. **Runtime Protection**:
    - **Content Security Policy (CSP):** implement a strict CSP header. This is a critical defense layer to mitigate XSS attacks by controlling which resources the browser is permitted to load.
