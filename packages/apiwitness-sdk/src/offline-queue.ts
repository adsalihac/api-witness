import { OfflineQueueItem } from "./types";
import { generateId, getTimestamp } from "./helpers";

const STORAGE_KEY = "apiwitness-offline-queue";
const MAX_RETRIES = 5;

function getQueue(): OfflineQueueItem[] {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: OfflineQueueItem[]): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch {}
}

export function enqueue(itemType: OfflineQueueItem["type"], data: any): void {
  const queue = getQueue();
  queue.push({
    id: generateId(),
    type: itemType,
    data,
    createdAt: getTimestamp(),
    retryCount: 0,
  });
  saveQueue(queue);
  processQueue();
}

export function getQueuedItems(): OfflineQueueItem[] {
  return getQueue();
}

export function clearQueue(): void {
  saveQueue([]);
}

async function processItem(item: OfflineQueueItem): Promise<boolean> {
  try {
    if (item.type === "webhook") {
      const res = await fetch(item.data.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item.data.body),
      });
      return res.ok;
    }
    if (item.type === "export") {
      const res = await fetch(item.data.url, {
        method: "PUT",
        body: item.data.content,
      });
      return res.ok;
    }
    return false;
  } catch {
    return false;
  }
}

async function processQueue(): Promise<void> {
  const queue = getQueue();
  if (queue.length === 0) return;

  const remaining: OfflineQueueItem[] = [];
  let changed = false;

  for (const item of queue) {
    if (item.retryCount >= MAX_RETRIES) {
      changed = true;
      continue;
    }
    const success = await processItem(item);
    if (success) {
      changed = true;
    } else {
      item.retryCount++;
      remaining.push(item);
      changed = true;
    }
  }

  if (changed) saveQueue(remaining);

  if (remaining.length > 0) {
    const delay = Math.min(1000 * Math.pow(2, remaining[0].retryCount), 60000);
    setTimeout(processQueue, delay);
  }
}

export function setupOfflineQueue(): void {
  if (typeof globalThis.addEventListener !== "undefined") {
    globalThis.addEventListener("online", () => processQueue());
  }
}
