import { getAllLogs } from "./storage";
import { ShapeNode, ShapeDiff, VersionShape } from "./types";
import { getConfig } from "./config";

function extractShape(value: any): ShapeNode {
  if (value === null || value === undefined) return { type: "null" };

  if (Array.isArray(value)) {
    const itemShape: ShapeNode =
      value.length > 0 ? extractShape(value[0]) : { type: "unknown" };
    return { type: "array", arrayItem: itemShape };
  }

  if (typeof value === "object") {
    const fields: Record<string, ShapeNode> = {};
    for (const [key, val] of Object.entries(value)) {
      fields[key] = extractShape(val);
    }
    return { type: "object", fields };
  }

  if (typeof value === "string") return { type: "string" };
  if (typeof value === "number") return { type: "number" };
  if (typeof value === "boolean") return { type: "boolean" };

  return { type: "unknown" };
}

function shapeToFlatKeys(shape: ShapeNode, prefix = ""): string[] {
  if (shape.type === "object" && shape.fields) {
    const keys: string[] = [];
    for (const [key, val] of Object.entries(shape.fields)) {
      const path = prefix ? `${prefix}.${key}` : key;
      keys.push(path);
      keys.push(...shapeToFlatKeys(val, path));
    }
    return keys;
  }
  if (shape.type === "array" && shape.arrayItem) {
    return shapeToFlatKeys(shape.arrayItem, `${prefix}[]`);
  }
  return [];
}

export function getVersionShapes(): VersionShape[] {
  const cfg = getConfig();
  const logs = getAllLogs();

  const versionGrouped = new Map<string, Record<string, ShapeNode[]>>();

  for (const log of logs) {
    if (!log.responseBody) continue;
    const version = cfg.appVersion;
    if (!versionGrouped.has(version)) {
      versionGrouped.set(version, {});
    }
    const group = versionGrouped.get(version)!;
    const key = `${log.method}:${log.url}`;
    if (!group[key]) group[key] = [];
    group[key].push(extractShape(log.responseBody));
  }

  const result: VersionShape[] = [];
  for (const [version, shapes] of versionGrouped) {
    const merged: Record<string, ShapeNode> = {};
    for (const [key, shapeList] of Object.entries(shapes)) {
      merged[key] = shapeList[0];
    }
    result.push({ version, shapes: merged });
  }

  return result.sort(
    (a, b) => a.version.localeCompare(b.version)
  );
}

export function getShapeDiffs(): Record<string, ShapeDiff> {
  const versions = getVersionShapes();
  if (versions.length < 2) return {};

  const latest = versions[versions.length - 1];
  const previous = versions[versions.length - 2];
  const diffs: Record<string, ShapeDiff> = {};

  const allKeys = new Set([
    ...Object.keys(previous.shapes),
    ...Object.keys(latest.shapes),
  ]);

  for (const key of allKeys) {
    const prevShape = previous.shapes[key];
    const currShape = latest.shapes[key];

    if (!prevShape && currShape) {
      diffs[key] = {
        added: shapeToFlatKeys(currShape),
        removed: [],
        changed: [],
      };
      continue;
    }
    if (prevShape && !currShape) {
      diffs[key] = {
        added: [],
        removed: shapeToFlatKeys(prevShape),
        changed: [],
      };
      continue;
    }

    const prevKeys = new Set(shapeToFlatKeys(prevShape!));
    const currKeys = new Set(shapeToFlatKeys(currShape!));

    const added = [...currKeys].filter((k) => !prevKeys.has(k));
    const removed = [...prevKeys].filter((k) => !currKeys.has(k));
    const changed: string[] = [];

    diffs[key] = { added, removed, changed };
  }

  return diffs;
}
