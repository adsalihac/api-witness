"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, HelpCircle, Zap } from "lucide-react";

const qaReports = [
  "Login is not working",
  "Course list is empty",
  "Payment failed",
  "Profile update is broken",
];

const devQuestions = [
  "Which API endpoint failed?",
  "What request payload was sent?",
  "What response came back?",
  "Which app version?",
  "Which environment?",
  "Did the API response shape change?",
];

export function Problem() {
  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-neutral-50/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 border border-neutral-200 rounded-full text-xs font-medium text-neutral-600 mb-4">
            The Problem
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900 mb-4">
            Mobile API bugs are{" "}
            <span className="text-neutral-400">impossible to reproduce</span>
          </h2>
          <p className="text-lg text-neutral-500 leading-relaxed max-w-2xl mx-auto">
            QA reports vague symptoms. Developers waste hours trying to reconstruct
            what actually happened.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* QA Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/10 to-red-500/5 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-white border border-red-200/60 rounded-2xl p-6 sm:p-8 shadow-sm group-hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-red-100">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </span>
                <div>
                  <p className="text-base font-semibold text-neutral-900">What QA reports</p>
                  <p className="text-sm text-neutral-400">Vague, hard to reproduce</p>
                </div>
              </div>
              <div className="space-y-3">
                {qaReports.map((msg) => (
                  <div key={msg} className="flex items-center gap-3 px-4 py-3 bg-red-50/80 border border-red-100 rounded-xl">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-200 text-xs font-bold text-red-600">!</span>
                    <span className="text-sm text-red-800">&ldquo;{msg}&rdquo;</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Developer Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-blue-500/5 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-white border border-blue-200/60 rounded-2xl p-6 sm:p-8 shadow-sm group-hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-blue-100">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                </span>
                <div>
                  <p className="text-base font-semibold text-neutral-900">What developers need</p>
                  <p className="text-sm text-neutral-400">Specific, actionable data</p>
                </div>
              </div>
              <ul className="space-y-3">
                {devQuestions.map((q) => (
                  <li key={q} className="flex items-center gap-3 px-4 py-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-200 text-xs font-bold text-blue-600">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-sm text-neutral-700">{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Resolution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mt-12"
        >
          <div className="inline-flex items-center gap-2 px-5 py-3 bg-brand-50 border border-brand-200 rounded-xl">
            <Zap className="w-5 h-5 text-brand-600" />
            <span className="text-sm font-semibold text-brand-700">APIWitness already knows.</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
