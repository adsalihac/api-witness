"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Smartphone, Download, Activity, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const stats = [
  { label: "Failed Requests", value: 12, accent: true },
  { label: "Changed Responses", value: 4, accent: "amber" },
  { label: "New Endpoints", value: 8, accent: "blue" },
  { label: "Missing Docs", value: 6, accent: "violet" },
] as const;

const endpoints = [
  { method: "POST", path: "/auth/login", status: 401, badge: "Failed" as const },
  { method: "GET", path: "/profile", status: 200, badge: "Healthy" as const },
  { method: "POST", path: "/orders", status: 422, badge: "Changed" as const },
  { method: "GET", path: "/courses", status: 200, badge: "Healthy" as const },
];

const badgeStyles: Record<string, string> = {
  Failed: "bg-red-100 text-red-700 border-red-200",
  Changed: "bg-amber-100 text-amber-700 border-amber-200",
  New: "bg-blue-100 text-blue-700 border-blue-200",
  Healthy: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const trustItems = [
  { icon: Smartphone, label: "Expo" },
  { icon: Activity, label: "React Native" },
  { icon: Shield, label: "Axios" },
  { icon: Download, label: "Fetch" },
];

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    const duration = 1500;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);
  return <>{count}{suffix}</>;
}

export function Hero() {
  return (
    <section className="relative pt-28 pb-24 sm:pt-36 sm:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-50/40 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-brand-100/30 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-50 border border-brand-200 rounded-full text-sm font-medium text-brand-700 mb-8">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse-dot" />
              API Observability for Mobile Apps
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-900 leading-[1.04] mb-6"
          >
            The Witness For{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-500">
              Every API Failure
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-neutral-500 leading-relaxed max-w-2xl mx-auto mb-8"
          >
            Record real API traffic from React Native and Expo apps, detect failures,
            track response changes, and generate developer-ready reports automatically.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-10"
          >
            <a href="#install">
              <Button size="lg">
                Install SDK
                <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
            <a href="#report">
              <Button variant="secondary" size="lg">
                View Demo
              </Button>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-6"
          >
            {trustItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm text-neutral-400">
                <item.icon className="w-4 h-4 text-neutral-300" />
                <span>{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Interactive Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-500/10 via-transparent to-brand-500/10 rounded-3xl blur-xl" />
            <div className="relative bg-white border border-neutral-200 rounded-2xl shadow-xl overflow-hidden">
              {/* Window chrome */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-neutral-100 bg-neutral-50/50">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs text-neutral-400 font-mono">apiwitness-dashboard</span>
              </div>

              <div className="p-6 sm:p-8">
                {/* Summary cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {stats.map((s) => (
                    <div key={s.label} className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                      <p className={`text-2xl font-bold ${
                        s.accent === true ? "text-red-600" :
                        s.accent === "amber" ? "text-amber-600" :
                        s.accent === "blue" ? "text-blue-600" :
                        s.accent === "violet" ? "text-violet-600" :
                        "text-neutral-900"
                      }`}>
                        <AnimatedCounter value={s.value} />
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Endpoint table */}
                <div className="space-y-2">
                  {endpoints.map((ep) => (
                    <div key={ep.path} className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-neutral-50 transition-colors">
                      <Badge variant={ep.method.toLowerCase() as any}>{ep.method}</Badge>
                      <span className="flex-1 text-sm font-mono text-neutral-700">{ep.path}</span>
                      <span className={`text-xs font-medium ${ep.status >= 400 ? "text-red-600" : "text-emerald-600"}`}>
                        {ep.status}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[0.65rem] font-medium border ${badgeStyles[ep.badge]}`}>
                        {ep.badge}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Export tags */}
                <div className="flex gap-2 mt-5 pt-4 border-t border-neutral-100">
                  <span className="px-3 py-1 text-xs font-medium bg-neutral-100 text-neutral-600 rounded-md">Postman Export</span>
                  <span className="px-3 py-1 text-xs font-medium bg-neutral-100 text-neutral-600 rounded-md">OpenAPI Export</span>
                  <span className="px-3 py-1 text-xs font-medium bg-neutral-100 text-neutral-600 rounded-md">Markdown Docs</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
