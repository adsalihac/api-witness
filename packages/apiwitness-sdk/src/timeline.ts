import { getAllLogs } from "./storage";
import { TimelineEntry } from "./types";

export function getTimeline(groupBy: "minute" | "hour" | "day" = "minute"): TimelineEntry[] {
  const logs = getAllLogs();
  const sorted = [...logs].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const groups = new Map<string, typeof logs>();

  for (const log of sorted) {
    const date = new Date(log.timestamp);
    let key: string;

    switch (groupBy) {
      case "minute":
        key = date.toISOString().slice(0, 16);
        break;
      case "hour":
        key = date.toISOString().slice(0, 13);
        break;
      case "day":
        key = date.toISOString().slice(0, 10);
        break;
    }

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(log);
  }

  return Array.from(groups.entries()).map(([time, groupLogs]) => ({
    time,
    logs: groupLogs,
  }));
}
