import { getAllLogs, getFailedLogs } from "./storage";
import { getConfig } from "./config";
import { getDetectedEndpoints } from "./endpoints";
import { getVersionShapes, getShapeDiffs } from "./shape-diff";
import { getTimeline } from "./timeline";

export function generateApiDocs(): string {
  const cfg = getConfig();
  const logs = getAllLogs();
  const endpoints = getDetectedEndpoints();
  const shapes = getVersionShapes();
  const diffs = getShapeDiffs();
  const timeline = getTimeline("hour");

  let md = `# ${cfg.appName} API Documentation\n\n`;
  md += `> Auto-generated from real mobile app traffic\n\n`;
  md += `**App:** ${cfg.appName} v${cfg.appVersion}\n`;
  md += `**Environment:** ${cfg.environment}\n`;
  md += `**Generated:** ${new Date().toISOString()}\n`;
  md += `**Total Requests:** ${logs.length}\n`;
  md += `**Unique Endpoints:** ${endpoints.length}\n\n`;

  md += `---\n\n`;
  md += `## Endpoints\n\n`;
  md += `| Method | Path | Requests | Status Codes |\n`;
  md += `|--------|------|----------|-------------|\n`;

  for (const ep of endpoints) {
    md += `| ${ep.method} | \`${ep.path}\` | ${ep.count} | ${ep.statusCodes.join(", ")} |\n`;
  }

  md += `\n---\n\n`;
  md += `## Request Details\n\n`;

  const seen = new Set<string>();
  for (const log of logs) {
    const key = `${log.method}:${log.url}`;
    if (seen.has(key)) continue;
    seen.add(key);

    md += `### ${log.method} \`${log.url}\`\n\n`;
    md += `**Status:** ${log.status}\n`;
    md += `**Duration:** ${log.duration}ms\n`;
    md += `**Timestamp:** ${log.timestamp}\n\n`;

    if (log.requestHeaders && Object.keys(log.requestHeaders).length > 0) {
      md += `**Request Headers:**\n\`\`\`json\n${JSON.stringify(log.requestHeaders, null, 2)}\n\`\`\`\n\n`;
    }

    if (log.requestBody) {
      md += `**Request Body:**\n\`\`\`json\n${JSON.stringify(log.requestBody, null, 2)}\n\`\`\`\n\n`;
    }

    if (log.responseBody) {
      md += `**Response Body:**\n\`\`\`json\n${JSON.stringify(log.responseBody, null, 2)}\n\`\`\`\n\n`;
    }
  }

  if (shapes.length > 0) {
    md += `---\n\n`;
    md += `## Response Shapes\n\n`;

    const latest = shapes[shapes.length - 1];
    md += `**Version:** ${latest.version}\n\n`;

    for (const [key, shape] of Object.entries(latest.shapes)) {
      md += `### \`${key}\`\n\n`;
      md += `\`\`\`json\n${JSON.stringify(shape, null, 2)}\n\`\`\`\n\n`;
    }

    if (Object.keys(diffs).length > 0) {
      md += `### Shape Changes\n\n`;
      for (const [key, diff] of Object.entries(diffs)) {
        if (diff.added.length > 0 || diff.removed.length > 0) {
          md += `**${key}:**\n`;
          if (diff.added.length > 0) {
            md += `- Added: \`${diff.added.join("`, `")}\`\n`;
          }
          if (diff.removed.length > 0) {
            md += `- Removed: \`${diff.removed.join("`, `")}\`\n`;
          }
          md += `\n`;
        }
      }
    }
  }

  if (timeline.length > 0) {
    md += `---\n\n`;
    md += `## API Timeline\n\n`;

    for (const entry of timeline) {
      md += `### ${entry.time}\n\n`;
      for (const log of entry.logs) {
        const icon = log.success ? "✅" : "❌";
        md += `- ${icon} ${log.method} \`${log.url}\` → ${log.status} (${log.duration}ms)\n`;
      }
      md += `\n`;
    }
  }

  return md;
}
