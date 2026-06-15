import { exportFailureReport, generateMarkdownReport, exportSanitizedJSON } from "./reporter";
import { exportPostmanCollection } from "./postman";
import { generateOpenAPISpec } from "./openapi";
import { generateApiDocs } from "./docs-export";
import { toHAR } from "./har-export";
import { toCurls } from "./curl-export";
import { getAllLogs } from "./storage";
import { getConfig } from "./config";

async function getExpoModules() {
  try {
    const fs = await import("expo-file-system");
    const sharing = await import("expo-sharing");
    return { File: fs.File, Directory: fs.Directory, Paths: fs.Paths, Sharing: sharing.default || sharing };
  } catch {
    throw new Error(
      "expo-file-system and expo-sharing are required for file/save operations. " +
      "These functions can only be used in Expo/React Native environments."
    );
  }
}

export async function saveReportToFile(): Promise<string> {
  const { File, Paths } = await getExpoModules();
  const json = exportSanitizedJSON();
  const file = new File(Paths.cache, "apiwitness-report.json");
  file.write(json);
  return file.uri;
}

export async function saveReportToDirectory(): Promise<string> {
  const { Directory } = await getExpoModules();
  const dir = await Directory.pickDirectoryAsync();
  const file = dir.createFile("apiwitness-report.json", "application/json");
  const json = exportSanitizedJSON();
  file.write(json);
  return file.uri;
}

export async function shareReport(): Promise<void> {
  const { File, Paths, Sharing } = await getExpoModules();
  const json = exportSanitizedJSON();
  const file = new File(Paths.cache, "apiwitness-report.json");
  file.write(json);
  await Sharing.shareAsync(file.uri, {
    mimeType: "application/json",
    dialogTitle: "Share APIWitness Report",
  });
}

export async function savePostmanCollection(): Promise<string> {
  const { File, Paths } = await getExpoModules();
  const collection = exportPostmanCollection();
  const json = JSON.stringify(collection, null, 2);
  const file = new File(Paths.cache, "apiwitness-postman.json");
  file.write(json);
  return file.uri;
}

export async function sharePostmanCollection(): Promise<void> {
  const { File, Paths, Sharing } = await getExpoModules();
  const collection = exportPostmanCollection();
  const json = JSON.stringify(collection, null, 2);
  const file = new File(Paths.cache, "apiwitness-postman.json");
  file.write(json);
  await Sharing.shareAsync(file.uri, {
    mimeType: "application/json",
    dialogTitle: "Share Postman Collection",
  });
}

export async function saveOpenAPISpec(): Promise<string> {
  const { File, Paths } = await getExpoModules();
  const spec = generateOpenAPISpec();
  const json = JSON.stringify(spec, null, 2);
  const file = new File(Paths.cache, "apiwitness-openapi.json");
  file.write(json);
  return file.uri;
}

export async function shareOpenAPISpec(): Promise<void> {
  const { File, Paths, Sharing } = await getExpoModules();
  const spec = generateOpenAPISpec();
  const json = JSON.stringify(spec, null, 2);
  const file = new File(Paths.cache, "apiwitness-openapi.json");
  file.write(json);
  await Sharing.shareAsync(file.uri, {
    mimeType: "application/json",
    dialogTitle: "Share OpenAPI Spec",
  });
}

export async function saveApiDocsMarkdown(): Promise<string> {
  const { File, Paths } = await getExpoModules();
  const md = generateApiDocs();
  const file = new File(Paths.cache, "apiwitness-docs.md");
  file.write(md);
  return file.uri;
}

export async function shareApiDocsMarkdown(): Promise<void> {
  const { File, Paths, Sharing } = await getExpoModules();
  const md = generateApiDocs();
  const file = new File(Paths.cache, "apiwitness-docs.md");
  file.write(md);
  await Sharing.shareAsync(file.uri, {
    mimeType: "text/markdown",
    dialogTitle: "Share API Docs",
  });
}

export async function saveHARExport(): Promise<string> {
  const { File, Paths } = await getExpoModules();
  const cfg = getConfig();
  const logs = getAllLogs();
  const har = toHAR(logs, cfg.appName, cfg.appVersion);
  const json = JSON.stringify(har, null, 2);
  const file = new File(Paths.cache, "apiwitness-export.har");
  file.write(json);
  return file.uri;
}

export async function shareHARExport(): Promise<void> {
  const { File, Paths, Sharing } = await getExpoModules();
  const cfg = getConfig();
  const logs = getAllLogs();
  const har = toHAR(logs, cfg.appName, cfg.appVersion);
  const json = JSON.stringify(har, null, 2);
  const file = new File(Paths.cache, "apiwitness-export.har");
  file.write(json);
  await Sharing.shareAsync(file.uri, {
    mimeType: "application/json",
    dialogTitle: "Share HAR Export",
  });
}

export async function saveCurlExport(): Promise<string> {
  const { File, Paths } = await getExpoModules();
  const logs = getAllLogs();
  const curl = toCurls(logs);
  const file = new File(Paths.cache, "apiwitness-export.sh");
  file.write(curl);
  return file.uri;
}

export async function shareCurlExport(): Promise<void> {
  const { File, Paths, Sharing } = await getExpoModules();
  const logs = getAllLogs();
  const curl = toCurls(logs);
  const file = new File(Paths.cache, "apiwitness-export.sh");
  file.write(curl);
  await Sharing.shareAsync(file.uri, {
    mimeType: "text/plain",
    dialogTitle: "Share cURL Export",
  });
}

export {
  exportFailureReport,
  generateMarkdownReport,
  exportSanitizedJSON,
};
