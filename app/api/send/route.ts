import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sendEmail } from "@/lib/resend";
import { recordSentEmail } from "@/lib/supabase";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { to, subject, text } = (body ?? {}) as {
    to?: string;
    subject?: string;
    text?: string;
  };

  if (!to || !EMAIL_RE.test(to)) {
    return NextResponse.json({ error: "`to` must be a valid email" }, { status: 400 });
  }
  if (!subject || subject.trim().length === 0) {
    return NextResponse.json({ error: "`subject` is required" }, { status: 400 });
  }
  if (subject.length > 200) {
    return NextResponse.json({ error: "`subject` is too long (max 200)" }, { status: 400 });
  }
  if (!text || text.trim().length === 0) {
    return NextResponse.json({ error: "`text` is required" }, { status: 400 });
  }
  if (text.length > 20000) {
    return NextResponse.json({ error: "`text` is too long (max 20000)" }, { status: 400 });
  }

  let resendId: string | null = null;
  try {
    const result = await sendEmail({
      to,
      subject: subject.trim(),
      text: text.trim(),
      replyTo: session.user.email,
    });
    resendId = result.id;
  } catch (err) {
    console.error("[/api/send] Resend call failed:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Send failed: ${message}` }, { status: 502 });
  }

  try {
    const row = await recordSentEmail({
      userEmail: session.user.email,
      recipient: to,
      subject: subject.trim(),
      body: text.trim(),
      resendId,
    });
    return NextResponse.json({
      id: row.id,
      resendId,
      to,
      subject,
      sentAt: row.sent_at,
    });
  } catch (err) {
    console.error("[/api/send] Supabase record failed (email was sent):", err);
    return NextResponse.json(
      {
        id: null,
        resendId,
        to,
        subject,
        sentAt: new Date().toISOString(),
        warning:
          "Email was sent but could not be saved to history. Check Supabase configuration.",
      },
      { status: 200 },
    );
  }
}
