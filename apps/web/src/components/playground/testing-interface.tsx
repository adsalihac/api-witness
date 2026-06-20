"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Loader2, Copy, Check, Terminal, Plus, X } from "lucide-react";
import { MethodBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { OpenApiDoc } from "./openapi-input";

interface Props {
  spec: OpenApiDoc;
}

type Header = { key: string; value: string };

function fillPathParams(path: string, params: Record<string, string>): string {
  return path.replace(/\{(\w+)\}/g, (_, name) => params[name] || `{${name}}`);
}

export function TestingInterface({ spec }: Props) {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState(spec.servers?.[0]?.url || "");
  const [pathTemplate, setPathTemplate] = useState("");
  const [pathParams, setPathParams] = useState<Record<string, string>>({});
  const [queryParams, setQueryParams] = useState<Header[]>([]);
  const [headers, setHeaders] = useState<Header[]>([{ key: "Content-Type", value: "application/json" }]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{ status: number; headers: Record<string, string>; body: any; duration: number } | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"request" | "response" | "headers">("request");
  const [copied, setCopied] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState("");

  const endpoints = useMemo(() => {
    const result: { path: string; method: string; operation: any }[] = [];
    if (!spec.paths) return result;
    for (const [path, pathItem] of Object.entries<any>(spec.paths || {})) {
      for (const [m, op] of Object.entries(pathItem || {})) {
        if (["get", "post", "put", "patch", "delete", "options", "head"].includes(m)) {
          result.push({ path, method: m.toUpperCase(), operation: op });
        }
      }
    }
    return result;
  }, [spec.paths]);

  const selectEndpoint = (ep: { path: string; method: string; operation: any }) => {
    setMethod(ep.method);
    setPathTemplate(ep.path);
    setSelectedEndpoint(`${ep.method} ${ep.path}`);

    // Extract path params
    const paramNames = (ep.path.match(/\{(\w+)\}/g) || []).map((p) => p.slice(1, -1));
    const params: Record<string, string> = {};
    paramNames.forEach((n) => { params[n] = ""; });
    setPathParams(params);

    // Extract query params
    const queries = ep.operation.parameters?.filter((p: any) => p.in === "query") || [];
    setQueryParams(queries.map((q: any) => ({ key: q.name, value: "" })));

    // Pre-fill body
    const reqSchema = ep.operation.requestBody?.content?.["application/json"]?.schema;
    if (reqSchema) {
      const example = generateExample(reqSchema);
      setBody(example ? JSON.stringify(example, null, 2) : "");
    } else {
      setBody("");
    }

    buildUrl(ep.path, params, queries.map((q: any) => ({ key: q.name, value: "" })));
  };

  const buildUrl = useCallback((tmpl: string, params: Record<string, string>, qps: Header[]) => {
    const base = spec.servers?.[0]?.url || "";
    let full = base + fillPathParams(tmpl, params);
    const qs = qps.filter((q) => q.key && q.value).map((q) => `${encodeURIComponent(q.key)}=${encodeURIComponent(q.value)}`);
    if (qs.length > 0) full += "?" + qs.join("&");
    setUrl(full);
  }, [spec.servers]);

  const updatePathParam = (name: string, value: string) => {
    const next = { ...pathParams, [name]: value };
    setPathParams(next);
    buildUrl(pathTemplate, next, queryParams);
  };

  const updateQueryParam = (idx: number, field: "key" | "value", val: string) => {
    const next = queryParams.map((q, i) => i === idx ? { ...q, [field]: val } : q);
    setQueryParams(next);
    buildUrl(pathTemplate, pathParams, next);
  };

  const addQueryParam = () => setQueryParams([...queryParams, { key: "", value: "" }]);
  const removeQueryParam = (idx: number) => {
    const next = queryParams.filter((_, i) => i !== idx);
    setQueryParams(next.length === 0 ? [{ key: "", value: "" }] : next);
  };

  const sendRequest = async () => {
    setLoading(true);
    setError("");
    setResponse(null);
    const start = performance.now();
    try {
      const hdrs: Record<string, string> = {};
      headers.forEach((h) => { if (h.key) hdrs[h.key] = h.value; });
      const res = await fetch(url, {
        method,
        headers: hdrs,
        body: ["GET", "HEAD"].includes(method) ? undefined : body || undefined,
      });
      const resHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => { resHeaders[k] = v; });
      let resBody: any;
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("json")) {
        resBody = await res.json();
      } else {
        resBody = await res.text();
      }
      setResponse({
        status: res.status,
        headers: resHeaders,
        body: resBody,
        duration: Math.round(performance.now() - start),
      });
      setActiveTab("response");
    } catch (e: any) {
      setError(e.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (s: number) => {
    if (s >= 200 && s < 300) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (s >= 300 && s < 400) return "text-blue-600 bg-blue-50 border-blue-200";
    if (s >= 400) return "text-red-600 bg-red-50 border-red-200";
    return "text-neutral-600 bg-neutral-50 border-neutral-200";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Terminal className="w-5 h-5 text-neutral-500" />
        <h3 className="text-lg font-semibold text-neutral-900">API Testing Interface</h3>
      </div>

      {/* Endpoint selector */}
      <div>
        <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 block">Select an Endpoint</label>
        <select
          value={selectedEndpoint}
          onChange={(e) => {
            const ep = endpoints.find((ep) => `${ep.method} ${ep.path}` === e.target.value);
            if (ep) selectEndpoint(ep);
          }}
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
        >
          <option value="">— Choose an endpoint —</option>
          {endpoints.map((ep) => (
            <option key={`${ep.method}-${ep.path}`} value={`${ep.method} ${ep.path}`}>
              {ep.method.toUpperCase()} {ep.path}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request panel */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Request</span>
          </div>

          {/* Method + URL */}
          <div className="flex gap-2">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-24 rounded-lg border border-neutral-200 bg-white px-2 py-2 text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            >
              {["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/endpoint"
              className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
          </div>

          {/* Path params */}
          {Object.keys(pathParams).length > 0 && (
            <div>
              <label className="text-xs font-medium text-neutral-500 mb-1 block">Path Parameters</label>
              <div className="space-y-1.5">
                {Object.entries(pathParams).map(([name, val]) => (
                  <div key={name} className="flex items-center gap-2">
                    <span className="text-xs font-mono text-indigo-600 w-24 truncate">{name}</span>
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => updatePathParam(name, e.target.value)}
                      placeholder={`Value for {${name}}`}
                      className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Query params */}
          {queryParams.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-neutral-500">Query Parameters</label>
                <button onClick={addQueryParam} className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5">
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
              <div className="space-y-1.5">
                {queryParams.map((q, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={q.key}
                      onChange={(e) => updateQueryParam(i, "key", e.target.value)}
                      placeholder="key"
                      className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={q.value}
                      onChange={(e) => updateQueryParam(i, "value", e.target.value)}
                      placeholder="value"
                      className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                    />
                    <button onClick={() => removeQueryParam(i)} className="p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-red-500">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Headers */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-neutral-500">Headers</label>
              <button onClick={() => setHeaders([...headers, { key: "", value: "" }])} className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5">
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            <div className="space-y-1.5">
              {headers.map((h, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={h.key}
                    onChange={(e) => {
                      const next = [...headers];
                      next[i] = { ...next[i], key: e.target.value };
                      setHeaders(next);
                    }}
                    placeholder="Header"
                    className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={h.value}
                    onChange={(e) => {
                      const next = [...headers];
                      next[i] = { ...next[i], value: e.target.value };
                      setHeaders(next);
                    }}
                    placeholder="Value"
                    className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  />
                  <button onClick={() => setHeaders(headers.filter((_, idx) => idx !== i))} className="p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-red-500">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Body */}
          {!["GET", "HEAD"].includes(method) && (
            <div>
              <label className="text-xs font-medium text-neutral-500 mb-1 block">Request Body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                placeholder='{ "key": "value" }'
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-mono text-neutral-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-y"
              />
            </div>
          )}

          <Button onClick={sendRequest} disabled={loading || !url} size="lg" className="w-full">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Play className="w-4 h-4" /> Send Request</>}
          </Button>
        </div>

        {/* Response panel */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Response</span>
          </div>

          <div className={cn(
            "border rounded-xl bg-white min-h-[300px]",
            response ? "border-neutral-200" : "border-dashed border-neutral-200"
          )}>
            {error && (
              <div className="p-4 text-red-600 bg-red-50 rounded-xl text-sm">
                {error}
              </div>
            )}

            {!response && !error && (
              <div className="flex flex-col items-center justify-center h-[300px] text-neutral-400">
                <Play className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">Send a request to see the response</p>
              </div>
            )}

            {response && (
              <div>
                {/* Status bar */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200 bg-neutral-50/50 rounded-t-xl">
                  <div className={cn("px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold border", statusColor(response.status))}>
                    {response.status}
                  </div>
                  <span className="text-xs text-neutral-400">
                    {response.duration}ms
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(response.body, null, 2));
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="ml-auto p-1 rounded hover:bg-neutral-100 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-neutral-400" />}
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-neutral-200">
                  {["Response Body", "Headers"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab === "Response Body" ? "response" : "headers")}
                      className={cn(
                        "px-4 py-2 text-xs font-medium border-b-2 transition-colors",
                        activeTab === (tab === "Response Body" ? "response" : "headers")
                          ? "border-indigo-600 text-indigo-600"
                          : "border-transparent text-neutral-500 hover:text-neutral-700"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Content */}
                <div className="p-4 max-h-[400px] overflow-auto">
                  {activeTab === "response" && (
                    <pre className="text-xs font-mono text-neutral-700 leading-relaxed whitespace-pre-wrap">
                      {typeof response.body === "string" ? response.body : JSON.stringify(response.body, null, 2)}
                    </pre>
                  )}
                  {activeTab === "headers" && (
                    <div className="space-y-1">
                      {Object.entries(response.headers).map(([k, v]) => (
                        <div key={k} className="flex gap-2 text-xs font-mono">
                          <span className="text-indigo-600 flex-shrink-0">{k}:</span>
                          <span className="text-neutral-600 break-all">{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
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
      if (schema.format === "email") return "user@example.com";
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
