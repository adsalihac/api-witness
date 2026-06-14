import { File, Directory, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { exportFailureReport, generateMarkdownReport, exportSanitizedJSON } from "./reporter";

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

export { exportFailureReport, generateMarkdownReport, exportSanitizedJSON };
