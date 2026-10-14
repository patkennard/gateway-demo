import { generateText } from "ai";
import { getLegacyStatuses } from "@/lib/legacy";

// Passing a plain "provider/model" string makes the AI SDK route through
// Vercel AI Gateway. Auth comes from AI_GATEWAY_API_KEY (local) or OIDC (on Vercel).
// Override with the AI_MODEL env var (e.g. in Vercel) without a code change.
const MODEL = process.env.AI_MODEL ?? "poolside/laguna-s-2.1-free";

export async function GET(request: Request) {
  const fail = new URL(request.url).searchParams.get("fail") === "1";

  let data;
  try {
    data = await getLegacyStatuses(fail);
  } catch {
    return Response.json({ error: "Legacy API failed" }, { status: 502 });
  }

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
