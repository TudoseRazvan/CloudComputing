import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type SentEmailRow = {
  id: string;
  user_email: string;
  recipient: string;
  subject: string;
  body: string;
  resend_id: string | null;
  sent_at: string;
};

let cached: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local",
    );
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "X-Client-Info": "mailmind-server" } },
  });
  return cached;
}

export async function recordSentEmail(input: {
  userEmail: string;
  recipient: string;
  subject: string;
  body: string;
  resendId: string | null;
}): Promise<SentEmailRow> {
  const { data, error } = await getClient()
    .from("sent_emails")
    .insert({
      user_email: input.userEmail,
      recipient: input.recipient,
      subject: input.subject,
      body: input.body,
      resend_id: input.resendId,
    })
    .select()
    .single<SentEmailRow>();
  if (error) throw new Error(`Supabase insert failed: ${error.message}`);
  if (!data) throw new Error("Supabase insert returned no row");
  return data;
}

export async function listSentEmails(userEmail: string, limit = 50): Promise<SentEmailRow[]> {
  const { data, error } = await getClient()
    .from("sent_emails")
    .select("*")
    .eq("user_email", userEmail)
    .order("sent_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Supabase select failed: ${error.message}`);
  return (data ?? []) as SentEmailRow[];
}

export async function clearSentEmails(userEmail: string): Promise<number> {
  const { error, count } = await getClient()
    .from("sent_emails")
    .delete({ count: "exact" })
    .eq("user_email", userEmail);
  if (error) throw new Error(`Supabase delete failed: ${error.message}`);
  return count ?? 0;
}
