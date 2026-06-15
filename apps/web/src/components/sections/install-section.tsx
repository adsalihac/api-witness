"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CodeBlock } from "@/components/ui/code-block";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const packageManagers = ["npm", "pnpm", "yarn"] as const;
type PM = (typeof packageManagers)[number];

const installCommands: Record<PM, string> = {
  npm: "npx expo install @apiwitness/sdk",
  pnpm: "pnpm add @apiwitness/sdk",
  yarn: "yarn add @apiwitness/sdk",
};

const codeExample = `import { useEffect } from "react";
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
      recordSuccessfulRequests: true,
      sensitiveFields: [
        "password",
        "token",
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
}`;

const highlights = [
  { title: "startAPIWitness()", desc: "Enables automatic fetch recording and log persistence." },
  { title: "setupAxiosWitness()", desc: "Optional — adds Axios interceptor for request capture." },
  { title: "Sensitive Fields", desc: "Keys are masked before logs are stored locally." },
];

export function InstallSection() {
  const [pm, setPm] = useState<PM>("npm");

  return (
    <section id="install" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-neutral-50/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 border border-neutral-200 rounded-full text-xs font-medium text-neutral-600 mb-4">
            Installation
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900 mb-4">
            Install in{" "}
            <span className="text-neutral-400">under a minute</span>
          </h2>
          <p className="text-lg text-neutral-500 leading-relaxed">
            Add one dependency, call one function. No build tool changes, no
            native module linking.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Package manager tabs + install command */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-4">
              {packageManagers.map((m) => (
                <button
                  key={m}
                  onClick={() => setPm(m)}
                  className={cn(
                    "px-3.5 py-2 text-xs font-medium rounded-lg transition-all",
                    pm === m
                      ? "bg-neutral-900 text-white shadow-sm"
                      : "bg-white text-neutral-500 border border-neutral-200 hover:border-neutral-300"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>

            <CodeBlock
              code={installCommands[pm]}
              filename="terminal"
              terminal
              typing
              key={`terminal-${pm}`}
            />
          </motion.div>

          {/* Code example */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <CodeBlock
              code={codeExample}
              filename="app/_layout.tsx"
              highlight
            />
          </motion.div>

          {/* Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {highlights.map((item) => (
              <div key={item.title} className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
                <p className="text-sm font-semibold text-neutral-900 mb-1">{item.title}</p>
                <p className="text-xs text-neutral-500">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
