import { File, Paths } from "expo-file-system";
import { ApiLog } from "./types";

const STORAGE_FILE = "apiwitness-logs.json";

let logs: ApiLog[] = [];

function getStorageFile(): File {
  return new File(Paths.document, STORAGE_FILE);
}

async function persistLogs(): Promise<void> {
  try {
    const file = getStorageFile();
    file.write(JSON.stringify(logs));
  } catch {}
}

async function loadPersistedLogs(): Promise<void> {
  try {
    const file = getStorageFile();
    if (file.exists) {
      const data = await file.text();
      const parsed: ApiLog[] = JSON.parse(data);
      if (Array.isArray(parsed)) {
        logs = parsed;
      }
    }
  } catch {}
}

export async function addLog(log: ApiLog): Promise<void> {
  logs.push(log);
  await persistLogs();
}

export function getAllLogs(): ApiLog[] {
  return [...logs];
}

export function getFailedLogs(): ApiLog[] {
  return logs.filter((log) => !log.success);
}

export async function clearAllLogs(): Promise<void> {
  logs = [];
  try {
    const file = getStorageFile();
    if (file.exists) {
      file.delete();
    }
  } catch {}
}

export function getLogCount(): { total: number; failed: number } {
  return {
    total: logs.length,
    failed: logs.filter((l) => !l.success).length,
  };
}

export { loadPersistedLogs };
