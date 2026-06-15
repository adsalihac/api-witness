"use client";

import React from "react";
import { motion } from "framer-motion";
import { Package, Smartphone, Activity, Search, FileText } from "lucide-react";

const steps = [
  { icon: Package, title: "Install SDK", desc: "Add one dependency, call one function. No build tool changes." },
  { icon: Smartphone, title: "Use App", desc: "Every API call is automatically captured — fetch and Axios." },
  { icon: Activity, title: "Capture Traffic", desc: "Full payloads, headers, status codes, and timing recorded." },
  { icon: Search, title: "Detect Issues", desc: "Failures, response shape changes, and undocumented endpoints flagged." },
  { icon: FileText, title: "Generate Reports", desc: "Export as Postman, OpenAPI, Markdown docs, or JSON." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 border border-neutral-200 rounded-full text-xs font-medium text-neutral-600 mb-4">
            How It Works
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900 mb-4">
            From zero to API observability{" "}
            <span className="text-neutral-400">in minutes</span>
          </h2>
          <p className="text-lg text-neutral-500 leading-relaxed">
            Install the SDK once. Every API call is recorded, analyzed, and ready
            for debugging — without changing your workflow.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
          {/* Pipeline connector line */}
          <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-brand-200 via-brand-400 to-brand-200" />

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center mb-5 relative z-10 shadow-sm">
                <step.icon className="w-7 h-7 text-brand-600" />
              </div>
              <span className="text-xs font-bold text-brand-500 tracking-widest mb-2">Step {i + 1}</span>
              <h3 className="text-sm font-semibold text-neutral-900 mb-2">{step.title}</h3>
              <p className="text-xs text-neutral-500 leading-relaxed max-w-[200px]">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
