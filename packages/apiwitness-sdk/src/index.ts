export {
  type ApiLog,
  type FailureReport,
  type APIWitnessConfig,
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
import { APIWitnessConfig } from "./types";

export async function startAPIWitness(config: APIWitnessConfig): Promise<void> {
  setConfig(config);
  await loadPersistedLogs();
  setupFetchWitness();
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
};
