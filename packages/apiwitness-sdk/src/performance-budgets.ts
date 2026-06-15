import { getAllLogs } from "./storage";
import { getConfig } from "./config";
import { ApiLog, PerformanceBudget } from "./types";

export type BudgetViolation = {
  budget: PerformanceBudget;
  log: ApiLog;
  actualMs: number;
  message: string;
};

export function checkPerformanceBudgets(): BudgetViolation[] {
  const cfg = getConfig();
  const budgets = cfg.performanceBudgets || [];
  if (budgets.length === 0) return [];

  const logs = getAllLogs();
  const violations: BudgetViolation[] = [];

  for (const log of logs) {
    for (const budget of budgets) {
      if (budget.maxDurationMs <= 0) continue;

      const methodMatch = budget.method
        ? log.method.toUpperCase() === budget.method.toUpperCase()
        : true;
      const endpointMatch = budget.endpoint
        ? log.url.includes(budget.endpoint)
        : true;

      if (methodMatch && endpointMatch && log.duration > budget.maxDurationMs) {
        violations.push({
          budget,
          log,
          actualMs: log.duration,
          message: `Performance budget exceeded: ${log.method} ${log.url} took ${log.duration}ms (budget: ${budget.maxDurationMs}ms)`,
        });
      }
    }
  }

  return violations;
}

export function getLatencyStats(): Record<string, { avg: number; p95: number; max: number; count: number }> {
  const logs = getAllLogs();
  const grouped = new Map<string, number[]>();

  for (const log of logs) {
    const key = `${log.method}:${log.url}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(log.duration);
  }

  const stats: Record<string, any> = {};
  for (const [key, durations] of grouped) {
    const sorted = [...durations].sort((a, b) => a - b);
    const avg = Math.round(sorted.reduce((s, d) => s + d, 0) / sorted.length);
    const p95 = sorted[Math.floor(sorted.length * 0.95)] || sorted[sorted.length - 1];
    const max = sorted[sorted.length - 1];
    stats[key] = { avg, p95, max, count: sorted.length };
  }

  return stats;
}
