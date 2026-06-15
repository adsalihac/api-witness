import { Breadcrumb } from "./types";
import { getTimestamp } from "./helpers";
import { getConfig } from "./config";

let breadcrumbs: Breadcrumb[] = [];
const MAX_BREADCRUMBS = 200;

export function addBreadcrumb(
  type: Breadcrumb["type"],
  label: string,
  data?: Record<string, any>
): void {
  if (!getConfig().enableBreadcrumbs) return;

  breadcrumbs.push({ type, label, data, timestamp: getTimestamp() });
  if (breadcrumbs.length > MAX_BREADCRUMBS) {
    breadcrumbs = breadcrumbs.slice(-MAX_BREADCRUMBS);
  }
}

export function getBreadcrumbs(): Breadcrumb[] {
  return [...breadcrumbs];
}

export function clearBreadcrumbs(): void {
  breadcrumbs = [];
}

export function getRecentBreadcrumbs(count = 20): Breadcrumb[] {
  return breadcrumbs.slice(-count);
}

export function attachBreadcrumbsToLog(): Breadcrumb[] | undefined {
  if (!getConfig().enableBreadcrumbs) return undefined;
  const recent = getRecentBreadcrumbs(10);
  return recent.length > 0 ? recent : undefined;
}
