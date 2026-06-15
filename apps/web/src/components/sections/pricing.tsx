"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Open Source",
    price: "$0",
    description: "Self-hosted. Full SDK features. Perfect for indie developers and small teams.",
    features: [
      "All SDK features",
      "Local data storage",
      "JSON/OpenAPI/Postman export",
      "Community support",
      "MIT License",
    ],
    cta: "Get Started",
    href: "#install",
    popular: false,
  },
  {
    name: "Team",
    price: "$29",
    period: "/month",
    description: "Cloud dashboard with collaboration. For teams shipping mobile apps weekly.",
    features: [
      "Everything in Open Source",
      "Cloud dashboard",
      "Team collaboration",
      "Alert webhooks",
      "Slack / Discord integration",
      "Email support",
    ],
    cta: "Coming Soon",
    href: "#",
    popular: true,
    disabled: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Dedicated support, SLAs, on-premise deployment, and custom integrations.",
    features: [
      "Everything in Team",
      "On-premise deployment",
      "SSO / SAML",
      "Custom integrations",
      "Dedicated support",
      "SLA guarantees",
    ],
    cta: "Contact Us",
    href: "#",
    popular: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-neutral-50/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 border border-neutral-200 rounded-full text-xs font-medium text-neutral-600 mb-4">
            Pricing
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900 mb-4">
            Simple, transparent{" "}
            <span className="text-neutral-400">pricing</span>
          </h2>
          <p className="text-lg text-neutral-500 leading-relaxed">
            Start free. Scale as your team grows.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`relative bg-white border rounded-2xl p-6 sm:p-8 shadow-sm transition-all duration-300 ${
                plan.popular
                  ? "border-brand-200 ring-2 ring-brand-500/20 shadow-lg scale-[1.02] md:scale-105"
                  : "border-neutral-200 hover:shadow-md hover:border-neutral-300"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center px-3 py-1 bg-brand-600 text-white text-xs font-semibold rounded-full shadow-sm">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-bold text-neutral-900">{plan.price}</span>
                  {plan.period && (
                    <span className="text-sm text-neutral-400">{plan.period}</span>
                  )}
                </div>
                <p className="text-sm text-neutral-500">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-neutral-600">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {plan.disabled ? (
                <Button className="w-full" variant="secondary" disabled>
                  {plan.cta}
                </Button>
              ) : (
                <a href={plan.href}>
                  <Button className="w-full" variant={plan.popular ? "primary" : "secondary"}>
                    {plan.cta}
                    {plan.name === "Open Source" && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    )}
                    {plan.name === "Enterprise" && <ArrowRight className="w-4 h-4" />}
                  </Button>
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
