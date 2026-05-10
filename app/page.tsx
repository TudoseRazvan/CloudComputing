import Link from "next/link";
import { auth } from "@/auth";
import SignInButton from "@/components/SignInButton";

export default async function HomePage() {
  const session = await auth();
  const authed = !!session?.user;

  return (
    <div className="space-y-24 sm:space-y-28">
      <Hero authed={authed} />
      <Example />
      <Stack />
    </div>
  );
}

function Hero({ authed }: { authed: boolean }) {
  return (
    <section className="hero-bg relative -mx-5 -mt-10 px-5 pt-12 pb-2 sm:-mx-8 sm:-mt-14 sm:px-8 sm:pt-16 lg:-mx-12 lg:px-12 lg:pt-24">
      <div className="grid gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-end">
        <div className="max-w-3xl space-y-6">
          <span className="eyebrow">A small email assistant</span>
          <h1 className="display text-[2.4rem] leading-[1.05] sm:text-6xl lg:text-[5rem] lg:leading-[1]">
            Drafting an email
            <br className="hidden sm:block" />{" "}
            <span className="text-zinc-400 dark:text-zinc-600">
              shouldn&apos;t take longer
            </span>
            <br className="hidden sm:block" />{" "}
            <span className="text-zinc-400 dark:text-zinc-600">
              than the idea.
            </span>
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-[17px]">
            Tell MailMind the gist. It writes a draft with Gemini. You tweak
            it, hit send, and Resend delivers it. Supabase remembers what you
            sent.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
            {authed ? (
              <Link href="/compose" className="btn-primary">
                Open the composer
                <span aria-hidden>→</span>
              </Link>
            ) : (
              <SignInButton />
            )}
            <a
              href="#example"
              className="text-sm text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
            >
              See an example
            </a>
          </div>
        </div>

        <aside className="hidden lg:block">
          <dl className="ml-auto w-fit space-y-3 text-right font-mono text-[12px] tabular-nums">
            <Stat label="cloud services" value="3" />
            <Stat label="auth" value="OAuth 2.0" />
            <Stat label="latency" value="≈3-5s" />
            <Stat label="bundle" value="~110 kB" />
          </dl>
        </aside>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-end gap-3">
      <dt className="text-zinc-400 dark:text-zinc-600">{label}</dt>
      <dd className="text-zinc-900 dark:text-zinc-100">{value}</dd>
    </div>
  );
}

function Example() {
  return (
    <section id="example" className="space-y-8">
      <header className="max-w-2xl space-y-3">
        <span className="eyebrow">An example</span>
        <h2 className="display text-2xl sm:text-[28px]">
          One line in. A whole email out.
        </h2>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.6fr)] lg:items-stretch lg:gap-6">
        <div className="panel relative flex flex-col p-5 sm:p-6">
          <p className="eyebrow mb-3">You type</p>
          <p className="flex-1 text-base leading-relaxed text-zinc-800 dark:text-zinc-200">
            <span className="text-zinc-400 dark:text-zinc-600">›</span> ask my
            landlord to fix the heater, mention it&apos;s been three days and
            the apartment is cold
          </p>
          <p className="mt-5 inline-flex w-fit items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-mono text-[11px] text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            tone:{" "}
            <span className="text-zinc-900 dark:text-zinc-100">formal</span>{" "}
            · language:{" "}
            <span className="text-zinc-900 dark:text-zinc-100">en</span>
          </p>
        </div>

        <div
          aria-hidden
          className="hidden items-center justify-center text-zinc-300 dark:text-zinc-700 lg:flex"
        >
          <ArrowRight />
        </div>
        <div
          aria-hidden
          className="flex items-center justify-center py-1 text-zinc-300 dark:text-zinc-700 lg:hidden"
        >
          <ArrowDown />
        </div>

        <div className="panel overflow-hidden">
          <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-5 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <span className="ml-2 font-mono text-[11px] text-zinc-500">
              draft.eml
            </span>
          </div>
          <div className="space-y-3 p-5 sm:p-6">
            <p className="eyebrow">Subject</p>
            <p className="text-[15px] font-medium text-zinc-900 dark:text-zinc-100">
              Heating repair request — third day without heat
            </p>
            <div className="divider my-1" />
            <p className="eyebrow">Body</p>
            <div className="space-y-3 text-[14px] leading-relaxed text-zinc-700 dark:text-zinc-300">
              <p>Dear Mr. Anderson,</p>
              <p>
                I&apos;m writing to ask you to look at the heating in the
                apartment as soon as possible. It has not worked since Friday
                afternoon — this is now the third day and it has become
                difficult to keep the rooms warm.
              </p>
              <p>
                Could you arrange for a technician to come by this week?
                I&apos;m home most evenings after 17:00.
              </p>
              <p>
                Thank you,
                <br />
                Răzvan
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stack() {
  return (
    <section className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <header className="space-y-3">
        <span className="eyebrow">Built with</span>
        <h2 className="display text-2xl sm:text-[28px]">
          Three cloud services,
          <br />
          one Next.js app.
        </h2>
      </header>
      <div className="space-y-5">
        <p className="text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400">
          Authentication is handled by{" "}
          <TechLink href="https://authjs.dev">Auth.js</TechLink> with the
          Google OAuth provider — the session lives in a JWT cookie so it
          survives a page refresh. The drafting itself runs on{" "}
          <TechLink href="https://ai.google.dev">Google Gemini</TechLink>; the
          delivery on <TechLink href="https://resend.com">Resend</TechLink>;
          the per-user history in{" "}
          <TechLink href="https://supabase.com">Supabase</TechLink>. Hosted on{" "}
          <TechLink href="https://vercel.com">Vercel</TechLink>.
        </p>
        <p className="font-mono text-[12px] text-zinc-500">
          Source —{" "}
          <a
            href="https://github.com/TudoseRazvan/CloudComputing"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
          >
            github.com/TudoseRazvan/CloudComputing
          </a>
        </p>
      </div>
    </section>
  );
}

function TechLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
    >
      {children}
    </a>
  );
}

function ArrowRight() {
  return (
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12h14M13 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowDown() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5v14M5 13l7 7 7-7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
