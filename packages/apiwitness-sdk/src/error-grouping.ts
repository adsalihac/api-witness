import { getAllLogs } from "./storage";
import { ErrorGroup, ApiLog } from "./types";

function normalizeError(log: ApiLog): string {
  const msg = log.errorMessage || `HTTP ${log.status}`;
  const url = log.url.replace(/\/\d+/g, "/:id").replace(/\/[0-9a-f]{8,}/gi, "/:id");
  const status = log.status ? `[${Math.floor(log.status / 100)}xx]` : "[0xx]";
  return `${log.method} ${url} ${status} ${msg.split(" ").slice(0, 4).join(" ")}`;
}

export function getErrorGroups(): ErrorGroup[] {
  const logs = getAllLogs();
  const failures = logs.filter((l) => !l.success);
  const groups = new Map<string, ApiLog[]>();

  for (const log of failures) {
    const key = normalizeError(log);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(log);
  }

  const result: ErrorGroup[] = [];
  for (const [label, items] of groups) {
    const sorted = items.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    const statusCodes = [...new Set(items.map((l) => l.status))];
    const methods = [...new Set(items.map((l) => l.method))];
    const endpoints = [...new Set(items.map((l) => l.url))];
    const errorMessages = [
      ...new Set(items.map((l) => l.errorMessage).filter(Boolean)),
    ] as string[];

    result.push({
      id: `group_${label.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 40)}`,
      label,
      count: items.length,
      statusCodes: statusCodes.sort(),
      methods,
      endpoints,
      errorMessages,
      lastSeen: sorted[0].timestamp,
      logs: sorted,
    });
  }

  return result.sort((a, b) => b.count - a.count);
}

export function getAISummary(): string {
  const groups = getErrorGroups();
  if (groups.length === 0) return "No errors detected.";

  let summary = `Found ${groups.length} distinct error patterns:\n\n`;
  for (const group of groups.slice(0, 5)) {
    summary += `- **${group.label}** — ${group.count} occurrence(s)\n`;
    summary += `  Methods: ${group.methods.join(", ")}\n`;
    summary += `  Status codes: ${group.statusCodes.join(", ")}\n`;
    if (group.errorMessages.length > 0) {
      summary += `  Sample error: "${group.errorMessages[0]}"\n`;
    }
    summary += `\n`;
  }
  return summary;
}
