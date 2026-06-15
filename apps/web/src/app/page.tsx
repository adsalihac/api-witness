"use client";

import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, MethodBadge, StatusBadge } from "@/components/ui/badge";
import { Nav, Hero, Problem, HowItWorks, InstallSection, FeaturesSection, ChangeDetection, DocsGeneration, PricingSection, Footer, ConfigSection } from "@/components/sections";

// ─── Types ────────────────────────────────────────────────────────────────

type Breadcrumb = {
  type: "tap" | "navigation" | "gesture";
  action?: string;
  timestamp?: string;
};

type ApiLog = {
  id: string;
  method: string;
  url: string;
  status: number;
  success: boolean;
  requestHeaders?: Record<string, unknown>;
  responseHeaders?: Record<string, unknown>;
  requestBody?: unknown;
  responseBody?: unknown;
  errorMessage?: string;
  duration: number;
  timestamp: string;
  breadcrumbs?: Breadcrumb[];
};

type FailureReport = {
  reportId: string;
  appName: string;
  appVersion: string;
  environment: string;
  generatedAt: string;
  totalRequests: number;
  failedRequests: number;
  failures: ApiLog[];
  logs?: ApiLog[];
};

// ─── JSON Block Component ─────────────────────────────────────────────────

function JsonBlock({ data, label }: { data: unknown; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div>
      {label && (
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">{label}</p>
      )}
      <div className="relative">
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 z-10 px-2 py-1 text-xs font-medium bg-white border border-neutral-200 rounded-md hover:bg-neutral-50 transition-colors shadow-xs"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
        <pre className="bg-neutral-50 border border-neutral-200 rounded-lg p-3.5 pr-14 overflow-x-auto text-xs font-mono text-neutral-700 leading-relaxed max-h-64 overflow-y-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}

// ─── Failure Card ─────────────────────────────────────────────────────────

function FailureCard({ failure }: { failure: ApiLog }) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"request" | "response" | "headers">("request");
  const hasHeaders = failure.requestHeaders || failure.responseHeaders;
  const hasBody = failure.requestBody || failure.responseBody;

  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3.5 hover:bg-neutral-50 transition-colors text-left"
      >
        <MethodBadge method={failure.method} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-mono text-neutral-900 truncate">{failure.url}</p>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={failure.status} />
            {failure.errorMessage && (
              <span className="text-xs text-red-600 truncate">{failure.errorMessage}</span>
            )}
            <span className="text-xs text-neutral-400">{failure.duration}ms</span>
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-neutral-400 transition-transform flex-shrink-0 ${expanded ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="border-t border-neutral-100 p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-neutral-400">Duration:</span>{" "}
              <span className="font-medium text-neutral-700">{failure.duration}ms</span>
            </div>
            <div>
              <span className="text-neutral-400">Timestamp:</span>{" "}
              <span className="font-medium text-neutral-700">
                {new Date(failure.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
          {hasHeaders && hasBody ? (
            <div className="flex border-b border-neutral-200 gap-0">
              {(["request", "response", "headers"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-2 text-xs font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? "border-neutral-900 text-neutral-900"
                      : "border-transparent text-neutral-400 hover:text-neutral-600"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          ) : null}
          {activeTab === "request" && failure.requestBody ? (
            <JsonBlock data={failure.requestBody} label="Request Body" />
          ) : null}
          {activeTab === "response" && failure.responseBody ? (
            <JsonBlock data={failure.responseBody} label="Response Body" />
          ) : null}
          {activeTab === "headers" ? (
            <div className="space-y-3">
              {failure.requestHeaders ? (
                <JsonBlock data={failure.requestHeaders} label="Request Headers" />
              ) : null}
              {failure.responseHeaders ? (
                <JsonBlock data={failure.responseHeaders} label="Response Headers" />
              ) : null}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

// ─── Report Viewer ────────────────────────────────────────────────────────

function ReportViewer({ report, onBack }: { report: FailureReport; onBack: () => void }) {
  const successRate = report.totalRequests
    ? Math.round(((report.totalRequests - report.failedRequests) / report.totalRequests) * 100)
    : 0;
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"all" | "failures">(report.logs && report.logs.length > 0 ? "all" : "failures");
  const [activeTab, setActiveTab] = useState<"logs" | "endpoints" | "shapes" | "timeline" | "breadcrumbs" | "errors" | "alerts" | "budgets" | "offline" | "releases" | "waterfall">("logs");

  const displayLogs = viewMode === "all" && report.logs ? report.logs : report.failures;

  const endpointMap = (viewMode === "all" && report.logs ? report.logs : report.failures).reduce(
    (acc, f) => {
      const key = `${f.method}:${f.url}`;
      if (!acc[key]) acc[key] = { method: f.method, url: f.url, count: 1, statusCodes: [f.status] };
      else {
        acc[key].count++;
        if (!acc[key].statusCodes.includes(f.status)) acc[key].statusCodes.push(f.status);
      }
      return acc;
    },
    {} as Record<string, { method: string; url: string; count: number; statusCodes: number[] }>
  );
  const endpoints = Object.values(endpointMap).sort((a, b) => b.count - a.count);

  const shapeChanges = (report.logs || []).reduce((acc, log) => {
    if (!log.responseBody) return acc;
    const key = log.url;
    if (!acc[key]) acc[key] = [];
    acc[key].push(log);
    return acc;
  }, {} as Record<string, ApiLog[]>);

  const timelineSorted = [...(report.logs || [])].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const timelineGroups = timelineSorted.reduce((acc, log) => {
    const date = new Date(log.timestamp);
    const key = date.toISOString().slice(0, 13);
    if (!acc[key]) acc[key] = [];
    acc[key].push(log);
    return acc;
  }, {} as Record<string, ApiLog[]>);

  const generateMarkdown = () => {
    let md = `# APIWitness Report\n\n`;
    md += `**App:** ${report.appName} v${report.appVersion}\n`;
    md += `**Environment:** ${report.environment}\n`;
    md += `**Generated:** ${report.generatedAt}\n`;
    md += `**Total Requests:** ${report.totalRequests}\n`;
    md += `**Failed Requests:** ${report.failedRequests}\n\n`;
    const items = viewMode === "all" && report.logs ? report.logs : report.failures;
    items.forEach((log, i) => {
      md += `---\n\n`;
      md += `## ${i + 1}: ${log.method} ${log.url}\n\n`;
      md += `**Status:** ${log.status || "Network Error"}\n`;
      md += `**Duration:** ${log.duration}ms\n`;
      md += `**Timestamp:** ${log.timestamp}\n\n`;
      if (log.errorMessage) md += `**Error:** ${log.errorMessage}\n\n`;
      if (log.requestBody) md += `**Request Body:**\n\`\`\`json\n${JSON.stringify(log.requestBody, null, 2)}\n\`\`\`\n\n`;
      if (log.responseBody) md += `**Response Body:**\n\`\`\`json\n${JSON.stringify(log.responseBody, null, 2)}\n\`\`\`\n\n`;
    });
    return md;
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const json = JSON.stringify(report, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "apiwitness-report.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPostman = () => {
    const items: any[] = endpoints.map((ep) => ({
      name: `${ep.method} ${ep.url}`,
      request: { method: ep.method, header: [], url: { raw: ep.url, host: [], path: [] } },
      response: [],
    }));
    const collection = {
      info: {
        name: `${report.appName} API Collection`,
        description: `Auto-generated from ${report.appName} v${report.appVersion}`,
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
      },
      item: items,
    };
    const blob = new Blob([JSON.stringify(collection, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "apiwitness-postman.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadOpenAPI = () => {
    const paths: Record<string, any> = {};
    endpoints.forEach((ep) => {
      const path = `/${ep.url.split("/").slice(3).join("/")}`;
      const method = ep.method.toLowerCase();
      if (!paths[path]) paths[path] = {};
      paths[path][method] = {
        summary: `${ep.method} ${path}`,
        parameters: [],
        responses: { "200": { description: "Successful response" } },
      };
    });
    const spec = {
      openapi: "3.0.3",
      info: {
        title: `${report.appName} API`,
        version: report.appVersion,
        description: `Auto-generated from ${report.appName} traffic`,
      },
      paths,
    };
    const blob = new Blob([JSON.stringify(spec, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "apiwitness-openapi.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <span className="text-xs text-neutral-400">All data processed locally in your browser.</span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Requests", value: report.totalRequests, color: "text-neutral-900" },
          { label: "Failed Requests", value: report.failedRequests, color: "text-red-600" },
          { label: "Success Rate", value: `${successRate}%`, color: successRate > 80 ? "text-emerald-600" : "text-red-600" },
          { label: "Endpoints", value: endpoints.length, color: "text-blue-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Analytics row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Unique Endpoints", value: endpoints.length, color: "text-indigo-600" },
          { label: "Shape Versions", value: Object.keys(shapeChanges).length, color: "text-amber-600" },
          { label: "Timeline Hours", value: Object.keys(timelineGroups).length, color: "text-cyan-600" },
          { label: "Status Codes", value: [...new Set((report.logs || report.failures).map((l) => l.status))].length, color: "text-violet-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-neutral-200 rounded-xl p-3 shadow-sm">
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Meta */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {[
            { label: "App", value: report.appName },
            { label: "Version", value: report.appVersion },
            { label: "Environment", value: report.environment },
            { label: "Report ID", value: report.reportId, mono: true },
          ].map((m) => (
            <div key={m.label}>
              <span className="text-neutral-400">{m.label}</span>
              <p className={`font-medium text-neutral-700 mt-0.5 ${m.mono ? "font-mono text-neutral-400 truncate" : ""}`}>{m.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* View Toggle + Export */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-0.5">
          {report.logs && report.logs.length > 0 ? (
            <>
              <button onClick={() => setViewMode("all")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === "all" ? "bg-white text-neutral-900 shadow-xs" : "text-neutral-500 hover:text-neutral-700"}`}
              >
                All Logs ({report.logs.length})
              </button>
              <button onClick={() => setViewMode("failures")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === "failures" ? "bg-white text-neutral-900 shadow-xs" : "text-neutral-500 hover:text-neutral-700"}`}
              >
                Failures ({report.failures.length})
              </button>
            </>
          ) : (
            <span className="px-3 py-1.5 text-xs font-medium text-neutral-500">Failures ({report.failures.length})</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleCopyMarkdown} className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm">
            {copied ? "Copied!" : "Copy MD"}
          </button>
          <button onClick={handleDownloadJson} className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 rounded-lg text-xs font-medium text-white hover:bg-neutral-800 transition-colors shadow-sm">
            JSON
          </button>
          <button onClick={handleDownloadPostman} className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-orange-600 rounded-lg text-xs font-medium text-white hover:bg-orange-700 transition-colors shadow-sm">
            Postman
          </button>
          <button onClick={handleDownloadOpenAPI} className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-green-700 rounded-lg text-xs font-medium text-white hover:bg-green-800 transition-colors shadow-sm">
            OpenAPI
          </button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex border-b border-neutral-200 gap-0 overflow-x-auto">
        {(["logs", "endpoints", "shapes", "timeline", "waterfall", "breadcrumbs", "errors", "alerts", "budgets", "offline", "releases"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-colors capitalize whitespace-nowrap ${activeTab === tab ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-400 hover:text-neutral-600"}`}
          >
            {tab === "logs" ? `${viewMode === "all" ? "All Logs" : "Failures"} (${displayLogs.length})` : tab}
          </button>
        ))}
      </div>

      {/* Logs Tab */}
      {activeTab === "logs" && (
        <>
          {displayLogs.length === 0 ? (
            <div className="text-center py-12 text-neutral-400"><p className="text-base">No requests recorded.</p></div>
          ) : (
            <div className="space-y-3">{displayLogs.map((f) => (<FailureCard key={f.id} failure={f} />))}</div>
          )}
        </>
      )}

      {/* Endpoints Tab */}
      {activeTab === "endpoints" && (
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left py-3 px-4 font-semibold text-neutral-700 text-xs">Method</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700 text-xs">URL</th>
                <th className="text-center py-3 px-4 font-semibold text-neutral-700 text-xs">Requests</th>
                <th className="text-center py-3 px-4 font-semibold text-neutral-700 text-xs">Status Codes</th>
              </tr>
            </thead>
            <tbody>
              {endpoints.map((ep) => (
                <tr key={`${ep.method}:${ep.url}`} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="py-3 px-4"><MethodBadge method={ep.method} /></td>
                  <td className="py-3 px-4 font-mono text-xs text-neutral-600 truncate max-w-xs">{ep.url}</td>
                  <td className="py-3 px-4 text-center text-xs text-neutral-700 font-medium">{ep.count}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {ep.statusCodes.map((sc) => (
                        <span key={sc} className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${sc >= 400 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>{sc}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Shapes Tab */}
      {activeTab === "shapes" && (
        <div className="space-y-4">
          {Object.entries(shapeChanges).length === 0 ? (
            <div className="text-center py-12 text-neutral-400"><p className="text-base">No response shapes captured yet.</p></div>
          ) : (
            Object.entries(shapeChanges).map(([url, logs]) => (
              <div key={url} className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <MethodBadge method={logs[0].method} />
                  <span className="text-xs font-mono text-neutral-600 truncate">{url}</span>
                  <span className="text-xs text-neutral-400 ml-auto">{logs.length} versions</span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {logs.filter((l) => l.responseBody).map((log) => (
                    <details key={log.id}>
                      <summary className="text-xs font-medium text-neutral-500 cursor-pointer hover:text-neutral-700">{log.timestamp.slice(0, 16)} — Status {log.status}</summary>
                      <pre className="mt-1 bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-xs font-mono text-neutral-700 overflow-x-auto">{JSON.stringify(log.responseBody, null, 2)}</pre>
                    </details>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === "timeline" && (
        <div className="space-y-4">
          {Object.keys(timelineGroups).length === 0 ? (
            <div className="text-center py-12 text-neutral-400"><p className="text-base">No timeline data.</p></div>
          ) : (
            Object.entries(timelineGroups).map(([time, group]) => (
              <div key={time} className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-neutral-900 mb-3">{time.replace("T", " ")}</h4>
                <div className="space-y-1.5">
                  {group.map((log) => (
                    <div key={log.id} className="flex items-center gap-2.5 text-xs">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${log.success ? "bg-emerald-400" : "bg-red-400"}`} />
                      <MethodBadge method={log.method} />
                      <span className="font-mono text-neutral-600 truncate">{log.url}</span>
                      <span className="text-neutral-400 ml-auto">
                        <span className={log.success ? "text-emerald-600" : "text-red-600"}>{log.status}</span>
                        <span className="ml-1.5">{log.duration}ms</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Waterfall Tab */}
      {activeTab === "waterfall" && (
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
          <h4 className="text-sm font-semibold text-neutral-900 mb-4">Network Waterfall</h4>
          {[...(report.logs || [])].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).length === 0 ? (
            <div className="text-center py-12 text-neutral-400"><p className="text-base">No waterfall data.</p></div>
          ) : (
            <div className="space-y-2">
              {[...(report.logs || [])].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map((log, _, arr) => {
                const minTime = new Date(arr[0].timestamp).getTime();
                const maxTime = new Date(arr[arr.length - 1].timestamp).getTime();
                const range = maxTime - minTime || 1;
                const startOffset = ((new Date(log.timestamp).getTime() - minTime) / range) * 100;
                const width = (log.duration / range) * 100;
                return (
                  <div key={log.id} className="flex items-center gap-3 text-xs">
                    <span className="w-16 flex-shrink-0 text-neutral-500 font-mono">{log.duration}ms</span>
                    <div className="flex-1 h-6 bg-neutral-50 rounded relative overflow-hidden">
                      <div className={`absolute top-0.5 bottom-0.5 rounded ${log.success ? "bg-emerald-400/60" : "bg-red-400/60"}`}
                        style={{ left: `${startOffset}%`, width: `${Math.max(width, 2)}%` }} />
                    </div>
                    <MethodBadge method={log.method} />
                    <span className="font-mono text-neutral-600 truncate max-w-[200px]">{log.url}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Breadcrumbs Tab */}
      {activeTab === "breadcrumbs" && (
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
          <h4 className="text-sm font-semibold text-neutral-900 mb-4">User Action Breadcrumbs</h4>
          <p className="text-xs text-neutral-400 mb-4">Taps, navigation events, and gestures recorded as context for API calls.</p>
          {displayLogs.filter(l => l.breadcrumbs && l.breadcrumbs.length > 0).length === 0 ? (
            <div className="text-center py-12 text-neutral-400"><p className="text-base">No breadcrumbs recorded.</p></div>
          ) : (
            <div className="space-y-3">
              {displayLogs.filter(l => l.breadcrumbs && l.breadcrumbs.length > 0).map((log) => (
                <div key={log.id} className="border border-neutral-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <MethodBadge method={log.method} />
                    <span className="text-xs font-mono text-neutral-600 truncate">{log.url}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {log.breadcrumbs!.map((b, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded text-[0.65rem] font-mono">
                        <span className={`w-1.5 h-1.5 rounded-full ${b.type === "tap" ? "bg-blue-400" : b.type === "navigation" ? "bg-violet-400" : "bg-amber-400"}`} />
                        {b.action || b.type}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error Groups Tab */}
      {activeTab === "errors" && (
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
          <h4 className="text-sm font-semibold text-neutral-900 mb-4">AI Error Grouping</h4>
          <p className="text-xs text-neutral-400 mb-4">Failures grouped by normalized signature (method + endpoint + status bucket + error message prefix).</p>
          {displayLogs.filter(l => !l.success).length === 0 ? (
            <div className="text-center py-12 text-neutral-400"><p className="text-base">No failures to group.</p></div>
          ) : (
            (() => {
              const groups = displayLogs.filter(l => !l.success).reduce((acc, l) => {
                const bucket = l.status >= 500 ? "5xx" : l.status >= 400 ? "4xx" : "other";
                const key = `${l.method}:${l.url}:${bucket}:${(l.errorMessage || "").split(" ").slice(0, 3).join(" ")}`;
                if (!acc[key]) acc[key] = [];
                acc[key].push(l);
                return acc;
              }, {} as Record<string, ApiLog[]>);
              return Object.entries(groups).map(([key, logs]) => (
                <details key={key} className="border border-neutral-200 rounded-lg mb-2">
                  <summary className="px-3 py-2 text-xs font-medium text-neutral-700 cursor-pointer hover:bg-neutral-50 rounded-lg flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    {logs[0].method} {logs[0].url}
                    <span className="ml-auto text-neutral-400">×{logs.length}</span>
                  </summary>
                  <div className="px-3 pb-3 space-y-1">
                    {logs.map((l) => (
                      <div key={l.id} className="flex items-center gap-2 text-xs text-neutral-500">
                        <span className={`font-medium ${l.status >= 500 ? "text-red-600" : "text-amber-600"}`}>{l.status}</span>
                        <span className="text-neutral-400">{l.errorMessage}</span>
                        <span className="ml-auto">{l.duration}ms</span>
                      </div>
                    ))}
                  </div>
                </details>
              ));
            })()
          )}
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === "alerts" && (
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
          <h4 className="text-sm font-semibold text-neutral-900 mb-4">Real-time Alerts</h4>
          <p className="text-xs text-neutral-400 mb-4">Webhook-triggered alerts fire when failure count exceeds threshold within the cooldown window.</p>
          {displayLogs.filter(l => !l.success).length === 0 ? (
            <div className="text-center py-12 text-neutral-400"><p className="text-base">No alerts triggered.</p></div>
          ) : (
            (() => {
              const groups = Object.entries(
                displayLogs.filter(l => !l.success).reduce((acc, l) => {
                  const key = `${l.method}:${l.url}`;
                  if (!acc[key]) acc[key] = [];
                  acc[key].push(l);
                  return acc;
                }, {} as Record<string, ApiLog[]>)
              );
              const alertItems = groups.filter(([, logs]) => logs.length >= 3);
              return (
                <div className="space-y-3">
                  {alertItems.map(([key, logs]) => (
                    <div key={key} className="flex items-start gap-3 p-3 border border-red-200 bg-red-50/50 rounded-lg">
                      <span className="text-lg">🔔</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-red-800">Threshold exceeded: {key}</p>
                        <p className="text-[0.65rem] text-red-600 mt-0.5">{logs.length} failures in current window</p>
                      </div>
                    </div>
                  ))}
                  {alertItems.length === 0 && (
                    <div className="text-center py-8 text-neutral-400"><p className="text-sm">No thresholds exceeded.</p></div>
                  )}
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* Performance Budgets Tab */}
      {activeTab === "budgets" && (
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
          <h4 className="text-sm font-semibold text-neutral-900 mb-4">Performance Budgets</h4>
          <p className="text-xs text-neutral-400 mb-4">Latency thresholds per endpoint pattern. Budget violations are flagged for review.</p>
          {displayLogs.length === 0 ? (
            <div className="text-center py-12 text-neutral-400"><p className="text-base">No data to evaluate budgets.</p></div>
          ) : (
            <div className="space-y-3">
              {displayLogs.filter(l => l.duration > 1000).length > 0 ? (
                displayLogs.filter(l => l.duration > 1000).map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 border border-amber-200 bg-amber-50/50 rounded-lg">
                    <span className="text-lg">🎯</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <MethodBadge method={log.method} />
                        <span className="text-xs font-mono text-neutral-600 truncate">{log.url}</span>
                      </div>
                      <p className="text-[0.65rem] text-amber-700 mt-1"><span className="font-bold">{log.duration}ms</span> exceeds 1000ms budget</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-emerald-600 text-sm font-medium">All requests within budget ✓</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Offline Queue Tab */}
      {activeTab === "offline" && (
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
          <h4 className="text-sm font-semibold text-neutral-900 mb-4">Offline Queue & Retry</h4>
          <p className="text-xs text-neutral-400 mb-4">Failed exports and webhooks are queued locally and retried with exponential backoff.</p>
          <div className="text-center py-12 text-neutral-400">
            <RefreshCw className="w-10 h-10 mx-auto text-neutral-300 mb-3" />
            <p className="text-sm font-medium text-neutral-500">Queue is empty</p>
            <p className="text-xs text-neutral-400 mt-1">Retry attempts are logged here when they occur.</p>
          </div>
        </div>
      )}

      {/* Release Comparison Tab */}
      {activeTab === "releases" && (
        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
          <h4 className="text-sm font-semibold text-neutral-900 mb-4">Release Comparison</h4>
          <p className="text-xs text-neutral-400 mb-4">Compare endpoints, shapes, and latency between two app versions.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
              <p className="text-xs font-medium text-neutral-400 mb-1">Current Version</p>
              <p className="text-lg font-bold text-neutral-900">{report.appVersion}</p>
            </div>
            <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
              <p className="text-xs font-medium text-neutral-400 mb-1">Endpoints</p>
              <p className="text-lg font-bold text-blue-600">{endpoints.length}</p>
            </div>
            <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
              <p className="text-xs font-medium text-neutral-400 mb-1">Avg Latency</p>
              <p className="text-lg font-bold text-amber-600">
                {displayLogs.length > 0 ? Math.round(displayLogs.reduce((s, l) => s + l.duration, 0) / displayLogs.length) : 0}ms
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Report Section ───────────────────────────────────────────────────────

const sampleLogs: ApiLog[] = [
  { id: "1", method: "GET", url: "https://api.example.com/users", status: 200, success: true, requestHeaders: { Authorization: "***" }, responseHeaders: { "content-type": "application/json" }, responseBody: { id: 1, name: "John", email: "john@test.com" }, duration: 142, timestamp: "2026-06-15T09:12:00.000Z", breadcrumbs: [{ type: "navigation", action: "HomeScreen → UsersList", timestamp: "2026-06-15T09:11:55.000Z" }] },
  { id: "2", method: "GET", url: "https://api.example.com/users/2/profile", status: 200, success: true, requestHeaders: { Authorization: "***" }, responseHeaders: { "content-type": "application/json" }, responseBody: { id: 2, name: "Jane", avatar: "https://example.com/avatar.png", role: "admin" }, duration: 89, timestamp: "2026-06-15T09:12:05.000Z", breadcrumbs: [{ type: "tap", action: "Tap on user row", timestamp: "2026-06-15T09:12:02.000Z" }] },
  { id: "3", method: "POST", url: "https://api.example.com/auth/login", status: 401, success: false, requestHeaders: { "Content-Type": "application/json" }, requestBody: { email: "test@test.com", password: "***" }, responseBody: { error: "Invalid credentials" }, errorMessage: "Unauthorized", duration: 1200, timestamp: "2026-06-15T09:13:00.000Z", breadcrumbs: [{ type: "tap", action: "Tap Login button", timestamp: "2026-06-15T09:12:58.000Z" }] },
  { id: "4", method: "PUT", url: "https://api.example.com/users/1/settings", status: 422, success: false, requestHeaders: { "Content-Type": "application/json", Authorization: "***" }, requestBody: { theme: "dark", notifications: true }, responseBody: { errors: { theme: "Invalid value" } }, errorMessage: "Unprocessable Entity", duration: 890, timestamp: "2026-06-15T09:14:30.000Z", breadcrumbs: [{ type: "navigation", action: "SettingsScreen", timestamp: "2026-06-15T09:14:10.000Z" }, { type: "tap", action: "Tap Save button", timestamp: "2026-06-15T09:14:28.000Z" }] },
  { id: "5", method: "DELETE", url: "https://api.example.com/posts/42", status: 500, success: false, requestHeaders: { Authorization: "***" }, responseBody: { error: "Internal server error" }, errorMessage: "Internal Server Error", duration: 3100, timestamp: "2026-06-15T09:15:00.000Z", breadcrumbs: [{ type: "tap", action: "Long press post row → Delete", timestamp: "2026-06-15T09:14:55.000Z" }] },
  { id: "6", method: "GET", url: "https://api.example.com/courses", status: 200, success: true, requestHeaders: { Authorization: "***" }, responseBody: [{ id: 1, title: "Math 101" }, { id: 2, title: "Physics 202" }], duration: 210, timestamp: "2026-06-15T09:16:00.000Z" },
  { id: "7", method: "POST", url: "https://api.example.com/payments", status: 402, success: false, requestHeaders: { "Content-Type": "application/json", Authorization: "***" }, requestBody: { amount: 29.99, currency: "USD" }, responseBody: { error: "Insufficient funds" }, errorMessage: "Payment Required", duration: 1500, timestamp: "2026-06-15T09:17:00.000Z", breadcrumbs: [{ type: "gesture", action: "Swipe to pay", timestamp: "2026-06-15T09:16:55.000Z" }] },
  { id: "8", method: "GET", url: "https://api.example.com/users/1/orders", status: 200, success: true, requestHeaders: { Authorization: "***" }, responseBody: [{ id: 101, total: 49.99, status: "shipped" }], duration: 175, timestamp: "2026-06-15T09:18:00.000Z" },
];

function ReportSection() {
  const [report, setReport] = useState<FailureReport | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadSampleReport = useCallback(() => {
    setReport({
      reportId: "demo-001",
      appName: "Demo App",
      appVersion: "2.4.1",
      environment: "production",
      generatedAt: new Date().toISOString(),
      totalRequests: sampleLogs.length,
      failedRequests: sampleLogs.filter((l) => !l.success).length,
      failures: sampleLogs.filter((l) => !l.success),
      logs: sampleLogs,
    });
  }, []);

  const handleFile = useCallback((file: File) => {
    setError(null);
    if (!file.name.endsWith(".json")) {
      setError("Please upload a .json file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (!parsed.failures || !parsed.appName) {
          setError("Invalid APIWitness report format.");
          return;
        }
        setReport(parsed as FailureReport);
      } catch {
        setError("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  if (report) {
    return <ReportViewer report={report} onBack={() => setReport(null)} />;
  }

  return (
    <section id="report" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-neutral-50/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 border border-neutral-200 rounded-full text-xs font-medium text-neutral-600 mb-4">
            Report Viewer
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900 mb-4">
            See it in{" "}
            <span className="text-neutral-400">action</span>
          </h2>
          <p className="text-lg text-neutral-500 leading-relaxed">
            Upload an <span className="font-mono text-neutral-700 bg-neutral-100 px-1.5 py-0.5 rounded">apiwitness-report.json</span>{" "}
            from your app, or view a sample. Everything stays in your browser.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-3xl mx-auto"
        >
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-12 sm:p-16 text-center cursor-pointer transition-all ${
              dragOver ? "border-brand-400 bg-brand-50" : "border-neutral-200 hover:border-neutral-300 bg-white"
            }`}
          >
            <input ref={inputRef} type="file" accept=".json" className="hidden"
              onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFile(file); }}
            />
            <Upload className={`w-10 h-10 mx-auto mb-4 transition-colors ${dragOver ? "text-brand-500" : "text-neutral-300"}`} />
            <p className="text-sm font-medium text-neutral-700 mb-0.5">Drop report file or click to browse</p>
            <p className="text-xs text-neutral-400">Supports .json files exported from the SDK</p>
          </div>
          {error && <p className="text-red-500 text-xs mt-3 text-center">{error}</p>}

          <div className="mt-8 flex flex-col items-center gap-4">
            <Button onClick={loadSampleReport} size="lg">
              <RefreshCw className="w-4 h-4" />
              Load Sample Report
            </Button>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-medium text-amber-700">Your data stays in your browser. Nothing is uploaded.</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900 mb-4">
            Start witnessing your{" "}
            <span className="text-neutral-400">mobile API failures</span>
          </h2>
          <p className="text-lg text-neutral-500 leading-relaxed mb-8">
            Install the SDK in your React Native or Expo app and get full API
            observability in minutes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="#install"><Button size="lg">Install SDK</Button></a>
            <a href="#report"><Button variant="secondary" size="lg">View Demo Report</Button></a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main>
      <Nav />
      <Hero />
      <Problem />
      <HowItWorks />
      <FeaturesSection />
      <ChangeDetection />
      <DocsGeneration />
      <InstallSection />
      <ConfigSection />
      <ReportSection />
      <PricingSection />
      <FinalCTA />
      <Footer />
    </main>
  );
}
