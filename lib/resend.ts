import { Resend } from "resend";

export type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
};

export type SendEmailResult = {
  id: string;
};

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  const from = process.env.RESEND_FROM ?? "MailMind <onboarding@resend.dev>";

  const resend = new Resend(apiKey);

  const html = input.text
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`)
    .join("");

  const { data, error } = await resend.emails.send({
    from,
    to: [input.to],
    subject: input.subject,
    text: input.text,
    html,
    replyTo: input.replyTo,
  });

  if (error) {
    throw new Error(error.message ?? "Failed to send email");
  }
  if (!data?.id) {
    throw new Error("Resend returned no message id");
  }
  return { id: data.id };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
