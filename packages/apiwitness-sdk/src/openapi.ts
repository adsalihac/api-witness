import { getAllLogs } from "./storage";
import { getConfig } from "./config";
import { OpenAPISpec } from "./types";

function inferType(value: any): Record<string, any> {
  if (value === null || value === undefined) return { type: "string", nullable: true };
  if (Array.isArray(value)) {
    const itemType =
      value.length > 0 ? inferType(value[0]) : { type: "string" };
    return { type: "array", items: itemType };
  }
  if (typeof value === "object") {
    const properties: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      properties[key] = inferType(val);
    }
    return { type: "object", properties };
  }
  if (typeof value === "string") return { type: "string" };
  if (typeof value === "number") return { type: "number" };
  if (typeof value === "boolean") return { type: "boolean" };
  return { type: "string" };
}

function normalizePathForOpenAPI(url: string): string {
  try {
    const u = new URL(url);
    const segments = u.pathname.split("/").map((seg) => {
      if (/^\d+$/.test(seg)) return "{id}";
      if (/^[0-9a-f]{8,}$/i.test(seg)) return "{id}";
      return seg;
    });
    return segments.join("/");
  } catch {
    return url;
  }
}

export function generateOpenAPISpec(): OpenAPISpec {
  const cfg = getConfig();
  const logs = getAllLogs();

  const paths: Record<string, Record<string, any>> = {};

  for (const log of logs) {
    const path = normalizePathForOpenAPI(log.url);
    const method = log.method.toLowerCase();

    if (!paths[path]) paths[path] = {};

    const responses: Record<string, any> = {};
    const statusKey = String(log.status || 200);

    const responseSchema = log.responseBody
      ? inferType(log.responseBody)
      : { type: "string" };

    responses[statusKey] = {
      description: log.success ? "Successful response" : "Error response",
      content: {
        "application/json": {
          schema: responseSchema,
        },
      },
    };

    const requestBody =
      log.requestBody && method !== "get"
        ? {
            required: true,
            content: {
              "application/json": {
                schema: inferType(log.requestBody),
              },
            },
          }
        : undefined;

    paths[path][method] = {
      summary: `${log.method} ${path}`,
      parameters: [],
      requestBody,
      responses,
    };
  }

  return {
    openapi: "3.0.3",
    info: {
      title: `${cfg.appName} API`,
      version: cfg.appVersion,
      description: `Auto-generated OpenAPI spec from ${cfg.appName} traffic (${cfg.environment})`,
    },
    paths,
  };
}
