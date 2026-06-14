export type ApiLog = {
  id: string;
  method: string;
  url: string;
  status: number;
  success: boolean;
  requestHeaders?: Record<string, any>;
  responseHeaders?: Record<string, any>;
  requestBody?: any;
  responseBody?: any;
  errorMessage?: string;
  duration: number;
  timestamp: string;
};

export type FailureReport = {
  reportId: string;
  appName: string;
  appVersion: string;
  environment: string;
  generatedAt: string;
  totalRequests: number;
  failedRequests: number;
  failures: ApiLog[];
};

export type APIWitnessConfig = {
  appName: string;
  appVersion: string;
  environment: string;
  recordSuccessfulRequests?: boolean;
  sensitiveFields?: string[];
};
