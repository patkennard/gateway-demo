// Stands in for the existing AWS-hosted API. Real one would be fetched over HTTP;
// here we return canned data and let ?fail=1 simulate an upstream outage.

export type ServiceStatus = {
  service: string;
  status: "operational" | "degraded" | "down";
  latencyMs: number;
  region: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  if (searchParams.get("fail") === "1") {
    return Response.json(
      { error: "Upstream unavailable", source: "legacy-aws" },
      { status: 502 },
    );
  }

  const services: ServiceStatus[] = [
    { service: "auth", status: "operational", latencyMs: 42, region: "us-east-1" },
    { service: "billing", status: "degraded", latencyMs: 870, region: "us-east-1" },
    { service: "search", status: "operational", latencyMs: 115, region: "us-west-2" },
    { service: "notifications", status: "down", latencyMs: 0, region: "eu-west-1" },
  ];

  return Response.json({ services, checkedAt: new Date().toISOString() });
}
