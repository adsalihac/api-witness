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
} from "@apiwitness/sdk";
import type { ApiLog } from "@apiwitness/sdk";

export default function FailureReportScreen() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((k) => k + 1);

  const logs = getApiLogs();
  const failedLogs = getFailedApiLogs();
  const report = exportFailureReport();
  const successRate =
    logs.length > 0
      ? Math.round(((logs.length - failedLogs.length) / logs.length) * 100)
      : 0;

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

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Failure Reports</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.dashboardRow}>
          <View style={styles.card}>
            <Text style={styles.cardValue}>{report.totalRequests}</Text>
            <Text style={styles.cardLabel}>Total Requests</Text>
          </View>
          <View style={styles.card}>
            <Text style={[styles.cardValue, { color: "#dc2626" }]}>
              {report.failedRequests}
            </Text>
            <Text style={styles.cardLabel}>Failed Requests</Text>
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
            <Text style={styles.cardLabel}>Success Rate</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleExport}>
            <Text style={styles.actionButtonText}>Save to Files</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.shareButton]}
            onPress={handleShare}
          >
            <Text style={styles.actionButtonText}>Share Report</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.clearButton]}
            onPress={handleClear}
          >
            <Text style={[styles.actionButtonText, styles.clearButtonText]}>
              Clear Logs
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>
          Failures ({failedLogs.length})
        </Text>

        {failedLogs.length === 0 && (
          <Text style={styles.emptyText}>
            No failures recorded yet. Go to the API Test screen and trigger
            some failing requests.
          </Text>
        )}

        {failedLogs.map((log: ApiLog) => (
          <View key={log.id} style={styles.failureCard}>
            <TouchableOpacity onPress={() => toggleExpand(log.id)}>
              <View style={styles.failureHeader}>
                <View style={styles.methodBadge}>
                  <Text style={styles.methodText}>{log.method}</Text>
                </View>
                <View style={styles.failureInfo}>
                  <Text style={styles.failureUrl} numberOfLines={1}>
                    {log.url}
                  </Text>
                  <View style={styles.failureMeta}>
                    <Text style={styles.statusText}>
                      {log.status || "ERR"}
                    </Text>
                    <Text style={styles.metaSep}>·</Text>
                    <Text style={styles.durationText}>{log.duration}ms</Text>
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
    marginBottom: 16,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
  },
  cardLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 4,
    textAlign: "center",
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  shareButton: {
    backgroundColor: "#059669",
  },
  clearButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  clearButtonText: {
    color: "#dc2626",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    paddingVertical: 40,
    lineHeight: 22,
  },
  failureCard: {
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
  failureHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  methodBadge: {
    backgroundColor: "#fef2f2",
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
    color: "#dc2626",
  },
  failureInfo: {
    flex: 1,
  },
  failureUrl: {
    fontSize: 13,
    color: "#111",
    fontWeight: "500",
  },
  failureMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#dc2626",
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
