"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as yaml from "js-yaml";

export interface OpenApiDoc {
  openapi?: string;
  info?: { title?: string; version?: string; description?: string };
  servers?: { url: string; description?: string }[];
  paths?: Record<string, Record<string, any>>;
  components?: Record<string, any>;
  tags?: { name: string; description?: string }[];
  [key: string]: any;
}

interface Props {
  onSpecParsed: (spec: OpenApiDoc) => void;
  parsed: OpenApiDoc | null;
}

const PETSTORE_SPEC = `{
  "openapi": "3.0.3",
  "info": {
    "title": "Petstore",
    "version": "1.0.0",
    "description": "A sample pet store API"
  },
  "servers": [
    { "url": "https://petstore.swagger.io/v2", "description": "Production" }
  ],
  "paths": {
    "/pet": {
      "post": {
        "tags": ["pet"],
        "summary": "Add a new pet",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "id": { "type": "integer" },
                  "name": { "type": "string" },
                  "status": { "type": "string", "enum": ["available", "pending", "sold"] }
                },
                "required": ["name"]
              }
            }
          }
        },
        "responses": {
          "200": { "description": "successful operation" },
          "405": { "description": "Invalid input" }
        }
      },
      "put": {
        "tags": ["pet"],
        "summary": "Update an existing pet",
        "responses": {
          "200": { "description": "successful operation" },
          "400": { "description": "Invalid ID supplied" }
        }
      }
    },
    "/pet/findByStatus": {
      "get": {
        "tags": ["pet"],
        "summary": "Finds pets by status",
        "parameters": [
          { "name": "status", "in": "query", "schema": { "type": "string" } }
        ],
        "responses": {
          "200": { "description": "successful operation" }
        }
      }
    },
    "/pet/{petId}": {
      "get": {
        "tags": ["pet"],
        "summary": "Find pet by ID",
        "parameters": [
          { "name": "petId", "in": "path", "required": true, "schema": { "type": "integer" } }
        ],
        "responses": {
          "200": { "description": "successful operation" },
          "404": { "description": "Pet not found" }
        }
      },
      "delete": {
        "tags": ["pet"],
        "summary": "Deletes a pet",
        "parameters": [
          { "name": "petId", "in": "path", "required": true, "schema": { "type": "integer" } },
          { "name": "api_key", "in": "header", "schema": { "type": "string" } }
        ],
        "responses": {
          "200": { "description": "successful operation" },
          "404": { "description": "Pet not found" }
        }
      }
    },
    "/store/inventory": {
      "get": {
        "tags": ["store"],
        "summary": "Returns pet inventories by status",
        "responses": {
          "200": { "description": "successful operation" }
        }
      }
    },
    "/store/order": {
      "post": {
        "tags": ["store"],
        "summary": "Place an order for a pet",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "petId": { "type": "integer" },
                  "quantity": { "type": "integer" },
                  "shipDate": { "type": "string", "format": "date-time" },
                  "status": { "type": "string", "enum": ["placed", "approved", "delivered"] },
                  "complete": { "type": "boolean" }
                }
              }
            }
          }
        },
        "responses": {
          "200": { "description": "successful operation" },
          "400": { "description": "Invalid Order" }
        }
      }
    },
    "/user": {
      "post": {
        "tags": ["user"],
        "summary": "Create user",
        "responses": {
          "default": { "description": "successful operation" }
        }
      }
    }
  }
}`;

export function OpenApiInput({ onSpecParsed, parsed }: Props) {
  const [raw, setRaw] = useState("");
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const parseSpec = useCallback((text: string) => {
    setError("");
    setParsing(true);
    try {
      const trimmed = text.trim();
      const spec: OpenApiDoc = trimmed.startsWith("{")
        ? JSON.parse(trimmed)
        : (yaml.load(trimmed) as OpenApiDoc);
      if (!spec || !spec.paths || typeof spec.paths !== "object") {
        throw new Error("Invalid OpenAPI spec: missing 'paths' object");
      }
      onSpecParsed(spec);
    } catch (e: any) {
      setError(e.message || "Failed to parse spec");
    } finally {
      setParsing(false);
    }
  }, [onSpecParsed]);

  const loadSample = () => {
    setRaw(PETSTORE_SPEC);
    parseSpec(PETSTORE_SPEC);
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setRaw(text);
      parseSpec(text);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-6">
      {!parsed && (
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">API Playground</h2>
          <p className="text-neutral-500 max-w-xl mx-auto">
            Paste an OpenAPI spec to generate interactive docs, mock APIs, a testing interface, and SDK snippets.
          </p>
        </div>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-6 transition-all",
          dragOver
            ? "border-indigo-400 bg-indigo-50/50"
            : parsed
              ? "border-emerald-200 bg-emerald-50/30"
              : "border-neutral-200 bg-neutral-50/50 hover:border-neutral-300"
        )}
      >
        <div className="flex flex-col items-center gap-3">
          {parsed ? (
            <div className="flex items-center gap-3 w-full">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-emerald-800">{parsed.info?.title || "Untitled Spec"}</p>
                <p className="text-xs text-emerald-600 truncate">v{parsed.info?.version || "?"} &middot; {Object.keys(parsed.paths || {}).length} endpoints</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => { setRaw(""); onSpecParsed(null as any); }}>
                Change
              </Button>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-neutral-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-neutral-700">
                  Drop your OpenAPI file here, or{" "}
                  <button onClick={() => fileRef.current?.click()} className="text-indigo-600 hover:text-indigo-700 underline underline-offset-2">
                    browse
                  </button>
                </p>
                <p className="text-xs text-neutral-400 mt-1">Supports JSON and YAML</p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".json,.yaml,.yml"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={loadSample}>
                  Load Petstore Sample
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {!parsed && (
        <>
          <div className="relative">
            <textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder="Paste your OpenAPI 3.x JSON or YAML here..."
              rows={10}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-mono text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-y"
            />
          </div>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg p-3 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}
          <div className="flex justify-center">
            <Button
              onClick={() => parseSpec(raw)}
              disabled={!raw.trim() || parsing}
              size="lg"
            >
              {parsing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Parsing...</>
              ) : (
                <><Upload className="w-4 h-4" /> Parse Spec</>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
