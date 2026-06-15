"use client";

import React from "react";
import { motion } from "framer-motion";

const CONFIG_OPTIONS: {
  field: string;
  type: string;
  default: string;
  description: string;
}[] = [
  { field: "appName", type: "string", default: "—", description: "Name of the mobile app." },
  { field: "appVersion", type: "string", default: "—", description: "App version used for debugging reports." },
  { field: "environment", type: "string", default: "—", description: 'Current API environment: "development", "staging", "production".' },
  { field: "recordSuccessfulRequests", type: "boolean", default: "false", description: "Whether successful requests should also be recorded." },
  { field: "sensitiveFields", type: "string[]", default: '["password","token","apiKey",…]', description: "Request / response keys to mask before storing." },
  { field: "knownEndpoints", type: "string[]", default: "[]", description: "Known API paths for detecting new/undocumented endpoints." },
  { field: "knownDocsSpec", type: "Record<string,string>", default: "{}", description: "Known endpoints mapped to doc sources for undocumented detection." },
  { field: "dashboardUrl", type: "string", default: "undefined", description: "Optional URL for syncing captured data to a cloud dashboard." },
  { field: "enableChangeDetection", type: "boolean", default: "false", description: "Enables response shape comparison across app versions." },
  { field: "enableDocsGeneration", type: "boolean", default: "false", description: "Enables docs generation from captured API traffic." },
  { field: "enableBreadcrumbs", type: "boolean", default: "true", description: "Tracks user actions (taps, navigation, gestures) as context for API calls." },
  { field: "alertWebhookUrl", type: "string", default: "undefined", description: "Optional webhook URL for alert dispatch when thresholds are exceeded." },
  { field: "alertThreshold", type: "number", default: "3", description: "Number of failure occurrences within cooldown window before alert fires." },
  { field: "alertCooldownMs", type: "number", default: "60000", description: "Minimum ms between duplicate alerts to prevent spamming." },
  { field: "performanceBudgets", type: "PerformanceBudget[]", default: "[]", description: "Latency thresholds per endpoint pattern." },
];

export function ConfigSection() {
  return (
    <section id="docs" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 border border-neutral-200 rounded-full text-xs font-medium text-neutral-600 mb-4">
            Configuration
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900 mb-4">
            Fine-tune every{" "}
            <span className="text-neutral-400">detail</span>
          </h2>
          <p className="text-lg text-neutral-500 leading-relaxed">
            Configure what&apos;s captured, what&apos;s masked, and how data is synchronized.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto overflow-x-auto border border-neutral-200 rounded-xl shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left py-3 px-4 font-semibold text-neutral-700 text-xs">Option</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700 text-xs">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700 text-xs">Default</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700 text-xs">Description</th>
              </tr>
            </thead>
            <tbody>
              {CONFIG_OPTIONS.map((opt) => (
                <tr key={opt.field} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <td className="py-3 px-4">
                    <code className="text-xs font-mono text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">{opt.field}</code>
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
