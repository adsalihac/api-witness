export {
  type ApiLog,
  type FailureReport,
  type APIWitnessConfig,
  type Breadcrumb,
  type ErrorGroup,
  type ReleaseComparison,
  type AlertEvent,
  type PerformanceBudget,
  type OfflineQueueItem,
  type EndpointInfo,
  type ShapeNode,
  type ShapeDiff,
  type VersionShape,
  type TimelineEntry,
  type PostmanCollection,
  type PostmanItem,
  type OpenAPISpec,
} from "./types";

import { setConfig } from "./config";
import { setupFetchWitness } from "./fetch-witness";
import { setupAxiosWitness } from "./axios-witness";
import { getAllLogs, getFailedLogs, clearAllLogs, loadPersistedLogs } from "./storage";
import {
  exportFailureReport,
  generateMarkdownReport,
  exportSanitizedJSON,
} from "./reporter";
import {
  saveReportToFile,
  saveReportToDirectory,
  shareReport,
  savePostmanCollection,
  sharePostmanCollection,
  saveOpenAPISpec,
  shareOpenAPISpec,
  saveApiDocsMarkdown,
  shareApiDocsMarkdown,
} from "./exporter";
import {
  getDetectedEndpoints,
  getNewEndpoints,
  getUndocumentedEndpoints,
} from "./endpoints";
import {
  getVersionShapes,
  getShapeDiffs,
} from "./shape-diff";
import {
  getTimeline,
} from "./timeline";
import {
  exportPostmanCollection,
} from "./postman";
import {
  generateOpenAPISpec,
} from "./openapi";
import {
  generateApiDocs,
} from "./docs-export";
import {
  addBreadcrumb,
  getBreadcrumbs,
  clearBreadcrumbs,
} from "./breadcrumbs";
import {
  getErrorGroups,
  getAISummary,
} from "./error-grouping";
import {
  evaluateAlerts,
  getAlertHistory,
} from "./alerts";
import {
  checkPerformanceBudgets,
  getLatencyStats,
} from "./performance-budgets";
export type { BudgetViolation } from "./performance-budgets";
import {
  enqueue,
  getQueuedItems,
  clearQueue,
  setupOfflineQueue,
} from "./offline-queue";
import {
  compareVersions,
} from "./release-comparison";
import { APIWitnessConfig } from "./types";

export async function startAPIWitness(config: APIWitnessConfig): Promise<void> {
  setConfig(config);
  await loadPersistedLogs();
  setupFetchWitness();
  setupOfflineQueue();
}

export {
  setupAxiosWitness,
  getAllLogs as getApiLogs,
  getFailedLogs as getFailedApiLogs,
  clearAllLogs as clearLogs,
  exportFailureReport,
  generateMarkdownReport,
  exportSanitizedJSON,
  saveReportToFile,
  saveReportToDirectory,
  shareReport,
  savePostmanCollection,
  sharePostmanCollection,
  saveOpenAPISpec,
  shareOpenAPISpec,
  saveApiDocsMarkdown,
  shareApiDocsMarkdown,
  getDetectedEndpoints,
  getNewEndpoints,
  getUndocumentedEndpoints,
  getVersionShapes,
  getShapeDiffs,
  getTimeline,
  exportPostmanCollection,
  generateOpenAPISpec,
  generateApiDocs,
  addBreadcrumb,
  getBreadcrumbs,
  clearBreadcrumbs,
  getErrorGroups,
  getAISummary,
  evaluateAlerts,
  getAlertHistory,
  checkPerformanceBudgets,
  getLatencyStats,
  enqueue,
  getQueuedItems,
  clearQueue,
  compareVersions,
};
