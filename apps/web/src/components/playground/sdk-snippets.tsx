"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Code2, ChevronDown, ChevronRight } from "lucide-react";
import { MethodBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OpenApiDoc } from "./openapi-input";

interface Props {
  spec: OpenApiDoc;
}

const LANGUAGE_MAP = [
  { id: "curl", label: "cURL", icon: "curl" },
  { id: "javascript", label: "JavaScript (fetch)", icon: "js" },
  { id: "typescript", label: "TypeScript (fetch)", icon: "ts" },
  { id: "axios", label: "JavaScript (Axios)", icon: "ax" },
  { id: "axios-ts", label: "TypeScript (Axios)", icon: "ax" },
  { id: "python", label: "Python", icon: "py" },
  { id: "go", label: "Go", icon: "go" },
  { id: "java", label: "Java (OkHttp)", icon: "java" },
  { id: "swift", label: "Swift", icon: "swift" },
  { id: "kotlin", label: "Kotlin", icon: "kt" },
];

function generateSnippet(lang: string, method: string, url: string, headers: Record<string, string>, body: any): string {
  const h = Object.entries(headers).map(([k, v]) => ({ key: k, value: v }));
  const bodyStr = body ? (typeof body === "string" ? body : JSON.stringify(body, null, 2)) : null;

  switch (lang) {
    case "curl": {
      let c = `curl -X ${method} '${url}'`;
      h.forEach(({ key, value }) => { c += ` \\\n  -H '${key}: ${value}'`; });
      if (bodyStr) c += ` \\\n  -d '${bodyStr.replace(/'/g, "\\'")}'`;
      return c;
    }
    case "javascript": {
      const hasBody = bodyStr && method !== "GET";
      return `const response = await fetch('${url}', {\n  method: '${method}',${h.length > 0 ? `\n  headers: {\n${h.map(({ key, value }) => `    '${key}': '${value}'`).join(",\n")}\n  }` : ""}${hasBody ? `,\n  body: JSON.stringify(${bodyStr})` : ""}\n});\n\nconst data = await response.json();\nconsole.log(data);`;
    }
    case "typescript": {
      const hasBody = bodyStr && method !== "GET";
      return `interface ResponseType {\n  [key: string]: unknown;\n}\n\nconst response = await fetch('${url}', {\n  method: '${method}',${h.length > 0 ? `\n  headers: {\n${h.map(({ key, value }) => `    '${key}': '${value}'`).join(",\n")}\n  }` : ""}${hasBody ? `,\n  body: JSON.stringify(${bodyStr})` : ""}\n});\n\nconst data: ResponseType = await response.json();\nconsole.log(data);`;
    }
    case "axios": {
      const hasBody = bodyStr && method !== "GET";
      return `import axios from 'axios';\n\nconst response = await axios({\n  method: '${method.toLowerCase()}',\n  url: '${url}',${h.length > 0 ? `\n  headers: {\n${h.map(({ key, value }) => `    '${key}': '${value}'`).join(",\n")}\n  }` : ""}${hasBody ? `,\n  data: ${bodyStr}` : ""}\n});\n\nconsole.log(response.data);`;
    }
    case "axios-ts": {
      const hasBody = bodyStr && method !== "GET";
      return `import axios, { AxiosResponse } from 'axios';\n\ninterface ResponseType {\n  [key: string]: unknown;\n}\n\nconst response: AxiosResponse<ResponseType> = await axios({\n  method: '${method.toLowerCase()}',\n  url: '${url}',${h.length > 0 ? `\n  headers: {\n${h.map(({ key, value }) => `    '${key}': '${value}'`).join(",\n")}\n  }` : ""}${hasBody ? `,\n  data: ${bodyStr}` : ""}\n});\n\nconsole.log(response.data);`;
    }
    case "python": {
      const lines = ["import requests", "", `url = '${url}'`];
      if (h.length > 0) {
        lines.push(`headers = {\n${h.map(({ key, value }) => `    '${key}': '${value}'`).join(",\n")}\n}`);
      }
      if (bodyStr && method !== "GET") {
        lines.push(`data = ${bodyStr}`);
        lines.push(`\nresponse = requests.${method.toLowerCase()}('${url}', headers=headers, json=data)`);
      } else if (h.length > 0) {
        lines.push(`\nresponse = requests.${method.toLowerCase()}('${url}', headers=headers)`);
      } else {
        lines.push(`\nresponse = requests.${method.toLowerCase()}('${url}')`);
      }
      lines.push("print(response.status_code)");
      lines.push("print(response.json())");
      return lines.join("\n");
    }
    case "go": {
      const hasBody = bodyStr && method !== "GET";
      const client = h.length > 0 ? `\n\treq.Header.Set("${h[0].key}", "${h[0].value}")` : "";
      const additionalHeaders = h.slice(1).map(({ key, value }) => `\treq.Header.Set("${key}", "${value}")`).join("\n");
      return `package main\n\nimport (\n\t"fmt"\n\t"io"\n\t"net/http"\n\t"strings"\n)\n\nfunc main() {\n\turl := "${url}"${hasBody ? `\n\tpayload := strings.NewReader(\`${bodyStr}\`)` : "\n\tpayload := strings.NewReader(\"\")"}\n\n\treq, _ := http.NewRequest("${method}", url, payload)${client}${additionalHeaders ? "\n" + additionalHeaders : ""}\n\n\tresp, err := http.DefaultClient.Do(req)\n\tif err != nil {\n\t\tpanic(err)\n\t}\n\tdefer resp.Body.Close()\n\n\tbody, _ := io.ReadAll(resp.Body)\n\tfmt.Println(string(body))\n}`;
    }
    case "java": {
      return `OkHttpClient client = new OkHttpClient();\n\n${bodyStr && method !== "GET" ? `MediaType mediaType = MediaType.parse("application/json");\nRequestBody body = RequestBody.create(mediaType, ${bodyStr.includes("\n") ? "\"" + bodyStr.replace(/\n/g, "\\n") + "\"" : "\"" + bodyStr + "\""});\n` : "RequestBody body = RequestBody.create(null, new byte[0]);\n"}\nRequest request = new Request.Builder()\n  .url("${url}")${h.map(({ key, value }) => `\n  .addHeader("${key}", "${value}")`).join("")}\n  .${method.toLowerCase()}(${bodyStr && method !== "GET" ? "body" : ""})\n  .build();\n\nResponse response = client.newCall(request).execute();\nSystem.out.println(response.body().string());`;
    }
    case "swift": {
      const hasBody = bodyStr && method !== "GET";
      let swift = `import Foundation\n\nlet url = URL(string: "${url}")!\nvar request = URLRequest(url: url)\nrequest.httpMethod = "${method}"\n`;
      h.forEach(({ key, value }) => { swift += `request.setValue("${value}", forHTTPHeaderField: "${key}")\n`; });
      if (hasBody) {
        swift += `let body: [String: Any] = ${bodyStr}\nrequest.httpBody = try? JSONSerialization.data(withJSONObject: body)\n`;
      }
      swift += `\nlet task = URLSession.shared.dataTask(with: request) { data, response, error in\n    if let data = data {\n        print(String(data: data, encoding: .utf8) ?? "")\n    }\n}\ntask.resume()`;
      return swift;
    }
    case "kotlin": {
      return `val client = OkHttpClient()\n\n${bodyStr && method !== "GET" ? `val mediaType = MediaType.parse("application/json")\nval body = RequestBody.create(mediaType, """${bodyStr}""")\n` : "val body = RequestBody.create(null, ByteArray(0))\n"}\nval request = Request.Builder()\n  .url("${url}")${h.map(({ key, value }) => `\n  .addHeader("${key}", "${value}")`).join("")}\n  .${method.toLowerCase()}(${bodyStr && method !== "GET" ? "body" : ""})\n  .build()\n\nval response = client.newCall(request).execute()\nprintln(response.body()?.string())`;
    }
    default:
      return `// ${lang} snippet not available`;
  }
}

export function SdkSnippets({ spec }: Props) {
  const [lang, setLang] = useState("curl");
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const endpoints = useMemo(() => {
    const result: { path: string; method: string; operation: any }[] = [];
    if (!spec.paths) return result;
    for (const [path, pathItem] of Object.entries<any>(spec.paths || {})) {
      for (const [m, op] of Object.entries(pathItem || {})) {
        if (["get", "post", "put", "patch", "delete"].includes(m)) {
          result.push({ path, method: m.toUpperCase(), operation: op });
        }
      }
    }
    return result;
  }, [spec.paths]);

  const selectedEp = endpoints.find((ep) => `${ep.method} ${ep.path}` === selectedEndpoint);

  const snippet = useMemo(() => {
    if (!selectedEp) return "// Select an endpoint above";
    const baseUrl = spec.servers?.[0]?.url || "https://api.example.com";
    const url = baseUrl + selectedEp.path;
    const headers: Record<string, string> = {};
    const params = selectedEp.operation.parameters || [];
    params.forEach((p: any) => {
      if (p.in === "header") headers[p.name] = `{{${p.name}}}`;
    });
    if (!headers["Content-Type"] && selectedEp.method !== "GET") {
      headers["Content-Type"] = "application/json";
    }
    const reqSchema = selectedEp.operation.requestBody?.content?.["application/json"]?.schema;
    let body = null;
    if (reqSchema) {
      body = generateExample2(reqSchema);
    }
    return generateSnippet(lang, selectedEp.method, url, headers, body);
  }, [selectedEp, lang, spec.servers]);

  const copy = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Code2 className="w-5 h-5 text-neutral-500" />
        <h3 className="text-lg font-semibold text-neutral-900">SDK Snippet Generator</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-4">
          <div>
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 block">Endpoint</label>
            <select
              value={selectedEndpoint}
              onChange={(e) => setSelectedEndpoint(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            >
              <option value="">— Select —</option>
              {endpoints.map((ep) => (
                <option key={`${ep.method}-${ep.path}`} value={`${ep.method} ${ep.path}`}>
                  {ep.method} {ep.path}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 block">Language</label>
            <div className="space-y-1">
              {LANGUAGE_MAP.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLang(l.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    lang === l.id
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                      : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50"
                  )}
                >
                  <span className="font-mono text-xs mr-2 opacity-50">{l.icon}</span>
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Code output */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-50 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-neutral-500 font-mono">{lang}</span>
                {selectedEp && (
                  <div className="flex items-center gap-1.5">
                    <MethodBadge method={selectedEp.method} />
                    <span className="text-xs font-mono text-neutral-400">{selectedEp.path}</span>
                  </div>
                )}
              </div>
              <button
                onClick={copy}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-neutral-500 hover:text-neutral-700 rounded-md hover:bg-neutral-200/50 transition-colors"
              >
                {copied ? <><Check className="w-3 h-3 text-emerald-500" /><span className="text-emerald-600">Copied</span></> : <><Copy className="w-3 h-3" /> Copy</>}
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-neutral-700 leading-relaxed overflow-x-auto max-h-[500px] overflow-y-auto whitespace-pre">
              {snippet}
            </pre>
          </div>

          {/* Endpoint summary */}
          {selectedEp && (
            <div className="mt-4 border border-neutral-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-neutral-50 hover:bg-neutral-100 transition-colors"
              >
                <span className="text-xs font-medium text-neutral-500">Request Details</span>
                {expanded ? <ChevronDown className="w-3.5 h-3.5 text-neutral-400" /> : <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />}
              </button>
              {expanded && (
                <div className="p-4 space-y-3 text-sm border-t border-neutral-200">
                  {selectedEp.operation.summary && (
                    <p className="text-neutral-600">{selectedEp.operation.summary}</p>
                  )}
                  {selectedEp.operation.description && (
                    <p className="text-xs text-neutral-400">{selectedEp.operation.description}</p>
                  )}
                  {selectedEp.operation.parameters?.length > 0 && (
                    <div>
                      <span className="text-xs font-semibold text-neutral-500 uppercase">Parameters</span>
                      <div className="mt-1 space-y-1">
                        {selectedEp.operation.parameters.map((p: any) => (
                          <div key={p.name} className="flex items-center gap-2 text-xs font-mono">
                            <span className="text-indigo-600">{p.name}</span>
                            <span className="text-neutral-400">{p.in}</span>
                            <span className="text-neutral-400">{p.schema?.type || "string"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function generateExample2(schema: any, depth = 0): any {
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
      if (schema.items) return [generateExample2(schema.items, depth + 1)];
      return [];
    case "object":
      if (!schema.properties) return {};
      const obj: Record<string, any> = {};
      for (const [key, prop] of Object.entries<any>(schema.properties)) {
        obj[key] = generateExample2(prop, depth + 1);
      }
      return obj;
    default:
      if (schema.properties) {
        const obj2: Record<string, any> = {};
        for (const [key, prop] of Object.entries<any>(schema.properties)) {
          obj2[key] = generateExample2(prop, depth + 1);
        }
        return obj2;
      }
      return null;
  }
}
