import { getConfig } from "./config";

export function maskSensitiveFields(data: any): any {
  if (!data || typeof data !== "object") return data;

  const sensitiveFields = getConfig().sensitiveFields || [];
  const sensitiveLower = sensitiveFields.map((f) => f.toLowerCase());

  if (Array.isArray(data)) {
    return data.map((item) => maskSensitiveFields(item));
  }

  const masked: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (sensitiveLower.includes(key.toLowerCase())) {
      masked[key] = "***";
    } else if (typeof value === "object" && value !== null) {
      masked[key] = maskSensitiveFields(value);
    } else {
      masked[key] = value;
    }
  }
  return masked;
}
