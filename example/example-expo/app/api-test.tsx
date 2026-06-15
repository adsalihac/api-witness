import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import axios from "axios";

type NetworkCondition = "none" | "throttled" | "offline";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const THROTTLE_DELAY = 2000;

export default function ApiTestScreen() {
  const [condition, setCondition] = useState<NetworkCondition>("none");

  const wrapFetch = async (url: string, options?: RequestInit) => {
    if (condition === "offline") {
      throw new Error("Network request failed (offline simulation)");
    }
    if (condition === "throttled") {
      await delay(THROTTLE_DELAY);
    }
    return fetch(url, options);
  };

  const makeSuccessRequest = async () => {
    try {
      await wrapFetch("https://jsonplaceholder.typicode.com/posts/1");
      Alert.alert("Success", "200 OK - Request recorded");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const makePostRequest = async () => {
    try {
      await wrapFetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "APIWitness Test",
          body: "This is a test post",
          userId: 1,
        }),
      });
      Alert.alert("Success", "POST 201 - Request recorded");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const makeGetUsersRequest = async () => {
    try {
      await wrapFetch("https://jsonplaceholder.typicode.com/users");
      Alert.alert("Success", "GET /users - Array response recorded");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const make404Failure = async () => {
    try {
      await wrapFetch("https://jsonplaceholder.typicode.com/invalid-url");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const make500Failure = async () => {
    try {
      const res = await wrapFetch("https://httpstat.us/500");
      Alert.alert("Done", `Status ${res.status} - Recorded as failure`);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const makeFailedLogin = async () => {
    try {
      await wrapFetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "qa@test.com",
          password: "123456",
          token: "secret-token",
        }),
      });
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const makeNetworkFailure = async () => {
    try {
      await wrapFetch("https://this-domain-does-not-exist-12345.com/api");
    } catch (e: any) {
      Alert.alert("Network Error", e.message);
    }
  };

  const makeAxiosSuccess = async () => {
    try {
      if (condition === "offline") {
        throw new Error("Network request failed (offline simulation)");
      }
      if (condition === "throttled") {
        await delay(THROTTLE_DELAY);
      }
      await axios.get("https://jsonplaceholder.typicode.com/posts/1");
      Alert.alert("Success", "Axios 200 OK - Request recorded");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const makeAxiosPost = async () => {
    try {
      if (condition === "offline") {
        throw new Error("Network request failed (offline simulation)");
      }
      if (condition === "throttled") {
        await delay(THROTTLE_DELAY);
      }
      await axios.post("https://jsonplaceholder.typicode.com/posts", {
        title: "Axios Test",
        body: "Testing via Axios",
        userId: 2,
      });
      Alert.alert("Success", "Axios POST 201 - Request recorded");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const makeAxiosFailure = async () => {
    try {
      if (condition === "offline") {
        throw new Error("Network request failed (offline simulation)");
      }
      if (condition === "throttled") {
        await delay(THROTTLE_DELAY);
      }
      await axios.get("https://jsonplaceholder.typicode.com/invalid-url");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>API Test Screen</Text>
        <Text style={styles.subtitle}>
          Trigger different API requests to exercise all witness features
        </Text>

        {/* Network Simulation Controls */}
        <View style={styles.simulationCard}>
          <Text style={styles.simulationTitle}>Network Simulation</Text>
          <View style={styles.simulationRow}>
            <TouchableOpacity
              style={[styles.simButton, condition === "none" && styles.simButtonActive]}
              onPress={() => setCondition("none")}
            >
              <Text style={[styles.simButtonText, condition === "none" && styles.simButtonTextActive]}>Normal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.simButton, condition === "throttled" && styles.simButtonActive]}
              onPress={() => setCondition("throttled")}
            >
              <Text style={[styles.simButtonText, condition === "throttled" && styles.simButtonTextActive]}>Throttled (2s)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.simButton, styles.simButtonDanger, condition === "offline" && styles.simButtonActive]}
              onPress={() => setCondition("offline")}
            >
              <Text style={[styles.simButtonText, condition === "offline" && styles.simButtonTextActive]}>Offline</Text>
            </TouchableOpacity>
          </View>
          {condition === "throttled" && (
            <Text style={styles.simulationHint}>Requests will be delayed by 2 seconds</Text>
          )}
          {condition === "offline" && (
            <Text style={[styles.simulationHint, { color: "#dc2626" }]}>Requests will fail with network error</Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>Fetch API — Success</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={makeSuccessRequest}>
            <Text style={styles.buttonText}>GET /posts/1</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={makePostRequest}>
            <Text style={styles.buttonText}>POST /posts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={makeGetUsersRequest}>
            <Text style={styles.buttonText}>GET /users</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Fetch API — Failures</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.failureButton]}
            onPress={make404Failure}
          >
            <Text style={styles.buttonText}>404</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.failureButton]}
            onPress={make500Failure}
          >
            <Text style={styles.buttonText}>500</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.failureButton]}
            onPress={makeFailedLogin}
          >
            <Text style={styles.buttonText}>POST (secrets)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.networkButton]}
            onPress={makeNetworkFailure}
          >
            <Text style={styles.buttonText}>Network</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Axios — Success</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={makeAxiosSuccess}>
            <Text style={styles.buttonText}>GET /posts/1</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={makeAxiosPost}>
            <Text style={styles.buttonText}>POST /posts</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Axios — Failures</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.failureButton]}
            onPress={makeAxiosFailure}
          >
            <Text style={styles.buttonText}>404</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 24,
    lineHeight: 20,
  },
  simulationCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
    marginBottom: 16,
  },
  simulationTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 10,
  },
  simulationRow: {
    flexDirection: "row",
    gap: 8,
  },
  simButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
  },
  simButtonActive: {
    borderColor: "#6366f1",
    backgroundColor: "#eef2ff",
  },
  simButtonDanger: {
    borderColor: "#fecaca",
  },
  simButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },
  simButtonTextActive: {
    color: "#4f46e5",
  },
  simulationHint: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  failureButton: {
    backgroundColor: "#dc2626",
    shadowColor: "#dc2626",
  },
  networkButton: {
    backgroundColor: "#7c3aed",
    shadowColor: "#7c3aed",
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  backButton: {
    marginTop: 24,
    alignItems: "center",
    padding: 12,
  },
  backButtonText: {
    fontSize: 15,
    color: "#2563eb",
    fontWeight: "500",
  },
});
