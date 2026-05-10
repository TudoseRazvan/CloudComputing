"use client";

import { useState } from "react";

type Tone = "formal" | "friendly" | "concise" | "persuasive" | "apologetic";
type Lang = "en" | "ro";

type Status =
  | { kind: "idle" }
  | { kind: "generating" }
  | { kind: "sending" }
  | { kind: "error"; message: string }
  | { kind: "sent"; to: string; subject: string };

const TONES: { value: Tone; label: string; hint: string }[] = [
  { value: "friendly", label: "Friendly", hint: "warm, casual" },
  { value: "formal", label: "Formal", hint: "respectful, business" },
  { value: "concise", label: "Concise", hint: "brief, no filler" },
  { value: "persuasive", label: "Persuasive", hint: "compelling" },
  { value: "apologetic", label: "Apologetic", hint: "sincere, contrite" },
];

export default function ComposeClient({
  userEmail,
}: {
  userEmail: string;
  userName: string;
}) {
  const [recipient, setRecipient] = useState(userEmail);
  const [tone, setTone] = useState<Tone>("friendly");
  const [language, setLanguage] = useState<Lang>("en");
  const [prompt, setPrompt] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const isGenerating = status.kind === "generating";
  const isSending = status.kind === "sending";
  const busy = isGenerating || isSending;
  const hasDraft = subject.length > 0 || body.length > 0;

  async function generate() {
    if (prompt.trim().length < 3) {
      setStatus({ kind: "error", message: "Write a one-liner about what to say." });
      return;
    }
    setStatus({ kind: "generating" });
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, tone, language, recipientHint: recipient }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setSubject(data.subject ?? "");
      setBody(data.body ?? "");
      setStatus({ kind: "idle" });
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Generation failed",
      });
    }
  }

  async function send() {
    if (!recipient || !subject.trim() || !body.trim()) {
      setStatus({ kind: "error", message: "Recipient, subject and body are required." });
      return;
    }
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: recipient, subject, text: body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Send failed");
      setStatus({ kind: "sent", to: recipient, subject });
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Send failed",
      });
    }
  }

  function reset() {
    setSubject("");
    setBody("");
    setPrompt("");
    setStatus({ kind: "idle" });
  }

  return (
    <div className="space-y-8">
      <PageHeader>
        <p className="eyebrow">Compose</p>
        <h1 className="mt-2 display text-2xl sm:text-3xl">
          Tell it the gist. Edit. Send.
        </h1>
      </PageHeader>

      {status.kind === "error" && <Banner kind="error">{status.message}</Banner>}
      {status.kind === "sent" && (
        <Banner kind="success">
          <span className="flex flex-wrap items-baseline justify-between gap-2">
            <span>
              Sent to{" "}
              <span className="font-mono text-[13px]">{status.to}</span>
            </span>
            <button
              onClick={reset}
              className="font-mono text-xs underline-offset-2 hover:underline"
            >
              new email →
            </button>
          </span>
        </Banner>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:gap-12">
        <section className="space-y-6">
          <div className="flex items-baseline justify-between">
            <h2 className="display text-base">Brief</h2>
            <span className="font-mono text-[11px] text-zinc-400">step 1 / 2</span>
          </div>

          <div className="space-y-5">
            <div>
              <label htmlFor="to" className="field-label">
                Recipient
              </label>
              <input
                id="to"
                type="email"
                required
                className="input-base font-mono"
                placeholder="someone@example.com"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                disabled={busy}
              />
              <p className="mt-1.5 text-[12px] text-zinc-500">
                On the free Resend plan, the only allowed recipient is your
                own Resend-registered address.
              </p>
            </div>

            <div className="grid grid-cols-[1.4fr_1fr] gap-4">
              <div>
                <label htmlFor="tone" className="field-label">
                  Tone
                </label>
                <select
                  id="tone"
                  className="input-base"
                  value={tone}
                  onChange={(e) => setTone(e.target.value as Tone)}
                  disabled={busy}
                >
                  {TONES.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label} — {o.hint}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="lang" className="field-label">
                  Language
                </label>
                <select
                  id="lang"
                  className="input-base"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Lang)}
                  disabled={busy}
                >
                  <option value="en">English</option>
                  <option value="ro">Română</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="prompt" className="field-label">
                What do you want to say?
              </label>
              <textarea
                id="prompt"
                rows={5}
                className="input-base"
                placeholder="e.g. ask my professor for a one-week extension because I'm finishing another project"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={busy}
                maxLength={2000}
              />
              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="font-mono text-[11px] text-zinc-400">
                  {prompt.length} / 2,000
                </p>
                <button
                  type="button"
                  onClick={generate}
                  disabled={busy || prompt.trim().length < 3}
                  className="btn-primary"
                >
                  {isGenerating ? (
                    <>
                      <Spinner /> Drafting…
                    </>
                  ) : (
                    <>Draft with AI →</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6 lg:border-l lg:border-zinc-200 lg:pl-12 lg:dark:border-zinc-800">
          <div className="flex items-baseline justify-between">
            <h2 className="display text-base">Draft</h2>
            <span className="font-mono text-[11px] text-zinc-400">step 2 / 2</span>
          </div>

          {!hasDraft && !isGenerating ? (
            <EmptyDraft />
          ) : (
            <div className="space-y-5">
              <div>
                <label htmlFor="subject" className="field-label">
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  className="input-base text-[15px] font-medium"
                  placeholder="Appears after the AI drafts your email"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  maxLength={200}
                  disabled={busy}
                />
              </div>
              <div>
                <label htmlFor="body" className="field-label">
                  Body
                </label>
                <textarea
                  id="body"
                  rows={16}
                  className="input-base font-mono text-[13px] leading-relaxed"
                  placeholder="The AI draft will land here. Edit before sending."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  maxLength={20000}
                  disabled={busy}
                />
                <p className="mt-1.5 text-right font-mono text-[11px] text-zinc-400">
                  {body.length.toLocaleString()} / 20,000
                </p>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={reset}
                  className="btn-ghost"
                  disabled={busy || (!subject && !body && !prompt)}
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={send}
                  disabled={busy || !subject || !body || !recipient}
                  className="btn-primary"
                >
                  {isSending ? (
                    <>
                      <Spinner /> Sending…
                    </>
                  ) : (
                    <>Send →</>
                  )}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function PageHeader({ children }: { children: React.ReactNode }) {
  return <header>{children}</header>;
}

function EmptyDraft() {
  return (
    <div className="dot-grid flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 px-6 py-16 text-center dark:border-zinc-800">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-400">
        nothing yet
      </p>
      <p className="mt-3 max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
        Fill in the brief on the left and press{" "}
        <span className="rounded bg-white px-1.5 py-0.5 font-mono text-[12px] text-zinc-900 ring-1 ring-zinc-200 dark:bg-zinc-950 dark:text-zinc-100 dark:ring-zinc-800">
          Draft with AI
        </span>{" "}
        — the result will appear here.
      </p>
    </div>
  );
}

function Banner({
  kind,
  children,
}: {
  kind: "error" | "success";
  children: React.ReactNode;
}) {
  const styles =
    kind === "error"
      ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
      : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200";
  return (
    <div className={`rounded-md border px-4 py-2.5 text-sm ${styles}`}>{children}</div>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2"
        strokeOpacity="0.25"
      />
      <path
        d="M21 12a9 9 0 0 1-9 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
