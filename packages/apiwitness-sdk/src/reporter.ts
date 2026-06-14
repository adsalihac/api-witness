import { FailureReport } from "./types";
import { getConfig } from "./config";
import { getAllLogs, getFailedLogs, getLogCount } from "./storage";
import { generateId, getTimestamp } from "./helpers";

export function exportFailureReport(): FailureReport {
  const cfg = getConfig();
  const { total, failed } = getLogCount();

  return {
    reportId: generateId(),
    appName: cfg.appName,
    appVersion: cfg.appVersion,
    environment: cfg.environment,
    generatedAt: getTimestamp(),
    totalRequests: total,
    failedRequests: failed,
    failures: getFailedLogs(),
  };
}

export function generateMarkdownReport(): string {
  const report = exportFailureReport();

  let md = `# API Failure Report\n\n`;
  md += `**App:** ${report.appName} v${report.appVersion}\n`;
  md += `**Environment:** ${report.environment}\n`;
  md += `**Generated:** ${report.generatedAt}\n`;
  md += `**Total Requests:** ${report.totalRequests}\n`;
  md += `**Failed Requests:** ${report.failedRequests}\n\n`;

  if (report.failures.length === 0) {
    md += `_No failures recorded._\n`;
    return md;
  }

  report.failures.forEach((fail, index) => {
    md += `---\n\n`;
    md += `## Failure ${index + 1}: ${fail.method} ${fail.url}\n\n`;
    md += `**Status:** ${fail.status || "Network Error"}\n`;
    md += `**Duration:** ${fail.duration}ms\n`;
    md += `**Timestamp:** ${fail.timestamp}\n\n`;

    if (fail.errorMessage) {
      md += `**Error:** ${fail.errorMessage}\n\n`;
    }

    if (fail.requestBody) {
      md += `**Request Body:**\n\`\`\`json\n${JSON.stringify(fail.requestBody, null, 2)}\n\`\`\`\n\n`;
    }

    if (fail.responseBody) {
      md += `**Response Body:**\n\`\`\`json\n${JSON.stringify(fail.responseBody, null, 2)}\n\`\`\`\n\n`;
    }
  });

  return md;
}

export function exportSanitizedJSON(): string {
  const report = exportFailureReport();
  return JSON.stringify(report, null, 2);
}
