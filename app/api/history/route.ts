import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { clearSentEmails, listSentEmails } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const rows = await listSentEmails(session.user.email);
    return NextResponse.json({ items: rows });
  } catch (err) {
    console.error("[/api/history GET] failed:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const removed = await clearSentEmails(session.user.email);
    return NextResponse.json({ removed });
  } catch (err) {
    console.error("[/api/history DELETE] failed:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
