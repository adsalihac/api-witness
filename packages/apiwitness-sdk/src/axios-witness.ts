import { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import { addLog } from "./storage";
import { maskSensitiveFields } from "./masker";
import { getConfig } from "./config";
import { generateId, getTimestamp, isFailureStatus } from "./helpers";

export function setupAxiosWitness(axiosInstance: AxiosInstance): void {
  axiosInstance.interceptors.request.use(
    (config) => {
      const startTime = performance.now();
      (config as any)._apiwitnessStartTime = startTime;
      return config;
    },
    (error) => Promise.reject(error)
  );

  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      const startTime = (response.config as any)._apiwitnessStartTime as number;
      const endTime = performance.now();
      recordAxiosResponse(response, startTime, endTime);
      return response;
    },
    (error: AxiosError) => {
      const startTime = (error.config as any)?._apiwitnessStartTime as number | undefined;
      const endTime = performance.now();
      recordAxiosError(error, startTime, endTime);
      return Promise.reject(error);
    }
  );
}

function recordAxiosResponse(response: AxiosResponse, startTime: number, endTime: number): void {
  const cfg = getConfig();
  const status = response.status;
  const success = !isFailureStatus(status);

  if (success && !cfg.recordSuccessfulRequests) return;

  addLog({
    id: generateId(),
    method: (response.config.method || "GET").toUpperCase(),
    url: response.config.url || "",
    status,
    success,
    requestHeaders: maskSensitiveFields(response.config.headers as Record<string, any>),
    responseHeaders: maskSensitiveFields(response.headers as Record<string, any>),
    requestBody: maskSensitiveFields(response.config.data),
    responseBody: maskSensitiveFields(response.data),
    duration: Math.round(endTime - startTime),
    timestamp: getTimestamp(),
  });
}

function recordAxiosError(error: AxiosError, startTime?: number, endTime?: number): void {
  const now = endTime || performance.now();
  const duration = startTime ? Math.round(now - startTime) : 0;

  addLog({
    id: generateId(),
    method: (error.config?.method || "GET").toUpperCase(),
    url: error.config?.url || "",
    status: error.response?.status || 0,
    success: false,
    requestHeaders: maskSensitiveFields(error.config?.headers as Record<string, any>),
    responseHeaders: maskSensitiveFields(error.response?.headers as Record<string, any>),
    requestBody: maskSensitiveFields(error.config?.data),
    responseBody: maskSensitiveFields(error.response?.data),
    errorMessage: error.message,
    duration,
    timestamp: getTimestamp(),
  });
}
