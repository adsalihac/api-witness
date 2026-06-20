"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronRight, BookOpen, Server, Info } from "lucide-react";
import { MethodBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OpenApiDoc } from "./openapi-input";

interface Props {
  spec: OpenApiDoc;
}

function SchemaViewer({ schema }: { schema: any }) {
  if (!schema) return <span className="text-neutral-400 italic">any</span>;
  if (schema.$ref) {
    const refName = schema.$ref.split("/").pop();
    return <span className="text-indigo-600 font-mono text-xs">{refName}</span>;
  }
  const props = schema.properties || schema.items?.properties;
  if (props) {
    return (
      <div className="space-y-1.5 mt-1">
        {Object.entries(props).map(([name, prop]: [string, any]) => (
          <div key={name} className="flex items-start gap-2 pl-3 border-l-2 border-neutral-200">
            <span className="font-mono text-xs font-medium text-neutral-700">{name}</span>
            <span className="text-xs text-neutral-400">{prop.type || "any"}</span>
            {schema.required?.includes(name) && (
              <span className="text-[0.6rem] text-red-500 font-medium">required</span>
            )}
            {prop.description && (
              <span className="text-xs text-neutral-400">— {prop.description}</span>
            )}
            {prop.enum && (
              <span className="text-[0.6rem] text-amber-600 font-mono">
                enum: {prop.enum.join(", ")}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }
  if (schema.items && !schema.items.properties) {
    return (
      <div className="text-xs text-neutral-500 font-mono">
        Array&lt;{schema.items.type || schema.items.$ref?.split("/").pop() || "any"}&gt;
      </div>
    );
  }
  return (
    <span className="text-xs text-neutral-500 font-mono">
      {schema.type || "any"}
      {schema.format && <span className="text-neutral-400"> &lt;{schema.format}&gt;</span>}
    </span>
  );
}

function EndpointDoc({ path, methods, pathParams }: { path: string; methods: [string, any][]; pathParams: any[] }) {
  const [open, setOpen] = useState(false);
  const [responseTab, setResponseTab] = useState<string>("200");

  const method = methods[0][0].toUpperCase();
  const operation = methods[0][1];
  const allResponses = operation.responses ? Object.keys(operation.responses) : [];

  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors text-left"
      >
        <MethodBadge method={method} />
        <span className="font-mono text-sm font-medium text-neutral-800 flex-1 truncate">{path}</span>
        <span className="text-xs text-neutral-400 truncate hidden sm:block max-w-[200px]">
          {operation.summary || operation.operationId || ""}
        </span>
        {open ? <ChevronDown className="w-4 h-4 text-neutral-400 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-neutral-400 flex-shrink-0" />}
      </button>

      {open && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="border-t border-neutral-200">
          <div className="p-4 space-y-4 text-sm">
            {operation.summary && <p className="text-neutral-600">{operation.summary}</p>}
            {operation.description && <p className="text-neutral-500 text-xs">{operation.description}</p>}

            {operation.operationId && (
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <Info className="w-3 h-3" />
                <span className="font-mono">{operation.operationId}</span>
              </div>
            )}

            {/* Path params */}
            {pathParams.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Path Parameters</h4>
                <div className="space-y-1">
                  {pathParams.map((p: any) => (
                    <div key={p.name} className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-indigo-600">{p.name}</span>
                      <span className="text-neutral-400">{p.schema?.type || "string"}</span>
                      {p.required && <span className="text-red-500 text-[0.6rem] font-medium">required</span>}
                      {p.description && <span className="text-neutral-400">— {p.description}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Query params */}
            {operation.parameters?.filter((p: any) => p.in === "query").length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Query Parameters</h4>
                <div className="space-y-1">
                  {operation.parameters.filter((p: any) => p.in === "query").map((p: any) => (
                    <div key={p.name} className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-amber-600">{p.name}</span>
                      <span className="text-neutral-400">{p.schema?.type || "string"}</span>
                      {p.required && <span className="text-red-500 text-[0.6rem] font-medium">required</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Request body */}
            {operation.requestBody && (
              <div>
                <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Request Body</h4>
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
                  {Object.entries(operation.requestBody.content || {}).map(([mime, content]: [string, any]) => (
                    <div key={mime}>
                      <span className="text-[0.6rem] font-mono text-neutral-400">{mime}</span>
                      <SchemaViewer schema={content.schema} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Responses */}
            {allResponses.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Responses</h4>
                <div className="flex flex-wrap gap-1 mb-2">
                  {allResponses.map((code) => (
                    <button
                      key={code}
                      onClick={() => setResponseTab(code)}
                      className={cn(
                        "px-2 py-0.5 text-xs font-mono rounded-md transition-colors",
                        responseTab === code
                          ? "bg-neutral-900 text-white"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                      )}
                    >
                      {code}
                    </button>
                  ))}
                </div>
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
                  <p className="text-xs text-neutral-500 mb-1">
                    {operation.responses[responseTab]?.description || ""}
                  </p>
                  <SchemaViewer schema={operation.responses[responseTab]?.content?.["application/json"]?.schema} />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export function InteractiveDocs({ spec }: Props) {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const endpoints = useMemo(() => {
    const result: { path: string; methods: [string, any][]; tag: string }[] = [];
    if (!spec.paths) return result;

    for (const [path, pathItem] of Object.entries(spec.paths)) {
      const methods = Object.entries(pathItem || {}).filter(([key]) =>
        ["get", "post", "put", "patch", "delete", "options", "head"].includes(key)
      ) as [string, any][];
      if (methods.length === 0) continue;
      const tag = methods[0][1]?.tags?.[0] || "default";
      result.push({ path, methods, tag });
    }
    return result;
  }, [spec.paths]);

  const tags = useMemo(() => {
    const set = new Set(endpoints.map((e) => e.tag));
    return Array.from(set).sort();
  }, [endpoints]);

  const filtered = useMemo(() => {
    return endpoints.filter((e) => {
      if (activeTag && e.tag !== activeTag) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          e.path.toLowerCase().includes(q) ||
          e.methods.some(([, op]) =>
            (op.summary || "").toLowerCase().includes(q) ||
            (op.operationId || "").toLowerCase().includes(q)
          )
        );
      }
      return true;
    });
  }, [endpoints, activeTag, search]);

  const extractPathParams = (path: string) => {
    const matches = path.match(/\{(\w+)\}/g) || [];
    return matches.map((m) => m.slice(1, -1));
  };

  const grouped = useMemo(() => {
    const map: Record<string, typeof filtered> = {};
    for (const ep of filtered) {
      const key = ep.tag;
      if (!map[key]) map[key] = [];
      map[key].push(ep);
    }
    return map;
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-neutral-500" />
          <h3 className="text-lg font-semibold text-neutral-900">Interactive Documentation</h3>
        </div>
        {spec.servers?.[0] && (
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <Server className="w-3 h-3" />
            <span className="font-mono">{spec.servers[0].url}</span>
          </div>
        )}
      </div>

      {/* Search + Tag filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search endpoints..."
          className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
        />
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveTag(null)}
            className={cn(
              "px-2.5 py-1 text-xs font-medium rounded-lg transition-colors",
              !activeTag ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            )}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-lg transition-colors capitalize",
                activeTag === tag ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Endpoints by tag */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([tag, eps]) => (
          <div key={tag}>
            <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 px-1">{tag} ({eps.length})</h4>
            <div className="space-y-2">
              {eps.map((ep) => {
                const pathParamNames = extractPathParams(ep.path);
                const pathParams = ep.methods[0][1]?.parameters?.filter((p: any) => p.in === "path") || [];
                return (
                  <EndpointDoc
                    key={`${ep.methods[0][0]}-${ep.path}`}
                    path={ep.path}
                    methods={ep.methods}
                    pathParams={pathParams}
                  />
                );
              })}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-neutral-400">
            <p>No endpoints match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
