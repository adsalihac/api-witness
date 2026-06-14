import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { startAPIWitness, setupAxiosWitness } from "@apiwitness/sdk";
import axios from "axios";

export default function RootLayout() {
  useEffect(() => {
    startAPIWitness({
      appName: "APIWitness Demo",
      appVersion: "1.0.0",
      environment: "development",
      recordSuccessfulRequests: true,
      sensitiveFields: [
        "password", "token", "accessToken", "refreshToken",
        "authorization", "apiKey", "secret",
      ],
    });
    setupAxiosWitness(axios);
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
