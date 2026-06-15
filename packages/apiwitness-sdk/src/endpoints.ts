import { getAllLogs, getFailedLogs } from "./storage";
import { getConfig } from "./config";
import { EndpointInfo } from "./types";

function normalizePath(url: string): string {
  try {
    const u = new URL(url);
    const segments = u.pathname.split("/").map((seg) => {
      if (/^\d+$/.test(seg)) return ":id";
      if (/^[0-9a-f]{8,}$/i.test(seg)) return ":id";
      return seg;
    });
    return segments.join("/");
  } catch {
    return url;
  }
}

export function getDetectedEndpoints(): EndpointInfo[] {
  const logs = getAllLogs();
  const cfg = getConfig();
  const knownEndpoints = cfg.knownEndpoints || [];

  const grouped = new Map<string, EndpointInfo>();

  for (const log of logs) {
    const path = normalizePath(log.url);
    const key = `${log.method}:${path}`;

    const existing = grouped.get(key);
    if (existing) {
      existing.count++;
      existing.lastSeen = log.timestamp;
      if (!existing.statusCodes.includes(log.status)) {
        existing.statusCodes.push(log.status);
      }
    } else {
      grouped.set(key, {
        method: log.method,
        path,
        count: 1,
        lastSeen: log.timestamp,
        statusCodes: [log.status],
        isKnown: knownEndpoints.some(
          (k) => k.toLowerCase() === path.toLowerCase()
        ),
      });
    }
  }

  return Array.from(grouped.values()).sort(
    (a, b) => b.count - a.count
  );
}

export function getNewEndpoints(): EndpointInfo[] {
  return getDetectedEndpoints().filter((e) => !e.isKnown);
}

export function getUndocumentedEndpoints(): EndpointInfo[] {
  const cfg = getConfig();
  const knownSpec = cfg.knownDocsSpec || {};
  const knownPaths = Object.keys(knownSpec).map((p) => p.toLowerCase());

  return getDetectedEndpoints().filter((e) => {
    const normalizedPath = e.path.toLowerCase();
    return !knownPaths.some((kp) => normalizedPath.startsWith(kp));
  });
}
