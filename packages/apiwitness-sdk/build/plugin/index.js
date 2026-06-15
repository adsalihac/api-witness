import { withAndroidManifest, withInfoPlist } from "@expo/config-plugins";
const withAPIWitness = (config, { appName = config.name || "App", appVersion = config.version || "1.0.0", environment = "production", recordSuccessfulRequests = false, sensitiveFields, enableBreadcrumbs = true, alertWebhookUrl, alertThreshold = 3, alertCooldownMs = 60000, } = {}) => {
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
        const mainApp = manifestConf.modResults.manifest?.application?.[0];
        if (mainApp?.["meta-data"]) {
            for (const [key, value] of Object.entries(meta)) {
                const existing = mainApp["meta-data"].findIndex((m) => m["$"]["android:name"] === key);
                if (existing >= 0) {
                    mainApp["meta-data"][existing]["$"]["android:value"] = value;
                }
                else {
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
};
export default withAPIWitness;
//# sourceMappingURL=index.js.map