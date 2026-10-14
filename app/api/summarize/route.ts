import { generateText } from "ai";

// Passing a plain "provider/model" string makes the AI SDK route through
// Vercel AI Gateway. Auth comes from AI_GATEWAY_API_KEY (local) or OIDC (on Vercel).
const MODEL = "anthropic/claude-haiku-5.5";

export async function GET(request: Request) {
  // Forward ?fail=1 so the whole chain can be tested end to end.
  const { searchParams } = new URL(request.url);
  const legacyUrl = new URL("/api/legacy", request.url);
  if (searchParams.get("fail") === "1") legacyUrl.searchParams.set("fail", "1");

  let legacy: Response;
  try {
    legacy = await fetch(legacyUrl, { cache: "no-store" });
  } catch {
    return Response.json({ error: "Could not reach legacy API" }, { status: 502 });
  }
  if (!legacy.ok) {
    return Response.json(
      { error: "Legacy API failed", upstreamStatus: legacy.status },
      { status: 502 },
    );
  }
  const data = await legacy.json();

  try {
    const { text } = await generateText({
      model: MODEL,
      prompt:
        "Write exactly two sentences summarizing the health of these services " +
        "for an on-call engineer. Name any service that is not operational.\n\n" +
        JSON.stringify(data),
    });
    return Response.json({ summary: text, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: "Summarization failed", detail: message, data }, { status: 500 });
  }
}
