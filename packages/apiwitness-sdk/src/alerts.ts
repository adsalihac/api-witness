import { getConfig } from "./config";
import { getAllLogs } from "./storage";
import { AlertEvent } from "./types";
import { getTimestamp, generateId } from "./helpers";
import { getErrorGroups } from "./error-grouping";
import { getDetectedEndpoints, getNewEndpoints } from "./endpoints";
import { checkPerformanceBudgets } from "./performance-budgets";

let lastAlertTime = 0;
const alertHistory: AlertEvent[] = [];

export function getAlertHistory(): AlertEvent[] {
  return [...alertHistory];
}

function shouldThrottle(): boolean {
  const cfg = getConfig();
  const cooldown = cfg.alertCooldownMs || 60000;
  const now = Date.now();
  if (now - lastAlertTime < cooldown) return true;
  lastAlertTime = now;
  return false;
}

export function evaluateAlerts(): AlertEvent[] {
  const cfg = getConfig();
  const newAlerts: AlertEvent[] = [];

  if (!cfg.alertWebhookUrl) return [];

  if (shouldThrottle()) return [];

  const logs = getAllLogs();
  const failures = logs.filter((l) => !l.success);
  const threshold = cfg.alertThreshold ?? 3;

  if (failures.length >= threshold) {
    newAlerts.push({
      type: "failure_spike",
      message: `Failure spike detected: ${failures.length} failures out of ${logs.length} requests`,
      timestamp: getTimestamp(),
      data: { totalFailures: failures.length, totalRequests: logs.length },
    });
  }

  const groups = getErrorGroups();
  for (const group of groups.slice(0, 3)) {
    if (group.count >= threshold) {
      newAlerts.push({
        type: "failure_spike",
        message: `Repeating error: "${group.label}" occurred ${group.count} times`,
        timestamp: getTimestamp(),
        data: { group },
      });
    }
  }

  const budgets = checkPerformanceBudgets();
  for (const b of budgets) {
    newAlerts.push({
      type: "budget_violation",
      message: b.message,
      timestamp: getTimestamp(),
      data: b,
    });
  }

  const newEndpoints = getNewEndpoints();
  for (const ep of newEndpoints.slice(0, 5)) {
    newAlerts.push({
      type: "new_endpoint",
      message: `New endpoint detected: ${ep.method} ${ep.path}`,
      timestamp: getTimestamp(),
      data: ep,
    });
  }

  for (const alert of newAlerts) {
    alertHistory.push(alert);
    dispatchWebhook(alert);
  }

  return newAlerts;
}

async function dispatchWebhook(alert: AlertEvent): Promise<void> {
  const cfg = getConfig();
  if (!cfg.alertWebhookUrl) return;

  try {
    await fetch(cfg.alertWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "apiwitness_alert",
        app: cfg.appName,
        environment: cfg.environment,
        alert,
      }),
    });
  } catch {}
}
