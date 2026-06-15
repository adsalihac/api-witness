import { ApiLog, HARLog } from "./types";

function statusText(code: number): string {
  const map: Record<number, string> = {
    200: "OK", 201: "Created", 204: "No Content",
    301: "Moved Permanently", 302: "Found", 304: "Not Modified",
    400: "Bad Request", 401: "Unauthorized", 403: "Forbidden",
    404: "Not Found", 405: "Method Not Allowed", 409: "Conflict",
    422: "Unprocessable Entity", 429: "Too Many Requests",
    500: "Internal Server Error", 502: "Bad Gateway",
    503: "Service Unavailable", 504: "Gateway Timeout",
  };
  return map[code] || "Unknown";
}

function toHeaders(headers?: Record<string, any>): { name: string; value: string }[] {
  if (!headers) return [];
  return Object.entries(headers).map(([name, value]) => ({
    name,
    value: String(value),
  }));
}

function toQueryString(url: string): { name: string; value: string }[] {
  const idx = url.indexOf("?");
  if (idx === -1) return [];
  const params = new URLSearchParams(url.slice(idx));
  const result: { name: string; value: string }[] = [];
  params.forEach((value, name) => result.push({ name, value }));
  return result;
}

export function toHAR(logs: ApiLog[], appName = "APIWitness", version = "1.0.0"): HARLog {
  const entries = logs.map((log) => {
    const postData = log.requestBody
      ? {
          mimeType: log.requestHeaders?.["Content-Type"] as string || "application/json",
          text: typeof log.requestBody === "string"
            ? log.requestBody
            : JSON.stringify(log.requestBody),
        }
      : undefined;

    const responseText = log.responseBody
      ? typeof log.responseBody === "string"
        ? log.responseBody
        : JSON.stringify(log.responseBody)
      : undefined;

    return {
      startedDateTime: log.timestamp,
      time: log.duration,
      request: {
        method: log.method.toUpperCase(),
        url: log.url,
        httpVersion: "HTTP/1.1",
        headers: toHeaders(log.requestHeaders),
        queryString: toQueryString(log.url),
        postData,
        headersSize: -1,
        bodySize: postData ? postData.text.length : 0,
      },
      response: {
        status: log.status || 0,
        statusText: statusText(log.status),
        httpVersion: "HTTP/1.1",
        headers: toHeaders(log.responseHeaders),
        content: {
          mimeType: log.responseHeaders?.["content-type"] as string || "application/json",
          size: responseText ? responseText.length : 0,
          text: responseText,
        },
        headersSize: -1,
        bodySize: responseText ? responseText.length : 0,
      },
      cache: {},
      timings: {
        send: 0,
        wait: log.duration,
        receive: 0,
      },
    };
  });

  return {
    log: {
      version: "1.2",
      creator: { name: appName, version },
      entries,
    },
  };
}
