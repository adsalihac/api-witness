import * as vscode from "vscode";

interface ApiLog {
  id: string;
  method: string;
  url: string;
  status: number;
  success: boolean;
  duration: number;
  timestamp: string;
  errorMessage?: string;
}

interface FailureReport {
  logs?: ApiLog[];
  failures: ApiLog[];
}

let reportData: FailureReport | null = null;
let decorationTypes: Map<string, vscode.TextEditorDecorationType> = new Map();

const FETCH_PATTERN = /\b(fetch|axios)\s*[\(\.]/g;

function getMethodAndUrl(line: string): { method: string; url: string } | null {
  const fetchMatch = line.match(/fetch\s*\(\s*['"`]([^'"`]+)['"`]/);
  if (fetchMatch) return { method: "GET", url: fetchMatch[1] };

  const axiosMatch = line.match(/axios\.(get|post|put|patch|delete|head|options)\s*\(\s*['"`]([^'"`]+)['"`]/);
  if (axiosMatch) return { method: axiosMatch[1].toUpperCase(), url: axiosMatch[2] };

  const fetchPostMatch = line.match(/fetch\s*\(\s*['"`]([^'"`]+)['"`][^)]*method\s*:\s*['"`](GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)['"`]/i);
  if (fetchPostMatch) return { method: fetchPostMatch[2].toUpperCase(), url: fetchPostMatch[1] };

  return null;
}

function matchLogs(line: string): ApiLog[] {
  if (!reportData) return [];
  const parsed = getMethodAndUrl(line);
  if (!parsed) return [];

  const logs = reportData.logs || reportData.failures;
  return logs.filter(
    (l) => l.method === parsed!.method && l.url === parsed!.url
  );
}

function clearDecorations(editor: vscode.TextEditor) {
  for (const dec of decorationTypes.values()) {
    editor.setDecorations(dec, []);
  }
}

function updateDecorations(editor: vscode.TextEditor) {
  if (!editor || !reportData) return;

  clearDecorations(editor);

  const config = vscode.workspace.getConfiguration("apiwitness");
  const style = config.get<string>("decorationStyle", "inline");

  const doc = editor.document;

  for (let lineIdx = 0; lineIdx < doc.lineCount; lineIdx++) {
    const line = doc.lineAt(lineIdx);
    const matches = line.text.match(FETCH_PATTERN);
    if (!matches) continue;

    const matchedLogs = matchLogs(line.text);
    if (matchedLogs.length === 0) continue;

    const latest = matchedLogs.reduce((a, b) =>
      new Date(a.timestamp) > new Date(b.timestamp) ? a : b
    );

    const statusColor = latest.success ? "#22c55e" : "#ef4444";
    const label = `${latest.method} ${latest.status} ${latest.duration}ms`;

    if (style === "inline" || style === "both") {
      const key = `inline-${lineIdx}`;
      if (decorationTypes.has(key)) decorationTypes.get(key)!.dispose();

      const dec = vscode.window.createTextEditorDecorationType({
        after: {
          contentText: `  ⬤ ${label}`,
          color: statusColor,
          fontWeight: "500",
          fontSize: "11px",
          fontStyle: "italic",
        },
        isWholeLine: true,
      });
      decorationTypes.set(key, dec);
      editor.setDecorations(dec, [
        { range: new vscode.Range(lineIdx, line.text.length, lineIdx, line.text.length) },
      ]);
    }

    if (style === "gutter" || style === "both") {
      const key = `gutter-${lineIdx}`;
      if (decorationTypes.has(key)) decorationTypes.get(key)!.dispose();

      const dec = vscode.window.createTextEditorDecorationType({
        gutterIconPath: undefined,
        gutterIconSize: "contain",
        overviewRulerColor: statusColor,
        overviewRulerLane: vscode.OverviewRulerLane.Right,
      });
      decorationTypes.set(key, dec);
      editor.setDecorations(dec, [
        { range: new vscode.Range(lineIdx, 0, lineIdx, 0) },
      ]);
    }
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log("APIWitness extension activated");

  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.text = "$(eye) APIWitness";
  statusBarItem.tooltip = reportData
    ? `Watching ${reportData.logs?.length || reportData.failures.length} requests`
    : "No report loaded";
  statusBarItem.command = "apiwitness.openReport";
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  const openCommand = vscode.commands.registerCommand(
    "apiwitness.openReport",
    () => {
      if (!reportData) {
        vscode.window.showInformationMessage(
          "No APIWitness report loaded. Use 'APIWitness: Import Report JSON' to load one."
        );
        return;
      }

      const panel = vscode.window.createWebviewPanel(
        "apiwitnessReport",
        "APIWitness Report",
        vscode.ViewColumn.Beside,
        { enableScripts: true }
      );

      panel.webview.html = getReportHtml(reportData);
    }
  );
  context.subscriptions.push(openCommand);

  const importCommand = vscode.commands.registerCommand(
    "apiwitness.importReport",
    async () => {
      const result = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectMany: false,
        filters: { "JSON Files": ["json"] },
      });

      if (!result || result.length === 0) return;

      const fileUri = result[0];
      const bytes = await vscode.workspace.fs.readFile(fileUri);
      const content = new TextDecoder().decode(bytes);

      try {
        reportData = JSON.parse(content) as FailureReport;
        vscode.window.showInformationMessage(
          `APIWitness report loaded: ${reportData.appName} v${reportData.appVersion} (${reportData.totalRequests} requests)`
        );
        statusBarItem.text = `$(eye) APIWitness (${reportData.totalRequests})`;

        const editor = vscode.window.activeTextEditor;
        if (editor) updateDecorations(editor);
      } catch {
        vscode.window.showErrorMessage("Invalid APIWitness report file.");
      }
    }
  );
  context.subscriptions.push(importCommand);

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) updateDecorations(editor);
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("apiwitness")) {
        const editor = vscode.window.activeTextEditor;
        if (editor) updateDecorations(editor);
      }
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(() => {
      const editor = vscode.window.activeTextEditor;
      if (editor) updateDecorations(editor);
    })
  );

  if (vscode.window.activeTextEditor) {
    updateDecorations(vscode.window.activeTextEditor);
  }
}

export function deactivate() {
  for (const dec of decorationTypes.values()) {
    dec.dispose();
  }
  decorationTypes.clear();
}

function getReportHtml(data: FailureReport): string {
  const logs = data.logs || data.failures;
  const successRate = data.totalRequests
    ? Math.round(
        ((data.totalRequests - data.failedRequests) / data.totalRequests) * 100
      )
    : 0;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>APIWitness Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 16px; background: #1e1e1e; color: #ccc; }
    h1 { font-size: 18px; margin: 0 0 4px; color: #fff; }
    .meta { font-size: 11px; color: #888; margin-bottom: 16px; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px; }
    .stat { background: #2d2d2d; border-radius: 8px; padding: 12px; }
    .stat-value { font-size: 20px; font-weight: 700; color: #fff; }
    .stat-label { font-size: 10px; color: #888; margin-top: 2px; }
    .log { background: #2d2d2d; border-radius: 8px; padding: 10px; margin-bottom: 6px; display: flex; align-items: center; gap: 8px; font-size: 12px; }
    .method { display: inline-block; padding: 1px 6px; border-radius: 4px; font-weight: 600; font-size: 10px; background: #333; color: #aaa; }
    .method.GET { background: #1a4731; color: #4ade80; }
    .method.POST { background: #1a3a5c; color: #60a5fa; }
    .method.PUT { background: #4a3a1a; color: #fbbf24; }
    .method.DELETE { background: #4a1a1a; color: #f87171; }
    .url { flex: 1; color: #aaa; font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .status { font-weight: 600; }
    .status.success { color: #4ade80; }
    .status.failure { color: #f87171; }
    .duration { color: #888; }
  </style>
</head>
<body>
  <h1>${data.appName}</h1>
  <div class="meta">v${data.appVersion} · ${data.environment} · ${data.reportId}</div>
  <div class="stats">
    <div class="stat"><div class="stat-value">${data.totalRequests}</div><div class="stat-label">Total</div></div>
    <div class="stat"><div class="stat-value">${data.failedRequests}</div><div class="stat-label">Failed</div></div>
    <div class="stat"><div class="stat-value">${successRate}%</div><div class="stat-label">Success Rate</div></div>
    <div class="stat"><div class="stat-value">${new Set(logs.map(l => l.url)).size}</div><div class="stat-label">Endpoints</div></div>
  </div>
  ${logs.slice(0, 50).map(l => `
    <div class="log">
      <span class="method ${l.method}">${l.method}</span>
      <span class="url">${l.url}</span>
      <span class="status ${l.success ? 'success' : 'failure'}">${l.status || 'ERR'}</span>
      <span class="duration">${l.duration}ms</span>
    </div>
  `).join("")}
  ${logs.length > 50 ? `<p style="font-size:11px;color:#666;text-align:center;margin-top:8px">Showing 50 of ${logs.length} requests</p>` : ""}
</body>
</html>`;
}
