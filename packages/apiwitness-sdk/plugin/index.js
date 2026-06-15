// Expo Config Plugin for APIWitness SDK
// Automatically configures AndroidManifest.xml and Info.plist with witness settings.
// Usage: plugins: [["@apiwitness/sdk", { appName: "MyApp" }]]

let withInfoPlist, withAndroidManifest;
try {
  const cp = require("@expo/config-plugins");
  withInfoPlist = cp.withInfoPlist;
  withAndroidManifest = cp.withAndroidManifest;
} catch {
  // @expo/config-plugins is only available in Expo managed workflows
}

function withAPIWitness(config, props) {
  if (!withInfoPlist || !withAndroidManifest) return config;

  const {
    appName = config.name || "App",
    appVersion = config.version || "1.0.0",
    environment = "production",
    recordSuccessfulRequests = false,
    sensitiveFields,
    enableBreadcrumbs = true,
    alertWebhookUrl,
    alertThreshold = 3,
    alertCooldownMs = 60000,
  } = props || {};

  const fields = sensitiveFields || [
    "password", "token", "accessToken", "refreshToken",
    "authorization", "apiKey", "secret",
  ];

  const meta = {
    apiwitness_app_name: appName,
    apiwitness_app_version: appVersion,
    apiwitness_environment: environment,
    apiwitness_record_successful: String(recordSuccessfulRequests),
    apiwitness_sensitive_fields: fields.join(","),
    apiwitness_breadcrumbs: String(enableBreadcrumbs),
    apiwitness_alert_threshold: String(alertThreshold),
    apiwitness_alert_cooldown: String(alertCooldownMs),
  };

  if (alertWebhookUrl) {
    meta.apiwitness_alert_webhook = alertWebhookUrl;
  }

  config = withAndroidManifest(config, (manifestConf) => {
    const mainApp =
      manifestConf.modResults.manifest?.application?.[0];
    if (mainApp?.["meta-data"]) {
      for (const [key, value] of Object.entries(meta)) {
        const idx = mainApp["meta-data"].findIndex(
          (m) => m.$["android:name"] === key
        );
        if (idx >= 0) {
          mainApp["meta-data"][idx].$["android:value"] = value;
        } else {
          mainApp["meta-data"].push({
            $: { "android:name": key, "android:value": value },
          });
        }
      }
    }
    return manifestConf;
  });

  config = withInfoPlist(config, (plistConf) => {
    plistConf.modResults.APIWitnessConfig = meta;
    return plistConf;
  });

  return config;
}

module.exports = withAPIWitness;
