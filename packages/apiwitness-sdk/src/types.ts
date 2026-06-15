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
  info: {
    name: string;
    description: string;
    schema: string;
  };
  item: PostmanItem[];
};

export type PostmanItem = {
  name: string;
  request: {
    method: string;
    header: { key: string; value: string }[];
    url: {
      raw: string;
      host: string[];
      path: string[];
    };
    body?: {
      mode: string;
      raw: string;
    };
  };
  response: any[];
};

export type OpenAPISpec = {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  paths: Record<string, Record<string, any>>;
};
