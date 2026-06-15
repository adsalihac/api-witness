"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Bug,
  GitCompare,
  Radio,
  FileJson,
  FileDown,
  BookOpen,
  Code,
  Smartphone,
} from "lucide-react";

const features = [
  {
    icon: Bug,
    title: "API Failure Detection",
    desc: "Every failed request is captured with full context — status code, payload, headers, timing, and error message.",
    gradient: "from-red-500/10 to-red-500/5",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
  {
    icon: GitCompare,
    title: "Response Change Tracking",
    desc: "Detects added, removed, or modified fields in API responses between app versions automatically.",
    gradient: "from-amber-500/10 to-amber-500/5",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    icon: Radio,
    title: "New Endpoint Discovery",
    desc: "Automatically identifies API endpoints your app calls that have no matching documentation.",
    gradient: "from-blue-500/10 to-blue-500/5",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    icon: FileJson,
    title: "OpenAPI Generation",
    desc: "Auto-generated OpenAPI 3.0 specifications from real mobile app traffic — no manual spec writing.",
    gradient: "from-emerald-500/10 to-emerald-500/5",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    icon: FileDown,
    title: "Postman Export",
    desc: "One-click export of captured endpoints as a Postman collection for further testing and handover.",
    gradient: "from-orange-500/10 to-orange-500/5",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    icon: BookOpen,
    title: "Documentation Generation",
    desc: "Generate readable Markdown documentation from captured API usage for your team wiki or README.",
    gradient: "from-violet-500/10 to-violet-500/5",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
  },
  {
    icon: Code,
    title: "Payload Comparison",
    desc: "Side-by-side diff of request and response payloads across versions to surface breaking changes.",
    gradient: "from-cyan-500/10 to-cyan-500/5",
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
  },
  {
    icon: Smartphone,
    title: "Mobile API Observability",
    desc: "Purpose-built for React Native and Expo. Works with fetch and Axios out of the box.",
    gradient: "from-brand-500/10 to-brand-500/5",
    iconBg: "bg-brand-100",
    iconColor: "text-brand-600",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 border border-neutral-200 rounded-full text-xs font-medium text-neutral-600 mb-4">
            Features
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900 mb-4">
            From raw API traffic to{" "}
            <span className="text-neutral-400">engineering insight</span>
          </h2>
          <p className="text-lg text-neutral-500 leading-relaxed">
            Every captured request is analyzed and categorized. No more digging
            through raw logs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group relative"
            >
              <div className={`absolute -inset-0.5 bg-gradient-to-br ${feature.gradient} rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm group-hover:shadow-md group-hover:border-neutral-300 transition-all duration-300">
                <div className={`w-10 h-10 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-5 h-5 ${feature.iconColor}`} />
                </div>
                <h3 className="text-base font-semibold text-neutral-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
