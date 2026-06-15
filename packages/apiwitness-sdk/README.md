# APIWitness SDK

**API observability for React Native and Expo apps.**

Detect breaking API changes before users do. The SDK automatically records
all fetch and Axios requests (successes and failures), tracks response
changes, and generates comprehensive reports — all from real mobile app
traffic.

---

## Installation

```bash
pnpm add @apiwitness/sdk
```

Or with npm:

```bash
npm install @apiwitness/sdk
```

Required peer dependencies:

```bash
npx expo install expo-file-system expo-sharing
```

---

## Quick Start

Call `startAPIWitness` once at app initialization. It patches the global
`fetch` API, loads any previously persisted logs, and begins recording.

```typescript
import { startAPIWitness } from "@apiwitness/sdk";

await startAPIWitness({
  appName: "MyApp",
  appVersion: "1.0.0",
  environment: "development",
  recordSuccessfulRequests: true,
  sensitiveFields: [
    "password",
    "token",
    "accessToken",
    "refreshToken",
    "authorization",
    "apiKey",
    "secret",
  ],
});
```

---

## Expo Router Setup

For Expo Router apps, initialize in the root layout:

```tsx
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { startAPIWitness, setupAxiosWitness } from "@apiwitness/sdk";
import axios from "axios";

export default function RootLayout() {
  useEffect(() => {
    startAPIWitness({
      appName: "APIWitness Demo",
      appVersion: "1.0.0",
      environment: "development",
      recordSuccessfulRequests: true,
      sensitiveFields: [
        "password",
        "token",
        "accessToken",
        "refreshToken",
        "authorization",
        "apiKey",
        "secret",
      ],
    });

    setupAxiosWitness(axios);
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
```

---

## Axios Setup

`setupAxiosWitness` adds an Axios interceptor to capture requests and
responses through a specific instance or the default instance.

```typescript
import axios from "axios";
import { setupAxiosWitness } from "@apiwitness/sdk";

const api = axios.create({
  baseURL: "https://api.example.com",
});

setupAxiosWitness(api);

// All requests through this instance are recorded
await api.get("/users");
await api.post("/login", { email: "test@test.com", password: "secret" });
```

---

## Fetch Recording

Fetch interception is automatic once `startAPIWitness` is called. No
additional setup is needed.

```typescript
import { startAPIWitness } from "@apiwitness/sdk";

await startAPIWitness({
  appName: "MyApp",
  appVersion: "1.0.0",
  environment: "production",
});

// All fetch calls are automatically recorded
await fetch("https://api.example.com/users");
```

---

## Configuration

| Option | Type | Default | Description |
|---|---|---|---|---|
| `appName` | `string` | — | Name of the mobile app |
| `appVersion` | `string` | — | App version used for debugging reports |
| `environment` | `string` | — | `"development"`, `"staging"`, or `"production"` |
| `recordSuccessfulRequests` | `boolean` | `false` | Whether successful requests should also be recorded |
| `sensitiveFields` | `string[]` | `["password","token","apiKey",…]` | Request / response keys to mask before storing |
| `knownEndpoints` | `string[]` | `[]` | Known API paths for detecting new/undocumented endpoints |
| `knownDocsSpec` | `Record<string,string>` | `{}` | Known endpoints mapped to doc sources for undocumented detection |
| `dashboardUrl` | `string` | `undefined` | Optional URL for syncing captured data to a cloud dashboard |
| `enableChangeDetection` | `boolean` | `false` | Enables response shape comparison across app versions |
| `enableDocsGeneration` | `boolean` | `false` | Enables docs generation from captured API traffic |
| `enableBreadcrumbs` | `boolean` | `true` | Tracks user actions (taps, navigation, gestures) as context for API calls |
| `alertWebhookUrl` | `string` | `undefined` | Optional webhook URL for alert dispatch when thresholds are exceeded |
| `alertThreshold` | `number` | `3` | Failure occurrences within cooldown window before alert fires |
| `alertCooldownMs` | `number` | `60000` | Minimum ms between duplicate alerts to prevent spamming |
| `performanceBudgets` | `PerformanceBudget[]` | `[]` | Latency thresholds per endpoint pattern |

---

## Export & Share

Access captured data and generate reports (includes both successful and failed requests):

```typescript
import {
  exportFailureReport,      // FailureReport object
  generateMarkdownReport,   // Markdown string
  exportSanitizedJSON,      // JSON string
  saveReportToFile,         // Write to cache dir, returns file:// URI
  saveReportToDirectory,    // Pick a directory via SAF, saves there
  shareReport,              // Write + open system share sheet
  savePostmanCollection,    // Write Postman v2.1 collection to cache
  sharePostmanCollection,   // Share Postman collection via share sheet
  saveOpenAPISpec,          // Write OpenAPI 3.0.3 spec to cache
  shareOpenAPISpec,         // Share OpenAPI spec via share sheet
  saveApiDocsMarkdown,      // Write Markdown docs to cache
  shareApiDocsMarkdown,     // Share Markdown docs via share sheet
} from "@apiwitness/sdk";

// Get structured report
const report = exportFailureReport();

// Generate markdown for bug reports
const markdown = generateMarkdownReport();

// Save to app cache
const uri = await saveReportToFile();

// Save to user-picked directory (Android SAF picker)
const uri = await saveReportToDirectory();

// Share via system share sheet
await shareReport();
```

---

## Advanced Features

### Endpoint Detection

Identify all API endpoints your app calls, detect new endpoints, and flag undocumented ones:

```typescript
import {
  getDetectedEndpoints,       // All endpoints from captured logs
  getNewEndpoints,            // Endpoints not in knownEndpoints
  getUndocumentedEndpoints,   // Endpoints without doc sources
} from "@apiwitness/sdk";

const all = getDetectedEndpoints();
const newOnes = getNewEndpoints();
const undocumented = getUndocumentedEndpoints();
```

### Response Shape Diff

Track how API response structures change between app versions:

```typescript
import { getVersionShapes, getShapeDiffs } from "@apiwitness/sdk";

const shapes = getVersionShapes();
// {
//   "/api/users": { "1.0.0": { id: "number", name: "string" }, "2.0.0": { id: "number", fullName: "string" } }
// }

const diffs = getShapeDiffs();
// [{ endpoint: "/api/users", from: "1.0.0", to: "2.0.0", added: ["fullName"], removed: ["name"] }]
```

### Timeline

View API calls chronologically grouped by hour:

```typescript
import { getTimeline } from "@apiwitness/sdk";

const timeline = getTimeline("hour");
// { "2026-06-15T09": [...logs], "2026-06-15T10": [...logs] }
```

### User Action Breadcrumbs

Track taps, navigation, and gestures as context for API failures:

```typescript
import { addBreadcrumb, getBreadcrumbs } from "@apiwitness/sdk";

addBreadcrumb({ type: "tap", action: "Login button pressed" });
addBreadcrumb({ type: "navigation", action: "SettingsScreen" });
addBreadcrumb({ type: "gesture", action: "Swipe to pay" });

const crumbs = getBreadcrumbs(); // All breadcrumbs from current session
```

Breadcrumbs are automatically attached to the next API log entry.

### Error Grouping

Auto-cluster failures by normalized signature:

```typescript
import { getErrorGroups, getAISummary } from "@apiwitness/sdk";

const groups = getErrorGroups();
// [{ key: "POST:/api/login:4xx:Unauthorized", count: 5, logs: [...] }]

const summary = getAISummary();
// "5 failures grouped into 3 clusters. Most common: POST /api/login (401 Unauthorized)"
```

### Real-time Alerts

Evaluate failure thresholds and dispatch webhooks:

```typescript
import { evaluateAlerts, getAlertHistory } from "@apiwitness/sdk";

await evaluateAlerts(); // Checks all groups, fires webhook if threshold exceeded
const history = getAlertHistory(); // Past alert events
```

### Performance Budgets

Set and check latency thresholds per endpoint:

```typescript
import { checkPerformanceBudgets, getLatencyStats } from "@apiwitness/sdk";

const violations = checkPerformanceBudgets();
// [{ method: "GET", endpoint: "/api/users", maxMs: 300, actualMs: 450 }]

const stats = getLatencyStats();
// { avg: 210, p50: 180, p95: 890, p99: 3100 }
```

### Offline Queue & Retry

Failed exports and webhooks are queued and retried with exponential backoff:

```typescript
import { enqueue, getQueuedItems, setupOfflineQueue } from "@apiwitness/sdk";

setupOfflineQueue(); // Starts processing queue (called automatically by startAPIWitness)
const items = getQueuedItems(); // Pending retries
```

### Release Comparison

Compare API behavior between two app versions:

```typescript
import { compareVersions } from "@apiwitness/sdk";

const diff = compareVersions("1.0.0", "2.0.0");
// {
//   newEndpoints: [...], removedEndpoints: [...],
//   shapeDiffs: [...], latencyChanges: [...]
// }
```

---

## Postman / OpenAPI / Docs Export

Generate standard API artifacts from captured traffic:

```typescript
import {
  exportPostmanCollection,  // Returns PostmanCollection object
  generateOpenAPISpec,      // Returns OpenAPISpec object
  generateApiDocs,          // Returns Markdown string
} from "@apiwitness/sdk";

// Postman v2.1 collection
const postman = exportPostmanCollection();

// OpenAPI 3.0.3 spec
const openapi = generateOpenAPISpec();

// Markdown documentation
const docs = generateApiDocs();
```

---

## Sensitive Field Masking

APIWitness automatically masks sensitive fields before storing logs:

```json
{
  "email": "qa@test.com",
  "password": "***",
  "token": "***"
}
```

Default sensitive fields:
- `password`, `token`, `accessToken`, `refreshToken`
- `authorization`, `apiKey`, `secret`

Customize via the `sensitiveFields` option.

---

## Local Dashboard Sync

Set `dashboardUrl` in the config to sync captured data to a local or cloud
dashboard. The SDK periodically uploads anonymized failure reports to the
specified endpoint.

```typescript
startAPIWitness({
  appName: "MyApp",
  appVersion: "1.0.0",
  environment: "production",
  dashboardUrl: "https://dashboard.example.com/api/sync",
});
```

---

## Roadmap

- Screenshot capture
- Screen tracking
- Session replay integration
- Jira / Linear / GitHub integration
- Cloud dashboard (hosted APIWitness)
- GraphQL operation name extraction

---

## License

MIT
