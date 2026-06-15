import { File, Directory, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { exportFailureReport, generateMarkdownReport, exportSanitizedJSON } from "./reporter";
import { exportPostmanCollection } from "./postman";
import { generateOpenAPISpec } from "./openapi";
import { generateApiDocs } from "./docs-export";

export async function saveReportToFile(): Promise<string> {
  const json = exportSanitizedJSON();
  const file = new File(Paths.cache, "apiwitness-report.json");
  file.write(json);
  return file.uri;
}

export async function saveReportToDirectory(): Promise<string> {
  const dir = await Directory.pickDirectoryAsync();
  const file = dir.createFile("apiwitness-report.json", "application/json");
  const json = exportSanitizedJSON();
  file.write(json);
  return file.uri;
}

export async function shareReport(): Promise<void> {
  const json = exportSanitizedJSON();
  const file = new File(Paths.cache, "apiwitness-report.json");
  file.write(json);
  await Sharing.shareAsync(file.uri, {
    mimeType: "application/json",
    dialogTitle: "Share APIWitness Report",
  });
}

export async function savePostmanCollection(): Promise<string> {
  const collection = exportPostmanCollection();
  const json = JSON.stringify(collection, null, 2);
  const file = new File(Paths.cache, "apiwitness-postman.json");
  file.write(json);
  return file.uri;
}

export async function sharePostmanCollection(): Promise<void> {
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
  const spec = generateOpenAPISpec();
  const json = JSON.stringify(spec, null, 2);
  const file = new File(Paths.cache, "apiwitness-openapi.json");
  file.write(json);
  return file.uri;
}

export async function shareOpenAPISpec(): Promise<void> {
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
  const md = generateApiDocs();
  const file = new File(Paths.cache, "apiwitness-docs.md");
  file.write(md);
  return file.uri;
}

export async function shareApiDocsMarkdown(): Promise<void> {
  const md = generateApiDocs();
  const file = new File(Paths.cache, "apiwitness-docs.md");
  file.write(md);
  await Sharing.shareAsync(file.uri, {
    mimeType: "text/markdown",
    dialogTitle: "Share API Docs",
  });
}

export {
  exportFailureReport,
  generateMarkdownReport,
  exportSanitizedJSON,
};
