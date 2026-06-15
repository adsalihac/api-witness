# APIWitness

**The Witness For Every API Failure**

> Detect breaking API changes before users do. Generate documentation from
> real mobile app usage.

APIWitness is a React Native / Expo SDK + web dashboard that gives mobile
teams full API observability — recording successes and failures, detecting
response changes, tracking undocumented endpoints, and generating Postman
collections, OpenAPI specs, and Markdown docs automatically.

---

## Features

### API Recording

- **Fetch & Axios Interception** — Automatically patches global `fetch` and provides `setupAxiosWitness()` for Axios. Zero config needed.
- **All API Logging** — Captures every request and response: status codes, headers, payloads, timings, and error messages.
- **Expo Config Plugin** — Zero-code setup via `app.json` plugins. Injects SDK configuration into `AndroidManifest.xml` and `Info.plist` automatically.
- **Network Simulation** — Example app includes Normal / Throttled (2s delay) / Offline toggle for testing failure scenarios.
- **Sensitive Field Masking** — Built-in masking for `password`, `token`, `apiKey`, `secret`, and more. Fully customizable.
- **Persistent Storage** — Logs are saved to device storage and survive app restarts.

### Failure Intelligence

- **AI Error Grouping** — Auto-clusters similar failures by method + endpoint + status bucket + error message prefix. No ML dependencies.
- **Real-time Alerts** — Webhook notifications fire when failure count exceeds threshold within a configurable cooldown window.
- **Performance Budgets** — Set latency thresholds per endpoint pattern (e.g. `GET /api/**` < 300ms). Violations flagged automatically.
- **Performance Regression Detection** — `getLatencyTrend()` compares last 7 days vs prior 7, flags endpoints with >20% latency regression.
- **User Action Breadcrumbs** — Tracks taps, navigation events, and gestures as context for every API call.

### Change Detection

- **Response Shape Tracking** — Detects added, removed, or modified fields in API responses between app versions.
- **New Endpoint Detection** — Identifies API endpoints called by the app that have no matching documentation.
- **Undocumented Endpoint Flags** — Flags endpoints present in your app but absent from `knownEndpoints` or `knownDocsSpec`.
- **Release Comparison** — Side-by-side diff of endpoints, response shapes, and latency across app versions.

### Visualization & Export

- **Network Waterfall** — Visual timeline showing parallel and serial API requests with timing bars.
- **API Timeline** — Chronological view grouped by hour with success/failure indicators.
- **Postman Export** — One-click export as a Postman v2.1 collection with all captured endpoints.
- **OpenAPI Export** — Auto-generated OpenAPI 3.0.3 specification with inferred schemas from real traffic.
- **Markdown Docs Export** — Generate readable API documentation with endpoints, shapes, diffs, and timeline.
- **HAR Export** — Export all captured requests as a standard HAR 1.2 file for browser dev tools compatibility.
- **cURL Export** — Copy any single request as a `curl` command for terminal reproduction.

### Developer Tooling

- **VSCode Extension** — Inline annotations next to `fetch`/`axios` calls showing captured status, latency, and method. Import reports and view directly in your editor.
- **cURL Copy** — Each expanded request card has a one-click "Copy cURL" button for terminal reproduction.
- **HAR Export** — Standard HAR 1.2 format compatible with browser dev tools and performance analysis tools.

### Reliability

- **Offline Queue + Retry** — Buffers exports and webhook dispatches when offline. Retries with exponential backoff (2ⁿ seconds, max 60s, max 5 retries).
- **App-Version Scoped** — Every log is tagged with the app version and environment. No cross-version pollution.

---

## Monorepo Structure

```
apiwitness/
├── apps/
│   └── web/                          # Landing page + report viewer
├── packages/
│   └── apiwitness-sdk/               # React Native / Expo SDK
│       └── plugin/                   # Expo config plugin
├── example/
│   └── example-expo/                 # Expo demo app
├── extensions/
│   └── vscode/                       # VSCode extension
├── LICENSE.md
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.json
```

---

## Packages

### `@apiwitness/sdk`

The core SDK that records API traffic in React Native and Expo apps.

- Patches global `fetch` automatically
- Provides `setupAxiosWitness()` for Axios interceptor
- Captures request/response payloads, headers, status codes, timing
- Masks sensitive fields before storing
- Persists logs to device storage
- Exports reports as JSON, Markdown, Postman, OpenAPI, HAR, cURL
- Expo config plugin for zero-code `app.json` setup
- Tracks breadcrumbs, error groups, performance budgets, alerts
- Performance regression detection (week-over-week latency trends)
- Offline queue with exponential backoff retry

### `@apiwitness/web`

A Next.js landing page and report viewer.

- Professional SaaS website with premium design
- Upload `apiwitness-report.json` and view in browser
- All data processed locally — nothing is uploaded to a server
- Summary dashboard cards, endpoint list, request/response inspection
- 11 report tabs: Logs, Endpoints, Shapes, Timeline, Waterfall,
  Breadcrumbs, Error Groups, Alerts, Budgets, Offline Queue, Releases
- Copy Markdown, download JSON / Postman / OpenAPI / HAR
- Per-request "Copy cURL" button for terminal reproduction

### VSCode Extension (`extensions/vscode`)

Inline API witness annotations directly in your editor.

- Inline decorations next to `fetch`/`axios` calls showing captured status, latency, and method
- Color-coded gutter indicators for quick visual scanning
- Webview report viewer panel inside VSCode
- Import reports via command palette

---

## Getting Started

See the [SDK README](./packages/apiwitness-sdk/README.md) for full
documentation.

```bash
# Install the SDK
pnpm add @apiwitness/sdk

# Or with npm
npm install @apiwitness/sdk
```

```typescript
import { startAPIWitness } from "@apiwitness/sdk";

await startAPIWitness({
  appName: "MyApp",
  appVersion: "1.0.0",
  environment: "development",
  recordSuccessfulRequests: true,
  sensitiveFields: ["password", "token", "apiKey", "secret"],
});
```

Or with the Expo config plugin in `app.json`:

```json
{
  "plugins": [
    ["@apiwitness/sdk", {
      "appName": "MyApp",
      "recordSuccessfulRequests": true
    }]
  ]
}
```

---

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run web app
pnpm --filter @apiwitness/web dev

# Run example Expo app
cd example/example-expo
pnpm run android

# Build VSCode extension
cd extensions/vscode
pnpm run build
```

---

## Security & Privacy

- All captured data stays on the device
- Sensitive fields are masked before storing
- Report viewer processes everything in the browser — no server upload
- No data leaves the app unless you explicitly export or share

---

## License

MIT — see [LICENSE.md](./LICENSE.md) for details.
