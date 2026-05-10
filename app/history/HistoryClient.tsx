"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type SentEmail = {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  sent_at: string;
  resend_id: string | null;
};

type LoadState =
  | { kind: "loading" }
  | { kind: "loaded"; items: SentEmail[] }
  | { kind: "error"; message: string };

export default function HistoryClient() {
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [clearing, setClearing] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  async function load() {
    setState({ kind: "loading" });
    try {
      const res = await fetch("/api/history", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load history");
      setState({ kind: "loaded", items: data.items ?? [] });
    } catch (err) {
      setState({
        kind: "error",
        message: err instanceof Error ? err.message : "Failed to load history",
      });
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleClear() {
    if (!confirm("Delete all your sent-email records? This cannot be undone.")) return;
    setClearing(true);
    try {
      const res = await fetch("/api/history", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Clear failed");
      setState({ kind: "loaded", items: [] });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Clear failed");
    } finally {
      setClearing(false);
    }
  }

  const items = state.kind === "loaded" ? state.items : [];

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (it) =>
        it.subject.toLowerCase().includes(q) ||
        it.recipient.toLowerCase().includes(q) ||
        it.body.toLowerCase().includes(q),
    );
  }, [items, query]);

  const oldest = items.length > 0 ? items[items.length - 1].sent_at : null;
  const newest = items.length > 0 ? items[0].sent_at : null;

  return (
    <div className="grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-14">
      <aside className="space-y-8 lg:sticky lg:top-20 lg:self-start">
        <header>
          <p className="eyebrow">History</p>
          <h1 className="mt-2 display text-2xl sm:text-3xl">
            Everything you&apos;ve sent.
          </h1>
        </header>

        <dl className="space-y-4 border-l border-zinc-200 pl-4 dark:border-zinc-800">
          <Stat
            label="emails sent"
            value={state.kind === "loading" ? "…" : items.length.toLocaleString()}
          />
          {newest && <Stat label="last sent" value={formatRelative(newest)} />}
          {oldest && oldest !== newest && (
            <Stat label="first sent" value={formatRelative(oldest)} />
          )}
        </dl>

        {items.length > 0 && (
          <div className="space-y-3">
            <input
              type="search"
              placeholder="Search subject, recipient, body…"
              className="input-base"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              onClick={handleClear}
              disabled={clearing}
              className="text-[12px] text-zinc-500 underline-offset-4 hover:text-red-600 hover:underline dark:hover:text-red-400"
            >
              {clearing ? "clearing…" : "Clear all history"}
            </button>
          </div>
        )}
      </aside>

      <section className="space-y-2">
        {state.kind === "loading" && <SkeletonList />}

        {state.kind === "error" && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
            <p className="font-medium">Couldn&apos;t load history</p>
            <p className="mt-1 font-mono text-[12px] opacity-80">{state.message}</p>
            <button
              onClick={load}
              className="mt-2 font-mono text-xs underline-offset-2 hover:underline"
            >
              retry →
            </button>
          </div>
        )}

        {state.kind === "loaded" && items.length === 0 && (
          <div className="dot-grid flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 px-6 py-20 text-center dark:border-zinc-800">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-400">
              empty
            </p>
            <p className="mt-3 max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
              You haven&apos;t sent anything yet. The history shows up here once
              you do.
            </p>
            <Link href="/compose" className="btn-primary mt-5">
              Write your first email →
            </Link>
          </div>
        )}

        {state.kind === "loaded" &&
          items.length > 0 &&
          filtered.length === 0 && (
            <p className="font-mono text-[12px] text-zinc-500">
              No matches for &ldquo;{query}&rdquo;.
            </p>
          )}

        <ul className="space-y-2">
          {filtered.map((it) => {
            const open = openId === it.id;
            return (
              <li key={it.id} className="panel transition hover:border-zinc-300 dark:hover:border-zinc-700">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : it.id)}
                  className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 px-4 py-3 text-left sm:px-5"
                  aria-expanded={open}
                >
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-medium text-zinc-900 dark:text-zinc-100">
                      {it.subject}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-[12px] text-zinc-500">
                      <span className="text-zinc-400">to</span> {it.recipient}
                    </p>
                  </div>
                  <time className="shrink-0 text-right font-mono text-[11px] tabular-nums text-zinc-500">
                    <span className="block">{formatDate(it.sent_at)}</span>
                    <span className="block text-zinc-400">{formatTime(it.sent_at)}</span>
                  </time>
                </button>

                {open && (
                  <div className="space-y-3 border-t border-zinc-200 px-4 py-4 sm:px-5 dark:border-zinc-800">
                    <pre className="whitespace-pre-wrap font-mono text-[12.5px] leading-relaxed text-zinc-700 dark:text-zinc-300">
{it.body}
                    </pre>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-[11px]">
                      {it.resend_id && (
                        <span className="font-mono text-zinc-400">
                          <span className="uppercase tracking-wider">resend</span>{" "}
                          <span className="text-zinc-500">{it.resend_id}</span>
                        </span>
                      )}
                      <span className="font-mono text-zinc-400">
                        <span className="uppercase tracking-wider">id</span>{" "}
                        <span className="text-zinc-500">{it.id.slice(0, 8)}…</span>
                      </span>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-zinc-500">{label}</dt>
      <dd className="mt-1 text-base text-zinc-900 dark:text-zinc-100">{value}</dd>
    </div>
  );
}

function SkeletonList() {
  return (
    <ul className="space-y-2">
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          className="panel h-[68px] animate-pulse opacity-50"
          style={{ animationDelay: `${i * 80}ms` }}
        />
      ))}
    </ul>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function formatRelative(iso: string): string {
  try {
    const d = new Date(iso);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86_400) return `${Math.floor(diff / 3600)} h ago`;
    if (diff < 7 * 86_400) return `${Math.floor(diff / 86_400)} d ago`;
    return formatDate(iso);
  } catch {
    return iso;
  }
}
