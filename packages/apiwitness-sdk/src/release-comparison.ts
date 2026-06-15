import { getAllLogs } from "./storage";
import { getConfig } from "./config";
import { ReleaseComparison } from "./types";
import { getVersionShapes, getShapeDiffs } from "./shape-diff";

export function compareVersions(versionA?: string, versionB?: string): ReleaseComparison {
  const cfg = getConfig();
  const a = versionA || cfg.appVersion;
  const b = versionB || cfg.appVersion;

  const logs = getAllLogs();
  const logsA = logs.filter((l) => l.timestamp < "2026-01-01" || true);
  const logsB = logs;

  const endpointsA = new Set(logsA.map((l) => `${l.method}:${l.url}`));
  const endpointsB = new Set(logsB.map((l) => `${l.method}:${l.url}`));

  const added: string[] = [];
  const removed: string[] = [];
  const changed: string[] = [];

  for (const ep of endpointsB) {
    if (!endpointsA.has(ep)) added.push(ep);
  }
  for (const ep of endpointsA) {
    if (!endpointsB.has(ep)) removed.push(ep);
  }

  const latencyMapA = new Map<string, number[]>();
  const latencyMapB = new Map<string, number[]>();

  for (const log of logsA) {
    const key = `${log.method}:${log.url}`;
    if (!latencyMapA.has(key)) latencyMapA.set(key, []);
    latencyMapA.get(key)!.push(log.duration);
  }
  for (const log of logsB) {
    const key = `${log.method}:${log.url}`;
    if (!latencyMapB.has(key)) latencyMapB.set(key, []);
    latencyMapB.get(key)!.push(log.duration);
  }

  const latencyChanges: Record<string, any> = {};
  for (const [key, durations] of latencyMapB) {
    if (!latencyMapA.has(key)) continue;
    const avgA = Math.round(latencyMapA.get(key)!.reduce((s, d) => s + d, 0) / latencyMapA.get(key)!.length);
    const avgB = Math.round(durations.reduce((s, d) => s + d, 0) / durations.length);
    const diff = avgB - avgA;
    if (Math.abs(diff) > 5) {
      latencyChanges[key] = { avgBefore: avgA, avgAfter: avgB, diff };
    }
  }

  const shapeDiffs = getShapeDiffs();
  const flattenedShapes: Record<string, { added: string[]; removed: string[] }> = {};
  for (const [key, diff] of Object.entries(shapeDiffs)) {
    flattenedShapes[key] = { added: diff.added, removed: diff.removed };
  }

  return {
    versionA: a,
    versionB: b,
    endpointChanges: { added, removed, changed },
    shapeDiffs: flattenedShapes,
    latencyChanges,
  };
}
