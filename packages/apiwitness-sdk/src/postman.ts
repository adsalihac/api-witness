import { getAllLogs } from "./storage";
import { getConfig } from "./config";
import { PostmanCollection, PostmanItem } from "./types";

function urlToParts(raw: string): { host: string[]; path: string[] } {
  try {
    const u = new URL(raw);
    const host = u.hostname.split(".");
    const path = u.pathname.split("/").filter(Boolean);
    return { host, path };
  } catch {
    return { host: [], path: [] };
  }
}

export function exportPostmanCollection(): PostmanCollection {
  const cfg = getConfig();
  const logs = getAllLogs();

  const seen = new Set<string>();
  const items: PostmanItem[] = [];

  for (const log of logs) {
    const key = `${log.method}:${log.url}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const { host, path } = urlToParts(log.url);
    const headers = log.requestHeaders
      ? Object.entries(log.requestHeaders).map(([key, value]) => ({
          key,
          value: String(value),
        }))
      : [];

    const item: PostmanItem = {
      name: `${log.method} ${log.url}`,
      request: {
        method: log.method,
        header: headers,
        url: {
          raw: log.url,
          host,
          path,
        },
      },
      response: [],
    };

    if (log.requestBody) {
      item.request.body = {
        mode: "raw",
        raw: JSON.stringify(log.requestBody, null, 2),
      };
    }

    items.push(item);
  }

  return {
    info: {
      name: `${cfg.appName} API Collection`,
      description: `Auto-generated Postman collection from ${cfg.appName} v${cfg.appVersion} (${cfg.environment})`,
      schema:
        "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    },
    item: items,
  };
}
