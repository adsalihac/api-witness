# Release Process

This document describes how to version, build, and publish the APIWitness
monorepo packages to npm.

---

## Packages

| Package | Path | npm | Status |
|---|---|---|---|
| `@apiwitness/sdk` | `packages/apiwitness-sdk` | public | Ready to publish |
| `@apiwitness/web` | `apps/web` | private | Landing page, not published |
| `example-expo` | `example/example-expo` | private | Demo app, not published |

Only `@apiwitness/sdk` is published to npm. The web app and example app
are private and distributed via git only.

---

## Prerequisites

- Node.js >= 18
- pnpm >= 10
- npm account with access to the `@apiwitness` org
- Logged in via `npm login`

```bash
npm login
# Verify:
npm whoami
```

---

## Versioning

We follow [Semantic Versioning](https://semver.org/):

- **Major** — Breaking API changes, SDK init signature changes
- **Minor** — New features, new exports, non-breaking additions
- **Patch** — Bug fixes, documentation, internal refactors

---

## Release Checklist

### 1. Update the SDK version

```bash
cd packages/apiwitness-sdk

# Patch bump (default)
pnpm version patch

# Or explicitly:
pnpm version 1.2.3
```

This updates `package.json` and creates a git tag.

### 2. Update dependencies in other packages

If the SDK's public API changed, update the version reference in:

- `example/example-expo/package.json`
- Any other workspace consumer

Use `"@apiwitness/sdk": "workspace:*"` for local development — this is
automatically resolved by pnpm.

### 3. Build all packages

```bash
# From repo root
pnpm build
```

Verify that:

- `@apiwitness/sdk` compiles without errors (`tsc`)
- `@apiwitness/web` builds successfully (`next build`)
- All TypeScript types are valid

### 4. Run quality checks

```bash
# Lint (if configured)
pnpm lint

# Verify the SDK exports are correct
node -e "const sdk = require('./packages/apiwitness-sdk'); console.log(Object.keys(sdk))"
```

### 5. Update READMEs

- `README.md` — Feature list, version references, quickstart code
- `packages/apiwitness-sdk/README.md` — Config table, API docs, examples
- Ensure all code snippets are up to date

### 6. Commit and tag

```bash
git add .
git commit -m "release: @apiwitness/sdk v<version>"
git tag "sdk-v<version>"
git push && git push --tags
```

---

## Publishing to npm

### First-time publish

The SDK is currently marked `"private": true`. To publish, first remove
that field or set it to `false`:

```bash
cd packages/apiwitness-sdk
```

Edit `package.json`:

```diff
-  "private": true,
+  "publishConfig": {
+    "access": "public"
+  },
```

Then publish:

```bash
pnpm publish
```

### Subsequent publishes

```bash
cd packages/apiwitness-sdk
pnpm publish
```

The `publishConfig` ensures `@apiwitness/sdk` is published as a public
scoped package (scoped packages are private by default on npm).

### Verify the publish

```bash
# Install from npm in a temp directory
mkdir /tmp/apiwitness-test && cd /tmp/apiwitness-test
npm init -y
npm install @apiwitness/sdk
node -e "const sdk = require('@apiwitness/sdk'); console.log('OK:', Object.keys(sdk))"
```

---

## Post-Release

1. **Update the web landing page** — If the landing page references the
   SDK version, update it in `apps/web/src/app/page.tsx`.
2. **Update the example app** — Run `pnpm update @apiwitness/sdk` in
   `example/example-expo` to pull the latest.
3. **GitHub Release** — Create a GitHub Release from the tag with
   changelog notes.

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `npm publish` fails with 404 | Package may still be private. Check `publishConfig.access` |
| `workspace:*` not resolving | Run `pnpm install` from root first |
| Type errors after version bump | Check `tsconfig.json` paths and `types` field in `package.json` |
| `expo-file-system` peer dep warning | Expected — the SDK lists it as a hard dependency for Expo apps |
