"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowDown, Plus, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ChangeDetection() {
  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-neutral-50/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 border border-red-200 rounded-full text-xs font-medium text-red-700 mb-4">
            Breaking Changes
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900 mb-4">
            Detect Breaking API Changes{" "}
            <span className="text-neutral-400">Before Users Do</span>
          </h2>
          <p className="text-lg text-neutral-500 leading-relaxed">
            One field rename in an API response can crash your mobile app.
            APIWitness catches it before it reaches production.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Yesterday's response */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-neutral-100">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Yesterday</span>
                <Badge variant="success">v2.3.0</Badge>
              </div>
              <pre className="bg-neutral-50 rounded-xl p-4 text-sm font-mono text-neutral-700 leading-relaxed overflow-x-auto">
{`{
  "name": "Ahmed",
  "email": "test@test.com"
}`}
              </pre>
            </motion.div>

            {/* Today's response */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-neutral-100">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Today</span>
                <Badge variant="danger">v2.4.0</Badge>
              </div>
              <pre className="bg-neutral-50 rounded-xl p-4 text-sm font-mono text-neutral-700 leading-relaxed overflow-x-auto">
{`{
  "fullName": "Ahmed",
  "email": "test@test.com"
}`}
              </pre>
            </motion.div>
          </div>

          {/* Diff output */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">APIWitness Output</span>
                <Badge variant="warning">Shape Change Detected</Badge>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <Minus className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <span className="text-xs font-mono font-semibold text-red-700">Removed</span>
                  <p className="text-sm font-mono text-red-800"><span className="line-through">name</span></p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <span className="text-xs font-mono font-semibold text-emerald-700">Added</span>
                  <p className="text-sm font-mono text-emerald-800">fullName</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
