"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Smartphone, FileJson, FileDown, BookOpen } from "lucide-react";

const pipelineSteps = [
  { icon: Smartphone, label: "App Traffic", color: "bg-brand-100 text-brand-600" },
  { icon: FileJson, label: "OpenAPI Spec", color: "bg-emerald-100 text-emerald-600" },
  { icon: FileDown, label: "Postman Collection", color: "bg-orange-100 text-orange-600" },
  { icon: BookOpen, label: "Markdown Docs", color: "bg-violet-100 text-violet-600" },
];

export function DocsGeneration() {
  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 border border-neutral-200 rounded-full text-xs font-medium text-neutral-600 mb-4">
            Documentation
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900 mb-4">
            From app traffic to{" "}
            <span className="text-neutral-400">production docs</span>
          </h2>
          <p className="text-lg text-neutral-500 leading-relaxed">
            API documentation that stays in sync with your mobile app — automatically
            generated from real usage.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="relative flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-0">
            {pipelineSteps.map((step, i) => (
              <React.Fragment key={step.label}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: i * 0.15 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center shadow-sm border border-current/20`}>
                    <step.icon className="w-7 h-7" />
                  </div>
                  <span className="text-sm font-medium text-neutral-700">{step.label}</span>
                </motion.div>
                {i < pipelineSteps.length - 1 && (
                  <div className="hidden sm:flex items-center justify-center w-12 h-12">
                    <ArrowRight className="w-5 h-5 text-neutral-300" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-5xl mx-auto mt-16 grid grid-cols-1 sm:grid-cols-3 gap-5"
        >
          {[
            {
              title: "OpenAPI 3.0",
              desc: "Standard spec generated from real traffic with inferred schemas, parameters, and response types.",
              color: "text-emerald-600",
              bg: "bg-emerald-50 border-emerald-200",
            },
            {
              title: "Postman Collections",
              desc: "Ready-to-import collections with all captured endpoints, methods, and example payloads.",
              color: "text-orange-600",
              bg: "bg-orange-50 border-orange-200",
            },
            {
              title: "Markdown Docs",
              desc: "Readable documentation with endpoints, response shapes, version diffs, and timeline data.",
              color: "text-violet-600",
              bg: "bg-violet-50 border-violet-200",
            },
          ].map((doc) => (
            <div key={doc.title} className={`${doc.bg} border rounded-2xl p-6 shadow-sm`}>
              <h3 className={`text-base font-semibold ${doc.color} mb-2`}>{doc.title}</h3>
              <p className="text-sm text-neutral-600">{doc.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
