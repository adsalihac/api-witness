"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Cpu, Terminal, Code2, ArrowLeft, FileJson, Beaker
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { OpenApiInput } from "@/components/playground/openapi-input";
import { InteractiveDocs } from "@/components/playground/interactive-docs";
import { MockApi } from "@/components/playground/mock-api";
import { TestingInterface } from "@/components/playground/testing-interface";
import { SdkSnippets } from "@/components/playground/sdk-snippets";
import type { OpenApiDoc } from "@/components/playground/openapi-input";

type Tab = "docs" | "mock" | "test" | "snippets";

const TABS: { id: Tab; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "docs", label: "Interactive Docs", icon: BookOpen, desc: "Browse endpoints with schemas" },
  { id: "mock", label: "Mock APIs", icon: Cpu, desc: "Generate mock responses" },
  { id: "test", label: "Testing Interface", icon: Terminal, desc: "Send live requests" },
  { id: "snippets", label: "SDK Snippets", icon: Code2, desc: "Generate client code" },
];

function PlaygroundHeader() {
  return (
    <header className="border-b border-neutral-200 bg-white/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </a>
            <span className="w-px h-5 bg-neutral-200" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Beaker className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <span className="font-semibold text-sm text-neutral-900">API Playground</span>
            </div>
          </div>
          <a href="/" className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors font-medium">
            APIWitness
          </a>
        </div>
      </div>
    </header>
  );
}

export default function PlaygroundPage() {
  const [spec, setSpec] = useState<OpenApiDoc | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("docs");

  const endpointCount = useMemo(() => {
    if (!spec?.paths) return 0;
    let count = 0;
    for (const pathItem of Object.values(spec.paths)) {
      if (pathItem) {
        for (const method of Object.keys(pathItem)) {
          if (["get", "post", "put", "patch", "delete", "options", "head"].includes(method)) {
            count++;
          }
        }
      }
    }
    return count;
  }, [spec]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <PlaygroundHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Spec Input Section */}
        <div className="mb-8">
          <OpenApiInput onSpecParsed={setSpec} parsed={spec} />
        </div>

        {/* Tools Section */}
        {spec && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Spec summary bar */}
            <div className="flex items-center gap-4 mb-6 px-1">
              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <FileJson className="w-3.5 h-3.5" />
                <span className="font-medium">{spec.info?.title || "Untitled"}</span>
                {spec.info?.version && <span className="text-neutral-400">v{spec.info.version}</span>}
              </div>
              <span className="w-px h-4 bg-neutral-200" />
              <span className="text-xs text-neutral-400">{endpointCount} endpoints</span>
              {spec.servers?.[0] && (
                <>
                  <span className="w-px h-4 bg-neutral-200 hidden sm:block" />
                  <span className="text-xs text-neutral-400 font-mono hidden sm:block truncate max-w-[200px]">
                    {spec.servers[0].url}
                  </span>
                </>
              )}
            </div>

            {/* Tab bar */}
            <div className="flex flex-wrap gap-1 mb-8 p-1 bg-white border border-neutral-200 rounded-xl">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 sm:flex-none",
                      activeTab === tab.id
                        ? "bg-neutral-900 text-white shadow-sm"
                        : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "docs" && <InteractiveDocs spec={spec} />}
                {activeTab === "mock" && <MockApi spec={spec} />}
                {activeTab === "test" && <TestingInterface spec={spec} />}
                {activeTab === "snippets" && <SdkSnippets spec={spec} />}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty state (no spec) */}
        {!spec && (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
              <Beaker className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-700 mb-1">
              Paste or upload an OpenAPI spec to get started
            </h3>
            <p className="text-sm text-neutral-400 max-w-md mx-auto">
              Generate interactive docs, mock APIs, a live testing interface, and SDK code snippets — all from a single spec.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto mt-8">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <div key={tab.id} className="text-center p-3 rounded-xl bg-white border border-neutral-200">
                    <Icon className="w-5 h-5 text-neutral-400 mx-auto mb-1.5" />
                    <p className="text-xs font-medium text-neutral-600">{tab.label}</p>
                    <p className="text-[0.6rem] text-neutral-400 mt-0.5">{tab.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <p className="text-xs text-neutral-400">API Playground &mdash; part of APIWitness</p>
          <a href="/" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Back to APIWitness</a>
        </div>
      </footer>
    </div>
  );
}
