"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Cpu, Globe, Download } from "lucide-react";
import { MethodBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { OpenApiDoc } from "./openapi-input";

interface Props {
  spec: OpenApiDoc;
}

function generateExample(schema: any, depth = 0): any {
  if (depth > 3) return null;
  if (!schema) return null;
  if (schema.example !== undefined) return schema.example;
  if (schema.$ref) return { [`$$ref`]: schema.$ref };

  switch (schema.type) {
    case "string":
      if (schema.enum) return schema.enum[0];
      if (schema.format === "date-time") return new Date().toISOString();
      if (schema.format === "date") return "2024-01-01";
      if (schema.format === "email") return "user@example.com";
      if (schema.format === "uri" || schema.format === "url") return "https://example.com";
      return "string";
    case "integer":
    case "number":
      return schema.minimum ?? 0;
    case "boolean":
      return true;
    case "array":
      if (schema.items) return [generateExample(schema.items, depth + 1)];
      return [];
    case "object":
      if (!schema.properties) return {};
      const obj: Record<string, any> = {};
      for (const [key, prop] of Object.entries<any>(schema.properties)) {
        obj[key] = generateExample(prop, depth + 1);
      }
      return obj;
    default:
      if (schema.properties) {
        const obj2: Record<string, any> = {};
        for (const [key, prop] of Object.entries<any>(schema.properties)) {
          obj2[key] = generateExample(prop, depth + 1);
        }
        return obj2;
      }
      return null;
  }
}

function resolveRef(ref: string, spec: OpenApiDoc): any {
  const parts = ref.replace(/^#\//, "").split("/");
  let current: any = spec;
  for (const part of parts) {
    if (current == null) return null;
    current = current[part];
  }
  return current;
}

function resolveSchema(schema: any, spec: OpenApiDoc): any {
  if (!schema) return null;
  if (schema.$ref) return resolveSchema(resolveRef(schema.$ref, spec), spec);
  if (schema.type === "array" && schema.items?.$ref) {
    return { ...schema, items: resolveSchema(schema.items, spec) };
  }
  if (schema.properties) {
    const resolved: Record<string, any> = {};
    for (const [key, prop] of Object.entries<any>(schema.properties)) {
      resolved[key] = resolveSchema(prop, spec);
    }
    return { ...schema, properties: resolved };
  }
  return schema;
}

export function MockApi({ spec }: Props) {
  const [baseUrl, setBaseUrl] = useState("https://api.mockapi.io");
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);

  const endpoints = useMemo(() => {
    const result: { path: string; method: string; operation: any; exampleBody: any; exampleResponse: any }[] = [];
    if (!spec.paths) return result;

    for (const [path, pathItem] of Object.entries(spec.paths)) {
      for (const [method, operation] of Object.entries<any>(pathItem || {})) {
        if (!["get", "post", "put", "patch", "delete"].includes(method)) continue;
        const reqSchema = operation.requestBody?.content?.["application/json"]?.schema;
        const resSchema = operation.responses?.["200"]?.content?.["application/json"]?.schema;
        const resolvedReq = reqSchema ? resolveSchema(reqSchema, spec) : null;
        const resolvedRes = resSchema ? resolveSchema(resSchema, spec) : null;
        result.push({
          path,
          method,
          operation,
          exampleBody: generateExample(resolvedReq),
          exampleResponse: generateExample(resolvedRes),
        });
      }
    }
    return result;
  }, [spec.paths, spec]);

  const copyToClipboard = useCallback(async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const generateMockJson = useCallback(() => {
    const mock: Record<string, any> = {};
    for (const ep of endpoints) {
      const route = `${ep.method.toUpperCase()} ${ep.path}`;
      mock[route] = ep.exampleResponse;
    }
    return JSON.stringify(mock, null, 2);
  }, [endpoints]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-neutral-500" />
          <h3 className="text-lg font-semibold text-neutral-900">Mock API Generator</h3>
        </div>
        <Button variant="secondary" size="sm" onClick={() => copyToClipboard(generateMockJson(), "all")}>
          {copied === "all" ? <Check className="w-3 h-3" /> : <Download className="w-3 h-3" />}
          {copied === "all" ? "Copied!" : "Export Mock JSON"}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder="Mock server base URL..."
          className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
        />
      </div>

      <div className="grid gap-3">
        {endpoints.map((ep) => {
          const id = `${ep.method}-${ep.path}`;
          const mockUrl = `${baseUrl}${ep.path}`;
          const isSelected = selectedEndpoint === id;
          return (
            <div
              key={id}
              className={cn(
                "border rounded-xl overflow-hidden bg-white transition-all",
                isSelected ? "border-indigo-300 shadow-sm" : "border-neutral-200"
              )}
            >
              <button
                onClick={() => setSelectedEndpoint(isSelected ? null : id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors text-left"
              >
                <MethodBadge method={ep.method} />
                <span className="font-mono text-sm font-medium text-neutral-800 flex-1 truncate">{ep.path}</span>
                <span className="text-xs text-neutral-400">{ep.operation.summary || ""}</span>
              </button>

              {isSelected && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="border-t border-neutral-200">
                  <div className="p-4 space-y-3 text-sm">
                    <div>
                      <span className="text-xs font-medium text-neutral-500">Mock URL</span>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 text-xs font-mono bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-indigo-600 truncate">
                          {mockUrl}
                        </code>
                        <button onClick={() => copyToClipboard(mockUrl, `url-${id}`)} className="p-1.5 rounded-md hover:bg-neutral-100 transition-colors">
                          {copied === `url-${id}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-neutral-400" />}
                        </button>
                      </div>
                    </div>

                    {ep.exampleBody && (
                      <div>
                        <span className="text-xs font-medium text-neutral-500">Example Request Body</span>
                        <pre className="mt-1 bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-xs font-mono text-neutral-600 overflow-x-auto max-h-32 overflow-y-auto">
                          {JSON.stringify(ep.exampleBody, null, 2)}
                        </pre>
                      </div>
                    )}

                    {ep.exampleResponse && (
                      <div>
                        <span className="text-xs font-medium text-neutral-500">Example Response (200)</span>
                        <div className="relative mt-1">
                          <button
                            onClick={() => copyToClipboard(JSON.stringify(ep.exampleResponse, null, 2), `res-${id}`)}
                            className="absolute top-2 right-2 p-1 rounded-md bg-white/80 hover:bg-white transition-colors"
                          >
                            {copied === `res-${id}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-neutral-400" />}
                          </button>
                          <pre className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 pr-10 text-xs font-mono text-neutral-600 overflow-x-auto max-h-48 overflow-y-auto">
                            {JSON.stringify(ep.exampleResponse, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => copyToClipboard(JSON.stringify({ method: ep.method.toUpperCase(), url: mockUrl, body: ep.exampleBody }, null, 2), `curl-${id}`)}>
                        {copied === `curl-${id}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copied === `curl-${id}` ? "Copied!" : "Copy as cURL"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {endpoints.length === 0 && (
        <div className="text-center py-12 text-neutral-400">
          <Cpu className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No endpoints found in spec.</p>
        </div>
      )}
    </div>
  );
}
