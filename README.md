# APIWitness

**The Witness For Every API Failure**

APIWitness records failed API requests in React Native and Expo applications and generates developer-ready debugging reports. When QA finds a bug caused by an API issue, developers get everything they need without asking follow-up questions.

---

## Overview

APIWitness automatically captures failed API requests during QA testing. It patches the global `fetch` API and provides Axios interceptors to record:

- Request and response payloads
- Headers and status codes
- Error messages
- Timing information
- Environment and version context

All captured data is stored locally on the device. Reports can be exported via the system share sheet or saved to a user-picked directory via SAF.

---

## Installation

```bash
npm install @apiwitness/sdk
```

Or with pnpm:

```bash
pnpm add @apiwitness/sdk
```

Required peer dependencies:

```bash
npx expo install expo-file-system expo-sharing
```

---

## Quick Start

```typescript
import { startAPIWitness } from "@apiwitness/sdk";

await startAPIWitness({
  appName: "Food Delivery",
  appVersion: "1.0.0",
  environment: "staging",
  recordSuccessfulRequests: false,
  sensitiveFields: ["password", "token", "accessToken", "refreshToken", "authorization", "apiKey", "secret"],
});
```

Call `startAPIWitness` once at app initialization. It patches `fetch` globally and loads any previously persisted logs.

---

## Expo Example (Expo Router)

**Root layout** (`app/_layout.tsx`):

```typescript
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { startAPIWitness, setupAxiosWitness } from "@apiwitness/sdk";
import axios from "axios";

export default function RootLayout() {
  useEffect(() => {
    startAPIWitness({
      appName: "MyApp",
      appVersion: "1.0.0",
      environment: "development",
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

**Home screen** (`app/index.tsx`):

```typescript
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        onPress={() => router.push("/api-test")}
      >
        <Text>API Test Screen</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push("/failure-report")}
      >
        <Text>View Failure Reports</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
```

**Failure report screen** (`app/failure-report.tsx`):

```typescript
import { useCallback } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getApiLogs,
  getFailedApiLogs,
  exportFailureReport,
  clearLogs,
  saveReportToDirectory,
  shareReport,
} from "@apiwitness/sdk";

export default function FailureReportScreen() {
  const logs = getApiLogs();
  const failedLogs = getFailedApiLogs();
  const report = exportFailureReport();

  const handleExport = useCallback(async () => {
    try {
      const uri = await saveReportToDirectory();
      Alert.alert("Saved", `Report saved to:\n${uri}`);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  }, []);

  const handleShare = useCallback(async () => {
    try {
      await shareReport();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  }, []);

  const handleClear = useCallback(async () => {
    await clearLogs();
    Alert.alert("Cleared", "All logs have been cleared.");
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text>Total: {report.totalRequests}</Text>
      <Text>Failed: {report.failedRequests}</Text>
      <TouchableOpacity onPress={handleExport}>
        <Text>Save to Files</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleShare}>
        <Text>Share Report</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleClear}>
        <Text>Clear Logs</Text>
      </TouchableOpacity>
      {failedLogs.map((log) => (
        <View key={log.id}>
          <Text>{log.method} {log.url}</Text>
          <Text>{log.status} · {log.duration}ms</Text>
        </View>
      ))}
    </SafeAreaView>
  );
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

await startAPIWitness({
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
  startAPIWitness,           // Initialize the SDK (async)
  setupAxiosWitness,         // Set up Axios interceptor
  getApiLogs,                // Get all recorded logs
  getFailedApiLogs,          // Get only failed request logs
  exportFailureReport,       // Generate a failure report object
  generateMarkdownReport,    // Generate a Markdown-formatted report
  exportSanitizedJSON,       // Get report as a JSON string
  saveReportToFile,          // Save report to cache directory, returns URI
  saveReportToDirectory,     // Pick a directory (SAF) and save report there
  shareReport,               // Write report and open system share sheet
  clearLogs,                 // Clear all stored logs
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
import {
  exportFailureReport,
  generateMarkdownReport,
  exportSanitizedJSON,
  saveReportToFile,
  saveReportToDirectory,
  shareReport,
} from "@apiwitness/sdk";

// JSON report object
const report = exportFailureReport();

// Markdown formatted bug report
const markdown = generateMarkdownReport();

// Raw JSON string
const json = exportSanitizedJSON();

// Save to internal cache (returns file:// URI)
const uri = await saveReportToFile();

// Pick a save location via SAF directory picker
const uri = await saveReportToDirectory();

// Share via system share sheet
await shareReport();
```

All export functions pull data directly from the SDK's internal storage — no parameters needed.

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

APIWitness stores all data locally on the device. No data is uploaded to any server. The web report viewer (`apps/web`) processes everything in the browser — nothing is sent over the network.

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
