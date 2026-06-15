# APIWitness VSCode Extension

Inline API witness annotations for `fetch`/`axios` calls in JavaScript and TypeScript files.

## Features

- **Inline Decorations**: See captured request status, latency, and method next to your `fetch`/`axios` calls
- **Gutter Indicators**: Color-coded gutters for quick visual scanning
- **Report Viewer**: Open a full report webview from within VSCode
- **Auto-detect**: Matches URLs in your code with captured API witness logs

## Usage

1. Export an APIWitness report from your app (JSON file)
2. Run **APIWitness: Import Report JSON** from the command palette
3. Open a JavaScript/TypeScript file with `fetch` or `axios` calls
4. Annotations appear inline next to matched calls

### Commands

| Command | Description |
|---------|-------------|
| `APIWitness: Open Report Viewer` | Opens the report webview panel |
| `APIWitness: Import Report JSON` | Import an APIWitness report file |

### Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `apiwitness.reportPath` | `""` | Path to the APIWitness report JSON |
| `apiwitness.decorationStyle` | `inline` | `inline`, `gutter`, or `both` |
