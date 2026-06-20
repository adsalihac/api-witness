"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as yaml from "js-yaml";

export interface OpenApiDoc {
  openapi?: string;
  info?: { title?: string; version?: string; description?: string };
  servers?: { url: string; description?: string }[];
  paths?: Record<string, Record<string, any>>;
  components?: Record<string, any>;
  tags?: { name: string; description?: string }[];
  [key: string]: any;
}

interface Props {
  onSpecParsed: (spec: OpenApiDoc) => void;
  parsed: OpenApiDoc | null;
}

function postmanToOpenApi(collection: any): OpenApiDoc {
  const info = collection.info || {};
  const paths: Record<string, Record<string, any>> = {};
  let baseUrl = "https://api.example.com";

  // Build variable map from collection.variable array
  const envVars: Record<string, string> = {};
  if (collection.variable && Array.isArray(collection.variable)) {
    for (const v of collection.variable) {
      if (v.key) envVars[v.key] = v.value ?? "";
    }
  }

  // Resolve {{var}} patterns using known env vars; leave unknown vars as placeholders
  function resolveVars(input: string): string {
    return input.replace(/\{\{(\w+)\}\}/g, (_, name) => {
      if (name in envVars) return envVars[name];
      if (name.toLowerCase() === "url" || name.toLowerCase() === "baseurl") {
        // Will be handled as base URL placeholder
        return "{{BASE}}";
      }
      return `{${name}}`; // convert unknown vars to OpenAPI path params
    });
  }

  function walkItems(items: any[], folderTags: string[]) {
    for (const item of items) {
      if (item.item) {
        const tags = [...folderTags, item.name || "Default"];
        walkItems(item.item, tags);
        continue;
      }
      if (!item.request) continue;
      const req = item.request;
      const method = (req.method || "GET").toLowerCase();

      // ── Resolve the full raw URL ──
      let rawUrl = "";
      if (typeof req.url === "string") {
        rawUrl = req.url;
      } else if (req.url?.raw) {
        rawUrl = req.url.raw;
      } else if (req.url?.path) {
        const host = Array.isArray(req.url.host) ? req.url.host.map((s: string) => resolveVars(s)).join(".") : "";
        const port = req.url.port ? `:${req.url.port}` : "";
        const protocol = req.url.protocol || "https";
        const path = Array.isArray(req.url.path)
          ? "/" + req.url.path.map((s: string) => {
              const resolved = resolveVars(s);
              if (resolved !== s) return resolved;
              return s.startsWith(":") ? `{${s.slice(1)}}` : s;
            }).join("/")
          : "";
        rawUrl = `${protocol}://${host}${port}${path}`;
      }
      if (!rawUrl) continue;

      // ── Attempt to extract base URL by resolving vars ──
      const resolvedRaw = resolveVars(rawUrl);
      // Replace {{BASE}} placeholder temporarily to get a parseable URL for origin extraction
      const urlForParse = resolvedRaw.includes("{{BASE}}")
        ? resolvedRaw.replace("{{BASE}}", "")
        : resolvedRaw;

      try {
        const u = new URL(urlForParse.startsWith("//") ? "https:" + urlForParse : urlForParse);
        if (baseUrl === "https://api.example.com") {
          baseUrl = u.origin + (u.pathname !== "/" ? u.pathname.replace(/\/[^/]+$/, "") : "");
        }
      } catch {}

      // ── Extract path from raw URL ──
      let path = "";
      // For {{baseUrl}}/path style, strip the base variable portion
      const baseVarPattern = /^\{\{(\w+)\}\}/;
      const baseMatch = rawUrl.match(baseVarPattern);
      if (baseMatch) {
        const rest = rawUrl.slice(baseMatch[0].length);
        path = rest.split("?")[0].split("#")[0];
      } else {
        try {
          const u = new URL(urlForParse);
          path = u.pathname;
        } catch {
          // Fallback: just strip protocol+host from raw if possible
          const stripped = rawUrl.replace(/^https?:\/\/[^/]+/, "");
          path = stripped.split("?")[0].split("#")[0];
        }
      }
      if (!path.startsWith("/")) path = "/" + path;

      // Convert {{var}} and :var in path to {var} OpenAPI format
      path = path.replace(/\{\{(\w+)\}\}/g, "{$1}").replace(/:(\w+)/g, "{$1}");

      // ── Query params from URL object ──
      const queryParams: any[] = [];
      if (req.url?.query && Array.isArray(req.url.query)) {
        for (const q of req.url.query) {
          if (q.key) {
            queryParams.push({
              name: q.key,
              in: "query",
              schema: { type: "string" },
              ...(q.description ? { description: q.description } : {}),
            });
          }
        }
      }
      // Also extract from raw query string
      const qsIndex = rawUrl.indexOf("?");
      if (qsIndex !== -1 && queryParams.length === 0) {
        const qs = rawUrl.slice(qsIndex + 1).split("#")[0];
        for (const pair of qs.split("&")) {
          const [k] = pair.split("=");
          if (k && !queryParams.some((p) => p.name === k)) {
            queryParams.push({ name: k, in: "query", schema: { type: "string" } });
          }
        }
      }

      // ── Path params from url.variable and from {{var}} / :var in path ──
      const pathParamNames = new Set<string>();
      const pathParams: any[] = [];
      // From explicit Postman variable array
      if (req.url?.variable && Array.isArray(req.url.variable)) {
        for (const v of req.url.variable) {
          if (v.key && !pathParamNames.has(v.key)) {
            pathParamNames.add(v.key);
            pathParams.push({
              name: v.key,
              in: "path",
              required: true,
              schema: { type: "string" },
            });
          }
        }
      }
      // From {{var}} in raw URL (not matching known env vars)
      const rawVarRe = /\{\{(\w+)\}\}/g;
      let rm;
      while ((rm = rawVarRe.exec(rawUrl)) !== null) {
        const name = rm[1];
        if (!pathParamNames.has(name) && !(name in envVars)) {
          pathParamNames.add(name);
          pathParams.push({
            name,
            in: "path",
            required: true,
            schema: { type: "string" },
          });
        }
      }
      // From :var in path
      const colonRe = /:(\w+)/g;
      let cm;
      while ((cm = colonRe.exec(rawUrl)) !== null) {
        if (!pathParamNames.has(cm[1])) {
          pathParamNames.add(cm[1]);
          pathParams.push({
            name: cm[1],
            in: "path",
            required: true,
            schema: { type: "string" },
          });
        }
      }

      // ── Collect headers ──
      const headerParams: any[] = [];
      if (req.header && Array.isArray(req.header)) {
        for (const h of req.header) {
          if (h.key && !h.disabled) {
            headerParams.push({
              name: h.key,
              in: "header",
              schema: { type: "string" },
            });
          }
        }
      }

      // ── Request body ──
      let requestBody: any = undefined;
      if (req.body?.raw) {
        try {
          const parsed = JSON.parse(req.body.raw);
          requestBody = {
            content: {
              "application/json": {
                schema: inferSchema(parsed),
              },
            },
          };
        } catch {
          requestBody = {
            content: {
              "text/plain": {
                schema: { type: "string" },
              },
            },
          };
        }
      }

      // ── Build operation ──
      const operation: any = {
        summary: item.name || `${method.toUpperCase()} ${path}`,
        tags: folderTags.length > 0 ? [folderTags.join(" / ")] : ["default"],
      };

      const allParams = [...queryParams, ...pathParams];
      const nonCtHeaders = headerParams.filter(
        (h) => h.name.toLowerCase() !== "content-type"
      );
      if (allParams.length > 0 || nonCtHeaders.length > 0) {
        operation.parameters = [...allParams, ...nonCtHeaders];
      }

      if (requestBody) operation.requestBody = requestBody;
      operation.responses = { "200": { description: "Success" } };

      if (!paths[path]) paths[path] = {};
      paths[path][method] = operation;
    }
  }

  const rootItems = collection.item || [];
  walkItems(rootItems, []);

  return {
    openapi: "3.0.3",
    info: {
      title: info.name || "Postman Collection",
      version: "1.0.0",
      description: info.description || "",
    },
    servers: [{ url: baseUrl, description: "Inferred from Postman collection" }],
    paths,
  };
}

function inferSchema(value: any, depth = 0): any {
  if (depth > 4) return {};
  if (value === null) return { type: "null" };
  if (Array.isArray(value)) {
    return {
      type: "array",
      items: value.length > 0 ? inferSchema(value[0], depth + 1) : { type: "any" },
    };
  }
  if (typeof value === "object") {
    const properties: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      properties[key] = inferSchema(val, depth + 1);
    }
    return { type: "object", properties };
  }
  if (typeof value === "string") return { type: "string" };
  if (typeof value === "number") return { type: "number" };
  if (typeof value === "boolean") return { type: "boolean" };
  return { type: "string" };
}

const PETSTORE_SPEC = `{
  "openapi": "3.0.3",
  "info": {
    "title": "Petstore",
    "version": "1.0.0",
    "description": "A sample pet store API"
  },
  "servers": [
    { "url": "https://petstore.swagger.io/v2", "description": "Production" }
  ],
  "paths": {
    "/pet": {
      "post": {
        "tags": ["pet"],
        "summary": "Add a new pet",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "id": { "type": "integer" },
                  "name": { "type": "string" },
                  "status": { "type": "string", "enum": ["available", "pending", "sold"] }
                },
                "required": ["name"]
              }
            }
          }
        },
        "responses": {
          "200": { "description": "successful operation" },
          "405": { "description": "Invalid input" }
        }
      },
      "put": {
        "tags": ["pet"],
        "summary": "Update an existing pet",
        "responses": {
          "200": { "description": "successful operation" },
          "400": { "description": "Invalid ID supplied" }
        }
      }
    },
    "/pet/findByStatus": {
      "get": {
        "tags": ["pet"],
        "summary": "Finds pets by status",
        "parameters": [
          { "name": "status", "in": "query", "schema": { "type": "string" } }
        ],
        "responses": {
          "200": { "description": "successful operation" }
        }
      }
    },
    "/pet/{petId}": {
      "get": {
        "tags": ["pet"],
        "summary": "Find pet by ID",
        "parameters": [
          { "name": "petId", "in": "path", "required": true, "schema": { "type": "integer" } }
        ],
        "responses": {
          "200": { "description": "successful operation" },
          "404": { "description": "Pet not found" }
        }
      },
      "delete": {
        "tags": ["pet"],
        "summary": "Deletes a pet",
        "parameters": [
          { "name": "petId", "in": "path", "required": true, "schema": { "type": "integer" } },
          { "name": "api_key", "in": "header", "schema": { "type": "string" } }
        ],
        "responses": {
          "200": { "description": "successful operation" },
          "404": { "description": "Pet not found" }
        }
      }
    },
    "/store/inventory": {
      "get": {
        "tags": ["store"],
        "summary": "Returns pet inventories by status",
        "responses": {
          "200": { "description": "successful operation" }
        }
      }
    },
    "/store/order": {
      "post": {
        "tags": ["store"],
        "summary": "Place an order for a pet",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "petId": { "type": "integer" },
                  "quantity": { "type": "integer" },
                  "shipDate": { "type": "string", "format": "date-time" },
                  "status": { "type": "string", "enum": ["placed", "approved", "delivered"] },
                  "complete": { "type": "boolean" }
                }
              }
            }
          }
        },
        "responses": {
          "200": { "description": "successful operation" },
          "400": { "description": "Invalid Order" }
        }
      }
    },
    "/user": {
      "post": {
        "tags": ["user"],
        "summary": "Create user",
        "responses": {
          "default": { "description": "successful operation" }
        }
      }
    }
  }
}`;

const POSTMAN_SAMPLE = {
  info: {
    name: "Petstore API",
    description: "A sample Postman collection using environment variables ({{url}}, {{petId}})",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  variable: [
    { key: "url", value: "https://petstore.swagger.io/v2" },
    { key: "petId", value: "1" },
  ],
  item: [
    {
      name: "Pet",
      item: [
        {
          name: "Add a new pet",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            url: { raw: "{{url}}/pet" },
            body: { mode: "raw", raw: JSON.stringify({ id: 0, name: "doggie", status: "available" }, null, 2) },
          },
        },
        {
          name: "Update a pet",
          request: {
            method: "PUT",
            header: [{ key: "Content-Type", value: "application/json" }],
            url: { raw: "{{url}}/pet" },
            body: { mode: "raw", raw: JSON.stringify({ id: 0, name: "doggie", status: "sold" }, null, 2) },
          },
        },
        {
          name: "Find pet by ID",
          request: {
            method: "GET",
            url: { raw: "{{url}}/pet/{{petId}}" },
          },
        },
        {
          name: "Find pets by status",
          request: {
            method: "GET",
            url: { raw: "{{url}}/pet/findByStatus?status=available" },
          },
        },
        {
          name: "Delete a pet",
          request: {
            method: "DELETE",
            url: { raw: "{{url}}/pet/{{petId}}" },
            header: [{ key: "api_key", value: "your-api-key" }],
          },
        },
      ],
    },
    {
      name: "Store",
      item: [
        {
          name: "Get inventory",
          request: {
            method: "GET",
            url: { raw: "{{url}}/store/inventory" },
          },
        },
        {
          name: "Place an order",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            url: { raw: "{{url}}/store/order" },
            body: { mode: "raw", raw: JSON.stringify({ petId: 1, quantity: 1, status: "placed" }, null, 2) },
          },
        },
      ],
    },
    {
      name: "User",
      item: [
        {
          name: "Create user",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            url: { raw: "{{url}}/user" },
            body: { mode: "raw", raw: JSON.stringify({ id: 1, username: "john", firstName: "John", lastName: "Doe", email: "john@example.com" }, null, 2) },
          },
        },
      ],
    },
  ],
};

export function OpenApiInput({ onSpecParsed, parsed }: Props) {
  const [raw, setRaw] = useState("");
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const parseSpec = useCallback((text: string) => {
    setError("");
    setParsing(true);
    try {
      const trimmed = text.trim();
      const data = trimmed.startsWith("{")
        ? JSON.parse(trimmed)
        : (yaml.load(trimmed) as any);

      if (!data) throw new Error("Failed to parse input");

      // Detect Postman collection
      const schema = data.info?.schema || "";
      if (schema.includes("postman")) {
        const converted = postmanToOpenApi(data);
        onSpecParsed(converted);
        return;
      }
      // Detect OpenAPI by swagger/openapi field or paths
      if (data.openapi || data.swagger || (data.paths && typeof data.paths === "object")) {
        onSpecParsed(data as OpenApiDoc);
        return;
      }

      throw new Error(
        "Unrecognized format. Paste an OpenAPI spec (JSON/YAML) or a Postman collection (JSON)."
      );
    } catch (e: any) {
      setError(e.message || "Failed to parse input");
    } finally {
      setParsing(false);
    }
  }, [onSpecParsed]);

  const loadSample = () => {
    setRaw(PETSTORE_SPEC);
    parseSpec(PETSTORE_SPEC);
  };

  const loadPostmanSample = () => {
    const collection = JSON.stringify(POSTMAN_SAMPLE, null, 2);
    setRaw(collection);
    parseSpec(collection);
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setRaw(text);
      parseSpec(text);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-6">
      {!parsed && (
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">API Playground</h2>
          <p className="text-neutral-500 max-w-xl mx-auto">
            Paste an OpenAPI spec or Postman collection to generate interactive docs, mock APIs, a testing interface, and SDK snippets.
          </p>
        </div>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-6 transition-all",
          dragOver
            ? "border-indigo-400 bg-indigo-50/50"
            : parsed
              ? "border-emerald-200 bg-emerald-50/30"
              : "border-neutral-200 bg-neutral-50/50 hover:border-neutral-300"
        )}
      >
        <div className="flex flex-col items-center gap-3">
          {parsed ? (
            <div className="flex items-center gap-3 w-full">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-emerald-800">{parsed.info?.title || "Untitled Spec"}</p>
                <p className="text-xs text-emerald-600 truncate">v{parsed.info?.version || "?"} &middot; {Object.keys(parsed.paths || {}).length} endpoints</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => { setRaw(""); onSpecParsed(null as any); }}>
                Change
              </Button>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-neutral-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-neutral-700">
                  Drop your OpenAPI file here, or{" "}
                  <button onClick={() => fileRef.current?.click()} className="text-indigo-600 hover:text-indigo-700 underline underline-offset-2">
                    browse
                  </button>
                </p>
                <p className="text-xs text-neutral-400 mt-1">Supports OpenAPI (JSON/YAML) and Postman collections (JSON)</p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".json,.yaml,.yml,.postman_collection.json"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={loadSample}>
                    Load Petstore Spec
                  </Button>
                  <Button variant="secondary" size="sm" onClick={loadPostmanSample}>
                    Load Postman Sample
                  </Button>
                </div>
            </>
          )}
        </div>
      </div>

      {!parsed && (
        <>
          <div className="relative">
            <textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
                placeholder="Paste OpenAPI 3.x JSON/YAML or Postman collection JSON..."
              rows={10}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-mono text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-y"
            />
          </div>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg p-3 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}
          <div className="flex justify-center">
            <Button
              onClick={() => parseSpec(raw)}
              disabled={!raw.trim() || parsing}
              size="lg"
            >
              {parsing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Parsing...</>
              ) : (
                <><Upload className="w-4 h-4" /> Parse Spec</>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
