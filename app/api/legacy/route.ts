// Deliberately broken: always returns a 500 error.
export async function GET() {
  return Response.json({ error: "Internal Server Error", source: "legacy-aws" }, { status: 500 });
}
