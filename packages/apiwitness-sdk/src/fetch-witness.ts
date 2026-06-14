import { addLog } from "./storage";
import { maskSensitiveFields } from "./masker";
import { getConfig } from "./config";
import { generateId, getTimestamp, isFailureStatus } from "./helpers";

const originalFetch = globalThis.fetch;

function tryParseBody(body: any): any {
  if (!body) return undefined;
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return body;
    }
  }
  return body;
}

function getUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

function getMethod(input: RequestInfo | URL, init?: RequestInit): string {
  if (init?.method) return init.method.toUpperCase();
  if (typeof input !== "string" && !(input instanceof URL) && input.method) {
    return input.method.toUpperCase();
  }
  return "GET";
}

function extractHeaders(init?: RequestInit): Record<string, any> {
  const headers: Record<string, any> = {};
  if (!init?.headers) return headers;
  const h = init.headers as Record<string, any>;
  if (typeof h.forEach === "function") {
    h.forEach((value: string, key: string) => { headers[key] = value; });
  } else if (typeof h === "object") {
    Object.entries(h).forEach(([key, value]) => { headers[key] = value; });
  }
  return headers;
}

async function cloneResponse(res: Response): Promise<{ body: any; headers: Record<string, any> }> {
  const cloned = res.clone();
  const text = await cloned.text();
  const headers: Record<string, any> = {};
  cloned.headers.forEach((value, key) => { headers[key] = value; });
  let body: any = text;
  try { body = JSON.parse(text); } catch {}
  return { body, headers };
}

export function setupFetchWitness(): void {
  if (!originalFetch) return;

  const witnessFetch: typeof fetch = async (input, init) => {
    const startTime = performance.now();
    const method = getMethod(input, init);
    const url = getUrl(input);
    const requestHeaders = extractHeaders(init);

    let requestBody: any = undefined;
    if (init?.body) {
      requestBody = tryParseBody(init.body);
    }

    try {
      const response = await originalFetch(input, init);
      const endTime = performance.now();
      const { body: responseBody, headers: responseHeaders } = await cloneResponse(response);

      const success = !isFailureStatus(response.status);
      const cfg = getConfig();

      if (!success || cfg.recordSuccessfulRequests) {
        await addLog({
          id: generateId(),
          method,
          url,
          status: response.status,
          success,
          requestHeaders: maskSensitiveFields(requestHeaders),
          responseHeaders: maskSensitiveFields(responseHeaders),
          requestBody: maskSensitiveFields(requestBody),
          responseBody: maskSensitiveFields(responseBody),
          duration: Math.round(endTime - startTime),
          timestamp: getTimestamp(),
        });
      }

      return response;
    } catch (error: any) {
      const endTime = performance.now();

      await addLog({
        id: generateId(),
        method,
        url,
        status: 0,
        success: false,
        requestHeaders: maskSensitiveFields(requestHeaders),
        requestBody: maskSensitiveFields(requestBody),
        errorMessage: error.message || "Network Error",
        duration: Math.round(endTime - startTime),
        timestamp: getTimestamp(),
      });

      throw error;
    }
  };

  globalThis.fetch = witnessFetch;
}
