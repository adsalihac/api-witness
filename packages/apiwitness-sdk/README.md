# APIWitness SDK

**API observability for React Native and Expo apps.**

Detect breaking API changes before users do. The SDK automatically records
fetch and Axios requests, captures failures, tracks response changes, and
generates developer-ready documentation — all from real mobile app traffic.

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
  recordSuccessfulRequests: false,
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
      recordSuccessfulRequests: false,
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
|---|---|---|---|
| `appName` | `string` | — | Name of the mobile app |
| `appVersion` | `string` | — | App version used for debugging reports |
| `environment` | `string` | — | `"development"`, `"staging"`, or `"production"` |
| `recordSuccessfulRequests` | `boolean` | `false` | Whether successful requests should also be recorded |
| `sensitiveFields` | `string[]` | `["password","token","apiKey",…]` | Request / response keys to mask before storing |
| `dashboardUrl` | `string` | `undefined` | Optional URL for syncing captured data to a cloud dashboard |
| `enableChangeDetection` | `boolean` | `false` | Enables response shape comparison across app versions |
| `enableDocsGeneration` | `boolean` | `false` | Enables docs generation from captured API traffic |

---

## Export Failure Report

Access captured data and generate reports:

```typescript
import {
  exportFailureReport,     // FailureReport object
  generateMarkdownReport,  // Markdown string
  exportSanitizedJSON,     // JSON string
  saveReportToFile,        // Write to cache dir, returns file:// URI
  saveReportToDirectory,   // Pick a directory via SAF, saves there
  shareReport,             // Write + open system share sheet
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
- User action breadcrumbs
- Session replay integration
- API timeline view
- OpenAPI generation
- Postman export
- Jira / Linear / GitHub integration

---

## License

MIT
