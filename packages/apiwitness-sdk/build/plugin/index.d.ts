import { ConfigPlugin } from "@expo/config-plugins";
type APIWitnessPluginProps = {
    appName?: string;
    appVersion?: string;
    environment?: string;
    recordSuccessfulRequests?: boolean;
    sensitiveFields?: string[];
    enableBreadcrumbs?: boolean;
    alertWebhookUrl?: string;
    alertThreshold?: number;
    alertCooldownMs?: number;
};
declare const withAPIWitness: ConfigPlugin<APIWitnessPluginProps>;
export default withAPIWitness;
//# sourceMappingURL=index.d.ts.map