export { type ApiLog, type FailureReport, type APIWitnessConfig } from "./types";

import { setConfig } from "./config";
import { setupFetchWitness } from "./fetch-witness";
import { setupAxiosWitness } from "./axios-witness";
import { getAllLogs, getFailedLogs, clearAllLogs, loadPersistedLogs } from "./storage";
import {
  exportFailureReport,
  generateMarkdownReport,
  exportSanitizedJSON,
} from "./reporter";
import { saveReportToFile, saveReportToDirectory, shareReport } from "./exporter";
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
};
