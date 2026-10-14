// Stands in for the existing AWS-hosted API. Swap the body for a real fetch() later.

export type ServiceStatus = {
  service: string;
  status: "operational" | "degraded" | "down";
  latencyMs: number;
  region: string;
};

export type LegacyPayload = { services: ServiceStatus[]; checkedAt: string };

export async function getLegacyStatuses(fail = false): Promise<LegacyPayload> {
  if (fail) throw new Error("Upstream unavailable (legacy-aws)");

  return {
    services: [
      { service: "auth", status: "operational", latencyMs: 42, region: "us-east-1" },
      { service: "billing", status: "degraded", latencyMs: 870, region: "us-east-1" },
      { service: "search", status: "operational", latencyMs: 115, region: "us-west-2" },
      { service: "notifications", status: "down", latencyMs: 0, region: "eu-west-1" },
    ],
    checkedAt: new Date().toISOString(),
  };
}
