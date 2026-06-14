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
import axios from "axios";

export default function ApiTestScreen() {
  const makeSuccessRequest = async () => {
    try {
      await fetch("https://jsonplaceholder.typicode.com/posts/1");
      Alert.alert("Success", "200 OK - Request recorded");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const make404Failure = async () => {
    try {
      await fetch("https://jsonplaceholder.typicode.com/invalid-url");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const make500Failure = async () => {
    try {
      const res = await fetch("https://httpstat.us/500");
      Alert.alert("Done", `Status ${res.status} - Recorded as failure`);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const makeFailedLogin = async () => {
    try {
      await fetch("https://jsonplaceholder.typicode.com/posts", {
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
      await fetch("https://this-domain-does-not-exist-12345.com/api");
    } catch (e: any) {
      Alert.alert("Network Error", e.message);
    }
  };

  const makeAxiosSuccess = async () => {
    try {
      await axios.get("https://jsonplaceholder.typicode.com/posts/1");
      Alert.alert("Success", "Axios 200 OK - Request recorded");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const makeAxiosFailure = async () => {
    try {
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
          Trigger API requests to test the witness
        </Text>

        <Text style={styles.sectionTitle}>Fetch API</Text>

        <TouchableOpacity style={styles.button} onPress={makeSuccessRequest}>
          <Text style={styles.buttonText}>Success Request (200)</Text>
          <Text style={styles.urlText}>GET /posts/1</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.failureButton]}
          onPress={make404Failure}
        >
          <Text style={styles.buttonText}>404 Failure</Text>
          <Text style={styles.urlText}>GET /invalid-url</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.failureButton]}
          onPress={make500Failure}
        >
          <Text style={styles.buttonText}>500 Failure</Text>
          <Text style={styles.urlText}>GET httpstat.us/500</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.failureButton]}
          onPress={makeFailedLogin}
        >
          <Text style={styles.buttonText}>Failed Login (POST)</Text>
          <Text style={styles.urlText}>POST /posts (with secrets)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.networkButton]}
          onPress={makeNetworkFailure}
        >
          <Text style={styles.buttonText}>Network Failure</Text>
          <Text style={styles.urlText}>Invalid domain</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Axios</Text>

        <TouchableOpacity style={styles.button} onPress={makeAxiosSuccess}>
          <Text style={styles.buttonText}>Axios Success (200)</Text>
          <Text style={styles.urlText}>GET /posts/1</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.failureButton]}
          onPress={makeAxiosFailure}
        >
          <Text style={styles.buttonText}>Axios Failure (404)</Text>
          <Text style={styles.urlText}>GET /invalid-url</Text>
        </TouchableOpacity>

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
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
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
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  urlText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    marginTop: 4,
  },
  backButton: {
    marginTop: 16,
    alignItems: "center",
    padding: 12,
  },
  backButtonText: {
    fontSize: 15,
    color: "#2563eb",
    fontWeight: "500",
  },
});
