import { APIWitnessConfig } from "./types";

let config: APIWitnessConfig | null = null;

export function getConfig(): APIWitnessConfig {
  if (!config) {
    throw new Error("APIWitness not initialized. Call startAPIWitness() first.");
  }
  return config;
}

export function setConfig(cfg: APIWitnessConfig): void {
  config = {
    recordSuccessfulRequests: false,
    sensitiveFields: [
      "password",
      "token",
      "accessToken",
      "refreshToken",
      "authorization",
      "apiKey",
      "secret",
    ],
    knownEndpoints: [],
    knownDocsSpec: {},
    ...cfg,
  };
}

export function isInitialized(): boolean {
  return config !== null;
}
