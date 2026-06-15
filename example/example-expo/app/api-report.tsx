import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  getApiLogs,
  getFailedApiLogs,
  exportFailureReport,
  clearLogs,
  saveReportToDirectory,
  shareReport,
  savePostmanCollection,
  sharePostmanCollection,
  saveOpenAPISpec,
  shareOpenAPISpec,
  saveApiDocsMarkdown,
  shareApiDocsMarkdown,
  getDetectedEndpoints,
  getNewEndpoints,
  getUndocumentedEndpoints,
  getVersionShapes,
  getShapeDiffs,
} from "@apiwitness/sdk";
import type { ApiLog } from "@apiwitness/sdk";

export default function ApiReportScreen() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filter, setFilter] = useState<"all" | "failures">("all");

  const refresh = () => setRefreshKey((k) => k + 1);

  const logs = getApiLogs();
  const failedLogs = getFailedApiLogs();
  const report = exportFailureReport();
  const endpoints = getDetectedEndpoints();
  const newEndpoints = getNewEndpoints();
  const undocumented = getUndocumentedEndpoints();
  const shapeDiffs = getShapeDiffs();
  const versions = getVersionShapes();

  const successRate =
    logs.length > 0
      ? Math.round(((logs.length - failedLogs.length) / logs.length) * 100)
      : 0;

  const displayLogs = filter === "failures" ? failedLogs : logs;

  const handleExport = useCallback(async () => {
    try {
      const uri = await saveReportToDirectory();
      Alert.alert("Saved", `Report saved to:\n${uri}`);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  }, []);

  const handleShare = useCallback(async () => {
    try {
      await shareReport();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  }, []);

  const handleClear = useCallback(async () => {
    await clearLogs();
    refresh();
    Alert.alert("Cleared", "All logs have been cleared.");
  }, []);

  const handlePostman = useCallback(async () => {
    try {
      await sharePostmanCollection();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  }, []);

  const handleOpenAPI = useCallback(async () => {
    try {
      await shareOpenAPISpec();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  }, []);

  const handleMarkdownDocs = useCallback(async () => {
    try {
      await shareApiDocsMarkdown();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>API Report</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.dashboardRow}>
          <View style={styles.card}>
            <Text style={styles.cardValue}>{report.totalRequests}</Text>
            <Text style={styles.cardLabel}>Total</Text>
          </View>
          <View style={styles.card}>
            <Text style={[styles.cardValue, { color: "#dc2626" }]}>
              {report.failedRequests}
            </Text>
            <Text style={styles.cardLabel}>Failed</Text>
          </View>
          <View style={styles.card}>
            <Text
              style={[
                styles.cardValue,
                { color: successRate > 80 ? "#16a34a" : "#dc2626" },
              ]}
            >
              {successRate}%
            </Text>
            <Text style={styles.cardLabel}>Success</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardValue}>{endpoints.length}</Text>
            <Text style={styles.cardLabel}>Endpoints</Text>
          </View>
        </View>

        {/* Analytics cards */}
        <View style={styles.analyticsRow}>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsValue}>{newEndpoints.length}</Text>
            <Text style={styles.analyticsLabel}>New Endpoints</Text>
          </View>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsValue}>{undocumented.length}</Text>
            <Text style={styles.analyticsLabel}>Undocumented</Text>
          </View>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsValue}>
              {Object.keys(shapeDiffs).length}
            </Text>
            <Text style={styles.analyticsLabel}>Shape Changes</Text>
          </View>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsValue}>{versions.length}</Text>
            <Text style={styles.analyticsLabel}>Versions</Text>
          </View>
        </View>

        {/* Export actions */}
        <Text style={styles.sectionTitle}>Export</Text>
        <View style={styles.exportRow}>
          <TouchableOpacity style={styles.exportBtn} onPress={handleShare}>
            <Text style={styles.exportBtnText}>JSON Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
            <Text style={styles.exportBtnText}>Save to Files</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportBtn} onPress={handlePostman}>
            <Text style={styles.exportBtnText}>Postman</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportBtn} onPress={handleOpenAPI}>
            <Text style={styles.exportBtnText}>OpenAPI</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportBtn} onPress={handleMarkdownDocs}>
            <Text style={styles.exportBtnText}>Docs (MD)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.exportBtn, styles.clearExportBtn]}
            onPress={handleClear}
          >
            <Text style={[styles.exportBtnText, styles.clearExportText]}>
              Clear
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filter */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, filter === "all" && styles.filterChipActive]}
            onPress={() => setFilter("all")}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === "all" && styles.filterChipTextActive,
              ]}
            >
              All ({logs.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              filter === "failures" && styles.filterChipActive,
            ]}
            onPress={() => setFilter("failures")}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === "failures" && styles.filterChipTextActive,
              ]}
            >
              Failures ({failedLogs.length})
            </Text>
          </TouchableOpacity>
        </View>

        {displayLogs.length === 0 && (
          <Text style={styles.emptyText}>
            {filter === "failures"
              ? "No failures recorded yet."
              : "No API calls recorded yet. Go to the API Test screen and make some requests."}
          </Text>
        )}

        {displayLogs.map((log: ApiLog) => (
          <View key={log.id} style={styles.logCard}>
            <TouchableOpacity onPress={() => toggleExpand(log.id)}>
              <View style={styles.logHeader}>
                <View
                  style={[
                    styles.methodBadge,
                    { backgroundColor: log.success ? "#f0fdf4" : "#fef2f2" },
                  ]}
                >
                  <Text
                    style={[
                      styles.methodText,
                      { color: log.success ? "#16a34a" : "#dc2626" },
                    ]}
                  >
                    {log.method}
                  </Text>
                </View>
                <View style={styles.logInfo}>
                  <Text style={styles.logUrl} numberOfLines={1}>
                    {log.url}
                  </Text>
                  <View style={styles.logMeta}>
                    <Text
                      style={[
                        styles.statusText,
                        { color: log.success ? "#16a34a" : "#dc2626" },
                      ]}
                    >
                      {log.status || "ERR"}
                    </Text>
                    <Text style={styles.metaSep}>·</Text>
                    <Text style={styles.durationText}>{log.duration}ms</Text>
                    {!log.success && log.errorMessage && (
                      <>
                        <Text style={styles.metaSep}>·</Text>
                        <Text style={styles.errorBrief} numberOfLines={1}>
                          {log.errorMessage}
                        </Text>
                      </>
                    )}
                  </View>
                </View>
                <Text style={styles.expandIcon}>
                  {expandedId === log.id ? "▼" : "▶"}
                </Text>
              </View>
            </TouchableOpacity>

            {expandedId === log.id && (
              <View style={styles.expandedContent}>
                {log.errorMessage && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Error</Text>
                    <Text style={styles.errorText}>{log.errorMessage}</Text>
                  </View>
                )}

                <Text style={styles.timestampText}>{log.timestamp}</Text>

                {log.requestHeaders && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Request Headers</Text>
                    <Text style={styles.codeBlock}>
                      {JSON.stringify(log.requestHeaders, null, 2)}
                    </Text>
                  </View>
                )}

                {log.responseHeaders && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Response Headers</Text>
                    <Text style={styles.codeBlock}>
                      {JSON.stringify(log.responseHeaders, null, 2)}
                    </Text>
                  </View>
                )}

                {log.requestBody && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Request Body</Text>
                    <Text style={styles.codeBlock}>
                      {JSON.stringify(log.requestBody, null, 2)}
                    </Text>
                  </View>
                )}

                {log.responseBody && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Response Body</Text>
                    <Text style={styles.codeBlock}>
                      {JSON.stringify(log.responseBody, null, 2)}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backLink: {
    fontSize: 15,
    color: "#2563eb",
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  dashboardRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
  },
  cardLabel: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 2,
    textAlign: "center",
  },
  analyticsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  analyticsCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  analyticsValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6366f1",
  },
  analyticsLabel: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 2,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  exportRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 16,
  },
  exportBtn: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  exportBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  clearExportBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  clearExportText: {
    color: "#dc2626",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  filterChipActive: {
    backgroundColor: "#111",
    borderColor: "#111",
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  filterChipTextActive: {
    color: "#fff",
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    paddingVertical: 40,
    lineHeight: 22,
  },
  logCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  logHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  methodBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
    minWidth: 48,
    alignItems: "center",
  },
  methodText: {
    fontSize: 11,
    fontWeight: "700",
  },
  logInfo: {
    flex: 1,
  },
  logUrl: {
    fontSize: 13,
    color: "#111",
    fontWeight: "500",
  },
  logMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  metaSep: {
    fontSize: 12,
    color: "#d1d5db",
    marginHorizontal: 6,
  },
  durationText: {
    fontSize: 12,
    color: "#6b7280",
  },
  errorBrief: {
    fontSize: 12,
    color: "#dc2626",
    flex: 1,
  },
  expandIcon: {
    fontSize: 12,
    color: "#9ca3af",
    marginLeft: 8,
  },
  expandedContent: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 12,
  },
  detailSection: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  codeBlock: {
    fontFamily: "monospace",
    fontSize: 11,
    color: "#374151",
    backgroundColor: "#f9fafb",
    padding: 10,
    borderRadius: 8,
    overflow: "hidden",
  },
  errorText: {
    fontSize: 13,
    color: "#dc2626",
    fontWeight: "500",
  },
  timestampText: {
    fontSize: 11,
    color: "#9ca3af",
    marginBottom: 12,
  },
});
