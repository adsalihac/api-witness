"use client";

import { useState, useCallback, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-emerald-100 text-emerald-700",
  POST: "bg-blue-100 text-blue-700",
  PUT: "bg-amber-100 text-amber-700",
  PATCH: "bg-violet-100 text-violet-700",
  DELETE: "bg-red-100 text-red-700",
};

const FEATURES = [
  {
    title: "Failed API Reports",
    desc: "Auto-captured request and response payloads, headers, status codes, timing, and error messages.",
    icon: "💥",
  },
  {
    title: "New Endpoint Detection",
    desc: "Automatically identifies API endpoints your app calls that have no matching documentation.",
    icon: "🔍",
  },
  {
    title: "Response Shape Changes",
    desc: "Detects added, removed, or modified fields in API responses between app versions.",
    icon: "📐",
  },
  {
    title: "Missing Documentation",
    desc: "Flags endpoints that exist in your app but are absent from your API docs or spec files.",
    icon: "📄",
  },
  {
    title: "API Timeline",
    desc: "Chronological view of all API calls with timing, ordering, and parallel request visualization.",
    icon: "⏱",
  },
  {
    title: "Postman Export",
    desc: "One-click export of captured endpoints as a Postman collection for further testing.",
    icon: "📮",
  },
  {
    title: "OpenAPI Export",
    desc: "Auto-generated OpenAPI 3.0 specification from real mobile app traffic.",
    icon: "📋",
  },
  {
    title: "Markdown Docs Export",
    desc: "Generate readable documentation from captured API usage for your team wiki or README.",
    icon: "📝",
  },
];

const CONFIG_OPTIONS: {
  field: string;
  type: string;
  default: string;
  description: string;
}[] = [
  {
    field: "appName",
    type: "string",
    default: "—",
    description: "Name of the mobile app.",
  },
  {
    field: "appVersion",
    type: "string",
    default: "—",
    description: "App version used for debugging reports.",
  },
  {
    field: "environment",
    type: "string",
    default: "—",
    description: 'Current API environment: "development", "staging", "production".',
  },
  {
    field: "recordSuccessfulRequests",
    type: "boolean",
    default: "false",
    description: "Whether successful requests should also be recorded.",
  },
  {
    field: "sensitiveFields",
    type: "string[]",
    default: '["password","token","apiKey",…]',
    description: "Request / response keys to mask before storing.",
  },
  {
    field: "dashboardUrl",
    type: "string",
    default: "undefined",
    description: "Optional URL for syncing captured data to a cloud dashboard.",
  },
  {
    field: "enableChangeDetection",
    type: "boolean",
    default: "false",
    description: "Enables response shape comparison across app versions.",
  },
  {
    field: "enableDocsGeneration",
    type: "boolean",
    default: "false",
    description: "Enables docs generation from captured API traffic.",
  },
];

// ─── Components ───────────────────────────────────────────────────────────

function Nav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-black flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </span>
          <span className="font-semibold text-sm tracking-tight">APIWitness</span>
        </a>
        <nav className="hidden sm:flex items-center gap-6 text-sm text-neutral-500">
          <a href="#how-it-works" className="hover:text-neutral-900 transition-colors">How it works</a>
          <a href="#docs" className="hover:text-neutral-900 transition-colors">Docs</a>
          <a href="#report" className="hover:text-neutral-900 transition-colors">View Report</a>
        </nav>
        <a
          href="#install"
          className="inline-flex items-center px-3.5 py-1.5 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
        >
          Get Started
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="pt-28 pb-20 sm:pt-36 sm:pb-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 border border-neutral-200 rounded-full text-xs font-medium text-neutral-600 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            API Observability for Mobile Apps
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 leading-[1.08] mb-6">
            Detect breaking API changes{" "}
            <span className="text-neutral-400">before users do.</span>
          </h1>
          <p className="text-base sm:text-lg text-neutral-500 leading-relaxed max-w-2xl mx-auto">
            APIWitness records real API traffic from React Native and Expo apps,
            detects API failures, tracks response changes, and generates
            developer-ready documentation — automatically.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <a
              href="#install"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors shadow-sm"
            >
              Get Started
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <a
              href="#report"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-neutral-700 text-sm font-medium rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors shadow-sm"
            >
              View Demo Report
            </a>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="relative max-w-4xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none" />
          <div className="border border-neutral-200 rounded-2xl shadow-lg bg-white overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-neutral-100 bg-neutral-50/50">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="ml-3 text-xs text-neutral-400 font-mono">apiwitness-dashboard</span>
            </div>
            <div className="p-5 sm:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                  { label: "Total Requests", value: "1,284" },
                  { label: "Failed Requests", value: "47", accent: true },
                  { label: "New Endpoints", value: "12", accent: "blue" },
                  { label: "Changed Responses", value: "8", accent: "amber" },
                ].map((s) => (
                  <div key={s.label} className="bg-neutral-50 rounded-xl p-3.5 border border-neutral-100">
                    <p className={`text-xl font-bold ${s.accent === true ? "text-red-600" : s.accent === "blue" ? "text-blue-600" : s.accent === "amber" ? "text-amber-600" : "text-neutral-900"}`}>
                      {s.value}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {[
                  { method: "GET", path: "/api/users", status: 200, duration: "142ms" },
                  { method: "GET", path: "/api/users/:id/profile", status: 200, duration: "89ms" },
                  { method: "POST", path: "/api/auth/login", status: 401, duration: "1.2s", error: true },
                  { method: "PUT", path: "/api/users/:id/settings", status: 422, duration: "890ms", error: true },
                  { method: "DELETE", path: "/api/posts/:id", status: 500, duration: "3.1s", error: true },
                ].map((r) => (
                  <div key={r.path} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                      r.method === "GET" ? "bg-emerald-100 text-emerald-700" :
                      r.method === "POST" ? "bg-blue-100 text-blue-700" :
                      r.method === "PUT" ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {r.method}
                    </span>
                    <span className="flex-1 text-sm font-mono text-neutral-700 truncate">{r.path}</span>
                    <span className={`text-xs font-bold ${r.error ? "text-red-600" : "text-emerald-600"}`}>
                      {r.status}
                    </span>
                    <span className="text-xs text-neutral-400 w-12 text-right">{r.duration}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-neutral-100">
                <span className="px-2.5 py-1 text-xs font-medium bg-neutral-100 text-neutral-600 rounded-md">Postman Export</span>
                <span className="px-2.5 py-1 text-xs font-medium bg-neutral-100 text-neutral-600 rounded-md">OpenAPI Export</span>
                <span className="px-2.5 py-1 text-xs font-medium bg-neutral-100 text-neutral-600 rounded-md">Markdown Docs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Problem() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-neutral-50/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 mb-4">
            Mobile API bugs are hard to reproduce
          </h2>
          <p className="text-neutral-500 leading-relaxed">
            QA usually reports vague issues. Developers lose hours trying to
            reconstruct what actually happened.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* QA Side */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-600">QA</span>
              <span className="text-sm font-semibold text-neutral-900">What QA reports</span>
            </div>
            <div className="space-y-2">
              {[
                "Login is not working",
                "Course list is empty",
                "Payment failed",
                "Profile update is broken",
              ].map((msg) => (
                <div key={msg} className="flex items-center gap-2.5 px-3.5 py-2.5 bg-red-50 border border-red-100 rounded-lg">
                  <span className="text-red-400 text-lg leading-none">!</span>
                  <span className="text-sm text-red-800">&ldquo;{msg}&rdquo;</span>
                </div>
              ))}
            </div>
          </div>

          {/* Developer Side */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">Dev</span>
              <span className="text-sm font-semibold text-neutral-900">What developers need</span>
            </div>
            <ul className="space-y-2.5">
              {[
                "Which API endpoint failed?",
                "What request payload was sent?",
                "What response came back?",
                "Which app version?",
                "Which environment?",
                "Did the API response shape change?",
              ].map((q) => (
                <li key={q} className="flex items-center gap-2.5 px-3.5 py-2.5 bg-neutral-50 border border-neutral-100 rounded-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  <span className="text-sm text-neutral-700">{q}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Solution() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 mb-4">
            APIWitness captures the evidence automatically
          </h2>
          <p className="text-neutral-500 leading-relaxed">
            Install the SDK once. Every API call is recorded, analyzed, and
            ready for debugging — without changing your testing workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Record Real App Traffic",
              desc: "Captures fetch and Axios requests directly from the app with full payload, headers, and timing.",
            },
            {
              step: "02",
              title: "Detect API Failures",
              desc: "Records status codes, payloads, headers, duration, error messages, and environment context.",
            },
            {
              step: "03",
              title: "Track Breaking Changes",
              desc: "Detects new fields, removed fields, changed response shapes, and undocumented endpoints.",
            },
          ].map((s) => (
            <div key={s.step} className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <span className="text-xs font-bold text-neutral-400 tracking-widest">{s.step}</span>
              <h3 className="text-lg font-semibold text-neutral-900 mt-2 mb-2">{s.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function InstallSection() {
  return (
    <section id="install" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-neutral-50/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 mb-4">
            Install in under a minute
          </h2>
          <p className="text-neutral-500 leading-relaxed">
            Add one dependency, call one function. No build tool changes, no
            native module linking.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Install command */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="px-3 py-1.5 bg-neutral-100 border border-neutral-200 rounded-lg text-xs font-medium text-neutral-600">npm</span>
            <code className="text-sm font-mono bg-neutral-900 text-white px-4 py-2 rounded-lg">npx expo install @apiwitness/sdk</code>
            <button
              onClick={() => {
                navigator.clipboard.writeText("npx expo install @apiwitness/sdk");
              }}
              className="px-3 py-2 text-xs font-medium text-neutral-500 hover:text-neutral-700 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              Copy
            </button>
          </div>

          {/* Code example */}
          <div className="bg-neutral-900 rounded-2xl overflow-hidden shadow-lg border border-neutral-800">
            <div className="flex items-center gap-1.5 px-4 py-2.5 bg-neutral-800/50 border-b border-neutral-800">
              <span className="w-2 h-2 rounded-full bg-red-500/60" />
              <span className="w-2 h-2 rounded-full bg-amber-500/60" />
              <span className="w-2 h-2 rounded-full bg-emerald-500/60" />
              <span className="ml-2 text-xs text-neutral-500 font-mono">app/_layout.tsx</span>
            </div>
            <pre className="p-4 sm:p-5 overflow-x-auto text-sm leading-relaxed">
              <code className="font-mono text-neutral-300">
                {`import { useEffect } from "react";
import { Stack } from "expo-router";
import { startAPIWitness, setupAxiosWitness }
  from "@apiwitness/sdk";
import axios from "axios";

export default function RootLayout() {
  useEffect(() => {
    startAPIWitness({
      appName: "MyApp",
      appVersion: "1.0.0",
      environment: "development",
      recordSuccessfulRequests: false,
      sensitiveFields: [
        "password",
        "token",
        "accessToken",
        "apiKey",
        "secret",
      ],
    });

    setupAxiosWitness(axios);
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}`}
              </code>
            </pre>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            {[
              { title: "startAPIWitness()", desc: "Enables automatic fetch recording and log persistence." },
              { title: "setupAxiosWitness()", desc: "Optional — adds Axios interceptor for request capture." },
              { title: "Sensitive Fields", desc: "Keys are masked before logs are stored locally." },
            ].map((item) => (
              <div key={item.title} className="bg-white border border-neutral-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
                <p className="text-xs text-neutral-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ConfigSection() {
  return (
    <section id="docs" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 mb-4">
            Configuration
          </h2>
          <p className="text-neutral-500 leading-relaxed">
            Fine-tune what&apos;s captured, what&apos;s masked, and how data is
            synchronized.
          </p>
        </div>

        <div className="max-w-4xl mx-auto overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 font-semibold text-neutral-900">Option</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-900">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-900">Default</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-900">Description</th>
              </tr>
            </thead>
            <tbody>
              {CONFIG_OPTIONS.map((opt) => (
                <tr key={opt.field} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <td className="py-3 px-4">
                    <code className="text-xs font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{opt.field}</code>
                  </td>
                  <td className="py-3 px-4 text-neutral-500 text-xs font-mono">{opt.type}</td>
                  <td className="py-3 px-4 text-neutral-400 text-xs font-mono">{opt.default}</td>
                  <td className="py-3 px-4 text-neutral-600 text-xs">{opt.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-neutral-50/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 mb-4">
            From raw API traffic to useful engineering insight
          </h2>
          <p className="text-neutral-500 leading-relaxed">
            Every captured request is analyzed and categorized. No more digging
            through raw logs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-neutral-300 transition-all"
            >
              <span className="text-xl">{f.icon}</span>
              <h3 className="text-sm font-semibold text-neutral-900 mt-3 mb-1.5">
                {f.title}
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Report Viewer ────────────────────────────────────────────────────────

function MethodBadge({ method }: { method: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold font-mono ${
        METHOD_COLORS[method] || "bg-neutral-100 text-neutral-700"
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
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
        isError ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
      }`}
    >
      {status || "ERR"}
    </span>
  );
}

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
          className={`w-4 h-4 text-neutral-400 transition-transform flex-shrink-0 ${
            expanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
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

function ReportViewer({ report, onBack }: { report: FailureReport; onBack: () => void }) {
  const successRate = report.totalRequests
    ? Math.round(((report.totalRequests - report.failedRequests) / report.totalRequests) * 100)
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
      if (fail.requestBody) md += `**Request Body:**\n\`\`\`json\n${JSON.stringify(fail.requestBody, null, 2)}\n\`\`\`\n\n`;
      if (fail.responseBody) md += `**Response Body:**\n\`\`\`json\n${JSON.stringify(fail.responseBody, null, 2)}\n\`\`\`\n\n`;
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

  const endpoints = report.failures.reduce(
    (acc, f) => {
      const key = f.url;
      if (!acc[key]) acc[key] = [];
      acc[key].push(f);
      return acc;
    },
    {} as Record<string, ApiLog[]>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Requests", value: report.totalRequests, color: "text-neutral-900" },
          { label: "Failed Requests", value: report.failedRequests, color: "text-red-600" },
          { label: "Success Rate", value: `${successRate}%`, color: successRate > 80 ? "text-emerald-600" : "text-red-600" },
          { label: "Endpoints", value: Object.keys(endpoints).length, color: "text-blue-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
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
              <p className={`font-medium text-neutral-700 mt-0.5 ${m.mono ? "font-mono text-neutral-400 truncate" : ""}`}>
                {m.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleCopyMarkdown}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-neutral-200 rounded-lg text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm"
        >
          {copied ? "Copied!" : "Copy Markdown"}
        </button>
        <button
          onClick={handleDownloadJson}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 rounded-lg text-xs font-medium text-white hover:bg-neutral-800 transition-colors shadow-sm"
        >
          Download JSON
        </button>
      </div>

      {/* Endpoint Groups */}
      {Object.entries(endpoints).length === 0 ? (
        <div className="text-center py-12 text-neutral-400">
          <p className="text-base">No failures recorded.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-neutral-900">
            Endpoints ({Object.keys(endpoints).length})
          </h3>
          {Object.entries(endpoints).map(([url, failures]) => (
            <div key={url}>
              <div className="flex items-center gap-2 mb-2">
                <MethodBadge method={failures[0].method} />
                <span className="text-xs font-mono text-neutral-600 truncate">{url}</span>
                <span className="text-xs text-neutral-400 ml-auto">{failures.length} failure{failures.length > 1 ? "s" : ""}</span>
              </div>
              <div className="space-y-2">
                {failures.map((f) => (
                  <FailureCard key={f.id} failure={f} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReportSection() {
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

  if (report) {
    return <ReportViewer report={report} onBack={() => setReport(null)} />;
  }

  return (
    <section id="report" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 mb-4">
            View a Demo Report
          </h2>
          <p className="text-neutral-500 leading-relaxed">
            Upload an <span className="font-mono text-neutral-700 bg-neutral-100 px-1.5 py-0.5 rounded text-sm">apiwitness-report.json</span>{" "}
            file exported from your app. Everything stays in your browser.
          </p>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-neutral-400 bg-neutral-50"
              : "border-neutral-200 hover:border-neutral-300 bg-white"
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
          <svg className="w-8 h-8 mx-auto text-neutral-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm font-medium text-neutral-700 mb-0.5">Upload Report</p>
          <p className="text-xs text-neutral-400">Drop your JSON file here or click to browse</p>
        </div>
        {error && <p className="text-red-500 text-xs mt-3 text-center">{error}</p>}

        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-center">
          <p className="text-xs text-amber-700 font-medium">
            Your API data stays in your browser. Nothing is uploaded to a server.
          </p>
        </div>
      </div>
    </section>
  );
}

function MarketSection() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-neutral-50/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 mb-4">
            Documentation gets users in. Change detection keeps teams using it.
          </h2>
          <p className="text-neutral-500 leading-relaxed">
            APIWitness is not only a documentation generator. The long-term value
            is detecting API changes before they break production mobile apps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              label: "Documentation only",
              score: "6/10",
              desc: "One-time value",
              highlight: false,
            },
            {
              label: "Documentation + Postman export",
              score: "7/10",
              desc: "Better handover",
              highlight: false,
            },
            {
              label: "Documentation + API change tracking",
              score: "9/10",
              desc: "Recurring engineering value",
              highlight: true,
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`bg-white border rounded-2xl p-6 shadow-sm ${
                item.highlight
                  ? "border-neutral-900 ring-1 ring-neutral-900/10"
                  : "border-neutral-200"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Value</span>
                <span className={`text-lg font-bold ${item.highlight ? "text-neutral-900" : "text-neutral-400"}`}>
                  {item.score}
                </span>
              </div>
              <p className={`text-sm font-semibold ${item.highlight ? "text-neutral-900" : "text-neutral-600"}`}>
                {item.label}
              </p>
              <p className="text-xs text-neutral-400 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 mb-4">
            Start witnessing your mobile API failures
          </h2>
          <p className="text-neutral-500 leading-relaxed mb-8">
            Install the SDK in your React Native or Expo app and get full API
            observability in minutes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="#install"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors shadow-sm"
            >
              Install SDK
            </a>
            <a
              href="#report"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-neutral-700 text-sm font-medium rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors shadow-sm"
            >
              Upload Demo Report
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-neutral-200 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded bg-black flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </span>
          <span className="text-xs font-semibold text-neutral-600">APIWitness</span>
        </div>
        <p className="text-xs text-neutral-400">
          API observability for mobile apps. All data processed locally.
        </p>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main>
      <Nav />
      <Hero />
      <Problem />
      <Solution />
      <InstallSection />
      <ConfigSection />
      <Features />
      <ReportSection />
      <MarketSection />
      <FinalCTA />
      <Footer />
    </main>
  );
}
