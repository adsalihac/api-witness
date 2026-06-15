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
  breadcrumbs?: Breadcrumb[];
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
  logs: ApiLog[];
};

export type APIWitnessConfig = {
  appName: string;
  appVersion: string;
  environment: string;
  recordSuccessfulRequests?: boolean;
  sensitiveFields?: string[];
  knownEndpoints?: string[];
  knownDocsSpec?: Record<string, string>;
  enableBreadcrumbs?: boolean;
  alertWebhookUrl?: string;
  alertThreshold?: number;
  alertCooldownMs?: number;
  performanceBudgets?: PerformanceBudget[];
};

export type PerformanceBudget = {
  endpoint?: string;
  method?: string;
  maxDurationMs: number;
};

export type Breadcrumb = {
  type: "tap" | "navigation" | "gesture" | "lifecycle" | "custom";
  label: string;
  data?: Record<string, any>;
  timestamp: string;
};

export type ErrorGroup = {
  id: string;
  label: string;
  count: number;
  statusCodes: number[];
  methods: string[];
  endpoints: string[];
  errorMessages: string[];
  lastSeen: string;
  logs: ApiLog[];
};

export type ReleaseComparison = {
  versionA: string;
  versionB: string;
  endpointChanges: {
    added: string[];
    removed: string[];
    changed: string[];
  };
  shapeDiffs: Record<string, { added: string[]; removed: string[] }>;
  latencyChanges: Record<string, { avgBefore: number; avgAfter: number; diff: number }>;
};

export type AlertEvent = {
  type: "failure_spike" | "budget_violation" | "new_endpoint" | "shape_change";
  message: string;
  timestamp: string;
  data: any;
};

export type OfflineQueueItem = {
  id: string;
  type: "export" | "webhook";
  data: any;
  createdAt: string;
  retryCount: number;
};

export type EndpointInfo = {
  method: string;
  path: string;
  count: number;
  lastSeen: string;
  statusCodes: number[];
  isKnown: boolean;
};

export type ShapeNode = {
  type: "object" | "array" | "string" | "number" | "boolean" | "null" | "unknown";
  fields?: Record<string, ShapeNode>;
  arrayItem?: ShapeNode;
};

export type ShapeDiff = {
  added: string[];
  removed: string[];
  changed: string[];
};

export type VersionShape = {
  version: string;
  shapes: Record<string, ShapeNode>;
};

export type TimelineEntry = {
  time: string;
  logs: ApiLog[];
};

export type PostmanCollection = {
  info: { name: string; description: string; schema: string };
  item: PostmanItem[];
};

export type PostmanItem = {
  name: string;
  request: {
    method: string;
    header: { key: string; value: string }[];
    url: { raw: string; host: string[]; path: string[] };
    body?: { mode: string; raw: string };
  };
  response: any[];
};

export type OpenAPISpec = {
  openapi: string;
  info: { title: string; version: string; description: string };
  paths: Record<string, Record<string, any>>;
};

export type HARLog = {
  log: {
    version: string;
    creator: { name: string; version: string };
    entries: HAREntry[];
  };
};

export type HAREntry = {
  startedDateTime: string;
  time: number;
  request: {
    method: string;
    url: string;
    httpVersion: string;
    headers: { name: string; value: string }[];
    queryString: { name: string; value: string }[];
    postData?: { mimeType: string; text: string };
    headersSize: number;
    bodySize: number;
  };
  response: {
    status: number;
    statusText: string;
    httpVersion: string;
    headers: { name: string; value: string }[];
    content: { mimeType: string; size: number; text?: string };
    headersSize: number;
    bodySize: number;
  };
  cache: Record<string, unknown>;
  timings: { send: number; wait: number; receive: number };
};

export type LatencyTrendEntry = {
  endpoint: string;
  method: string;
  dailyStats: {
    date: string;
    avg: number;
    p95: number;
    max: number;
    count: number;
  }[];
  trend: "improving" | "stable" | "regressing";
  weekOverWeekChange: number;
};
