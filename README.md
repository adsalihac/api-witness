# APIWitness

**API Observability for Mobile Apps**

> Detect breaking API changes before users do. Generate documentation from
> real mobile app usage.

APIWitness is a React Native / Expo SDK + web dashboard that helps mobile
teams record failed API requests, detect new endpoints, track response
changes, find missing documentation, and export Postman collections and
OpenAPI specs.

---

## Monorepo Structure

```
apiwitness/
├── apps/
│   └── web/                          # Landing page + report viewer
├── packages/
│   └── apiwitness-sdk/               # React Native / Expo SDK
├── example/
│   └── example-expo/                 # Expo demo app
├── package.json                      # Root workspace config
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
- Exports reports as JSON, Markdown, Postman, OpenAPI

### `@apiwitness/web`

A Next.js landing page and report viewer.

- Professional SaaS website
- Upload `apiwitness-report.json` and view in browser
- All data processed locally — nothing is uploaded to a server
- Summary dashboard cards, endpoint list, request/response inspection
- Copy Markdown, download JSON

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
});
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
```

---

## Security & Privacy

- All captured data stays on the device
- Sensitive fields are masked before storing
- Report viewer processes everything in the browser — no server upload
- No data leaves the app unless you explicitly export or share

---

## License

MIT
