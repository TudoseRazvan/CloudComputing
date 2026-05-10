import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateEmail, type GenerateEmailInput } from "@/lib/gemini";

export const runtime = "nodejs";

const ALLOWED_TONES = ["formal", "friendly", "concise", "persuasive", "apologetic"] as const;
const ALLOWED_LANGS = ["en", "ro"] as const;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = body as Partial<GenerateEmailInput>;

  if (typeof data.prompt !== "string" || data.prompt.trim().length < 3) {
    return NextResponse.json(
      { error: "`prompt` is required (min 3 characters)" },
      { status: 400 },
    );
  }
  if (data.prompt.length > 2000) {
    return NextResponse.json({ error: "`prompt` is too long (max 2000)" }, { status: 400 });
  }
  const tone = ALLOWED_TONES.includes(data.tone as never) ? data.tone! : "friendly";
  const language = ALLOWED_LANGS.includes(data.language as never) ? data.language! : "en";

  try {
    const result = await generateEmail({
      prompt: data.prompt.trim(),
      tone,
      language,
      recipientHint: data.recipientHint?.toString().slice(0, 200),
      senderName: session.user.name ?? undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/generate] Gemini call failed:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `AI generation failed: ${message}` }, { status: 502 });
  }
}
