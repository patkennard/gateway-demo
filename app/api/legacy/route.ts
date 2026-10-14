import { getLegacyStatuses } from "@/lib/legacy";

// Exposes the simulated AWS API over HTTP. ?fail=1 makes it error.
export async function GET(request: Request) {
  const fail = new URL(request.url).searchParams.get("fail") === "1";
  try {
    return Response.json(await getLegacyStatuses(fail));
  } catch {
    return Response.json({ error: "Upstream unavailable", source: "legacy-aws" }, { status: 502 });
  }
}
