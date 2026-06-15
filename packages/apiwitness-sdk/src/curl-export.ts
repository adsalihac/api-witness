import { ApiLog } from "./types";

export function toCurl(log: ApiLog): string {
  const method = log.method.toUpperCase();
  let curl = `curl -X ${method} '${log.url}'`;

  if (log.requestHeaders) {
    for (const [key, value] of Object.entries(log.requestHeaders)) {
      curl += ` \\\n  -H '${key}: ${String(value)}'`;
    }
  }

  if (log.requestBody && typeof log.requestBody === "object") {
    const body = JSON.stringify(log.requestBody);
    curl += ` \\\n  -d '${body.replace(/'/g, "\\'")}'`;
  } else if (typeof log.requestBody === "string") {
    curl += ` \\\n  -d '${log.requestBody.replace(/'/g, "\\'")}'`;
  }

  return curl;
}

export function toCurls(logs: ApiLog[]): string {
  return logs.map((log) => toCurl(log)).join("\n\n");
}
