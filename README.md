# APIWitness

**The Witness For Every API Failure**

APIWitness records failed API requests in React Native and Expo applications and generates developer-ready debugging reports. When QA finds a bug caused by an API issue, developers get everything they need without asking follow-up questions.

---

## Overview

APIWitness is a developer tool that automatically captures failed API requests during QA testing. It patches the global `fetch` API and provides Axios interceptors to record:

- Request and response payloads
- Headers and status codes
- Error messages
- Timing information
- Environment and version context

All captured data is stored locally on the device and can be exported as a JSON report or shared directly to developers.

---

## Installation

```bash
npm install @apiwitness/sdk
```

Or with pnpm:

```bash
pnpm add @apiwitness/sdk
```

---

## Quick Start

```typescript
import { startAPIWitness } from "@apiwitness/sdk";

startAPIWitness({
  appName: "Food Delivery",
  appVersion: "1.0.0",
  environment: "staging",
  recordSuccessfulRequests: false,
  sensitiveFields: ["password", "token", "accessToken", "refreshToken", "authorization", "apiKey", "secret"],
});
```

Call `startAPIWitness` once at app initialization. It patches `fetch` globally to begin recording.

---

## Expo Example

```typescript
import { useEffect } from "react";
import { startAPIWitness, setupAxiosWitness, getFailedApiLogs, exportFailureReport } from "@apiwitness/sdk";
import axios from "axios";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

export default function App() {
  useEffect(() => {
    startAPIWitness({
      appName: "MyApp",
      appVersion: "1.0.0",
      environment: "development",
    });

    // Optional: also intercept Axios requests
    setupAxiosWitness(axios);
  }, []);

  const handleExport = async () => {
    const report = exportFailureReport();
    const json = JSON.stringify(report, null, 2);
    const uri = FileSystem.documentDirectory + "apiwitness-report.json";
    await FileSystem.writeAsStringAsync(uri, json, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    await Sharing.shareAsync(uri, {
      mimeType: "application/json",
      dialogTitle: "Share APIWitness Report",
    });
  };

  // ... rest of your app
}
```

---

## Axios Example

```typescript
import axios from "axios";
import { setupAxiosWitness } from "@apiwitness/sdk";

const api = axios.create({
  baseURL: "https://api.example.com",
});

setupAxiosWitness(api);

// All requests through this instance will be recorded
api.get("/users");
api.post("/login", { email: "test@test.com", password: "secret" });
```

---

## Fetch Example

Fetch interception is automatic once `startAPIWitness` is called. No additional setup needed.

```typescript
import { startAPIWitness } from "@apiwitness/sdk";

startAPIWitness({
  appName: "MyApp",
  appVersion: "1.0.0",
  environment: "production",
});

// All fetch calls are automatically recorded
await fetch("https://api.example.com/users");
```

---

## Public API

```typescript
import {
  startAPIWitness,       // Initialize the SDK
  setupAxiosWitness,     // Set up Axios interceptor
  getApiLogs,            // Get all recorded logs
  getFailedApiLogs,      // Get only failed request logs
  exportFailureReport,   // Generate a failure report
  clearLogs,             // Clear all stored logs
} from "@apiwitness/sdk";
```

---

## Failure Report Format

```typescript
type FailureReport = {
  reportId: string;
  appName: string;
  appVersion: string;
  environment: string;
  generatedAt: string;
  totalRequests: number;
  failedRequests: number;
  failures: ApiLog[];
};
```

Each failure includes:

```typescript
type ApiLog = {
  id: string;
  method: string;
  url: string;
  status: number;
  success: boolean;
  requestHeaders?: Record<string, any>;
  responseHeaders?: Record<string, any>;
  requestBody?: any;
  responseBody?: any;
  errorMessage?: string;
  duration: number;
  timestamp: string;
};
```

---

## Exports

```typescript
import { exportFailureReport, generateMarkdownReport, saveReportToFile, shareReport } from "@apiwitness/sdk";

// JSON report object
const report = exportFailureReport();

// Markdown formatted bug report
const markdown = generateMarkdownReport();

// Save to device (requires expo-file-system + expo-sharing)
const uri = await saveReportToFile(FileSystem, Sharing);

// Share directly
await shareReport(FileSystem, Sharing);
```

---

## Security

APIWitness automatically masks sensitive fields before storing logs:

```json
{
  "email": "qa@test.com",
  "password": "***",
  "token": "***"
}
```

Default sensitive fields:
- `password`
- `token`
- `accessToken`
- `refreshToken`
- `authorization`
- `apiKey`
- `secret`

Customize via the `sensitiveFields` configuration option.

---

## Privacy

APIWitness stores all data locally on the device. No data is uploaded to any server. The web report viewer processes everything in the browser — nothing is sent over the network.

---

## Roadmap

### Phase 2
- Screenshot capture
- Screen tracking
- User action breadcrumbs
- Session replay integration
- API timeline view
- OpenAPI generation
- Postman export
- Jira integration
- Linear integration
- GitHub issue creation

### Phase 3
- Team dashboard
- Cloud sync
- CI/CD integration
- API regression detection
- Release comparison reports

---

## License

MIT
