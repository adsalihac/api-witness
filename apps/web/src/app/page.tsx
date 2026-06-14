"use client";

import { useState, useCallback, useRef } from "react";

type ApiLog = {
  id: string;
  method: string;
  url: string;
  status: number;
  success: boolean;
  requestHeaders?: Record<string, any>;
  responseHeaders?: Record<string, any>;
  requestBody?: any;
  responseBody?: any;
  errorMessage?: string;
  duration: number;
  timestamp: string;
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
};

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-green-100 text-green-700",
    POST: "bg-blue-100 text-blue-700",
    PUT: "bg-orange-100 text-orange-700",
    PATCH: "bg-purple-100 text-purple-700",
    DELETE: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold ${
        colors[method] || "bg-gray-100 text-gray-700"
      }`}
    >
      {method}
    </span>
  );
}

function StatusBadge({ status }: { status: number }) {
  const isError = status >= 400 || status === 0;
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold ${
        isError ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
      }`}
    >
      {status || "ERR"}
    </span>
  );
}

function JsonBlock({ data }: { data: any }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 px-2.5 py-1 text-xs font-medium bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
      <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 pr-16 overflow-x-auto text-sm font-mono text-gray-700 leading-relaxed">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
}) {
  return (
    <div className="flex border-b border-gray-200 mb-4">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            active === tab
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

function FailureCard({ failure }: { failure: ApiLog }) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("Request");

  const hasHeaders =
    failure.requestHeaders || failure.responseHeaders;
  const hasBody = failure.requestBody || failure.responseBody;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
      >
        <MethodBadge method={failure.method} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {failure.url}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={failure.status} />
            {failure.errorMessage && (
              <span className="text-xs text-red-600 truncate">
                {failure.errorMessage}
              </span>
            )}
            <span className="text-xs text-gray-400">{failure.duration}ms</span>
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 p-4">
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <span className="text-gray-500">Duration:</span>{" "}
              <span className="font-medium">{failure.duration}ms</span>
            </div>
            <div>
              <span className="text-gray-500">Timestamp:</span>{" "}
              <span className="font-medium">
                {new Date(failure.timestamp).toLocaleString()}
              </span>
            </div>
          </div>

          {hasHeaders && hasBody && (
            <Tabs
              tabs={["Request", "Response", "Headers"]}
              active={activeTab}
              onChange={setActiveTab}
            />
          )}

          {activeTab === "Request" && failure.requestBody && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Request Body
              </h4>
              <JsonBlock data={failure.requestBody} />
            </div>
          )}

          {activeTab === "Response" && failure.responseBody && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Response Body
              </h4>
              <JsonBlock data={failure.responseBody} />
            </div>
          )}

          {activeTab === "Headers" && (
            <div className="space-y-4">
              {failure.requestHeaders && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Request Headers
                  </h4>
                  <JsonBlock data={failure.requestHeaders} />
                </div>
              )}
              {failure.responseHeaders && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-3 mb-2">
                    Response Headers
                  </h4>
                  <JsonBlock data={failure.responseHeaders} />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReportViewer({ report }: { report: FailureReport }) {
  const successRate = report.totalRequests
    ? Math.round(
        ((report.totalRequests - report.failedRequests) /
          report.totalRequests) *
          100
      )
    : 0;

  const [copied, setCopied] = useState(false);

  const generateMarkdown = () => {
    let md = `# API Failure Report\n\n`;
    md += `**App:** ${report.appName} v${report.appVersion}\n`;
    md += `**Environment:** ${report.environment}\n`;
    md += `**Generated:** ${report.generatedAt}\n`;
    md += `**Total Requests:** ${report.totalRequests}\n`;
    md += `**Failed Requests:** ${report.failedRequests}\n\n`;

    report.failures.forEach((fail, i) => {
      md += `## Failure ${i + 1}: ${fail.method} ${fail.url}\n\n`;
      md += `**Status:** ${fail.status || "Network Error"}\n`;
      md += `**Duration:** ${fail.duration}ms\n`;
      md += `**Timestamp:** ${fail.timestamp}\n\n`;
      if (fail.errorMessage) md += `**Error:** ${fail.errorMessage}\n\n`;
      if (fail.requestBody)
        md += `**Request Body:**\n\`\`\`json\n${JSON.stringify(
          fail.requestBody,
          null,
          2
        )}\n\`\`\`\n\n`;
      if (fail.responseBody)
        md += `**Response Body:**\n\`\`\`json\n${JSON.stringify(
          fail.responseBody,
          null,
          2
        )}\n\`\`\`\n\n`;
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-2xl font-bold text-gray-900">
            {report.totalRequests}
          </p>
          <p className="text-sm text-gray-500 mt-1">Total Requests</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-2xl font-bold text-red-600">
            {report.failedRequests}
          </p>
          <p className="text-sm text-gray-500 mt-1">Failed Requests</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p
            className={`text-2xl font-bold ${
              successRate > 80 ? "text-green-600" : "text-red-600"
            }`}
          >
            {successRate}%
          </p>
          <p className="text-sm text-gray-500 mt-1">Success Rate</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500 mt-1">Report ID</p>
          <p className="text-xs font-mono text-gray-400 truncate mt-0.5">
            {report.reportId}
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">App</span>
            <p className="font-medium text-gray-900">{report.appName}</p>
          </div>
          <div>
            <span className="text-gray-500">Version</span>
            <p className="font-medium text-gray-900">{report.appVersion}</p>
          </div>
          <div>
            <span className="text-gray-500">Environment</span>
            <p className="font-medium text-gray-900">{report.environment}</p>
          </div>
          <div>
            <span className="text-gray-500">Report Date</span>
            <p className="font-medium text-gray-900">
              {new Date(report.generatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleCopyMarkdown}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
          {copied ? "Copied!" : "Copy Markdown Report"}
        </button>
        <button
          onClick={handleDownloadJson}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
        >
          Download JSON
        </button>
      </div>

      {report.failures.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">No failures recorded.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Failures ({report.failures.length})
          </h3>
          {report.failures.map((failure) => (
            <FailureCard key={failure.id} failure={failure} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const [report, setReport] = useState<FailureReport | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  if (report) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setReport(null)}
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </button>
            <span className="text-xs text-gray-400">
              All data processed locally in your browser.
            </span>
          </div>
          <ReportViewer report={report} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-20">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight mb-4">
            The Witness For Every API Failure
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            APIWitness records failed API requests in React Native and Expo apps
            and generates developer-ready debugging reports.
          </p>
        </div>

        <div className="mb-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            The Problem
          </h2>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 max-w-2xl mx-auto">
            <p className="text-gray-700 text-lg mb-4 italic">
              &ldquo;Login isn&apos;t working.&rdquo;
            </p>
            <p className="text-gray-500 mb-4">Developer asks:</p>
            <ul className="space-y-2 text-gray-600">
              {[
                "Which API failed?",
                "What payload was sent?",
                "What response was returned?",
                "Which environment?",
              ].map((q) => (
                <li key={q} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                  {q}
                </li>
              ))}
            </ul>
            <p className="text-gray-900 font-semibold mt-6">
              APIWitness captures everything automatically.
            </p>
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Install SDK", desc: "Add one dependency" },
              { step: "2", title: "QA Tests App", desc: "Normal testing flow" },
              {
                step: "3",
                title: "API Failure Occurs",
                desc: "Recorded automatically",
              },
              {
                step: "4",
                title: "Developer Fixes Faster",
                desc: "Full context provided",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm"
              >
                <span className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-700 font-bold rounded-full text-lg mb-4">
                  {s.step}
                </span>
                <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-20">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${
              dragOver
                ? "border-blue-400 bg-blue-50"
                : "border-gray-200 hover:border-gray-300 bg-gray-50"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            <svg
              className="w-10 h-10 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-lg font-medium text-gray-700 mb-1">
              Upload Report
            </p>
            <p className="text-sm text-gray-400">
              Drop your <span className="font-mono">apiwitness-report.json</span>{" "}
              file here
            </p>
          </div>
          {error && (
            <p className="text-red-500 text-sm mt-3 text-center">{error}</p>
          )}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center max-w-2xl mx-auto">
          <p className="text-amber-800 text-sm font-medium">
            APIWitness processes reports entirely in your browser. Nothing is
            uploaded to any server.
          </p>
        </div>
      </div>
    </main>
  );
}
