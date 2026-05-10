"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import SignInButton from "./SignInButton";
import SignOutButton from "./SignOutButton";

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const authed = status === "authenticated" && !!session?.user;

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="group flex items-baseline gap-2"
          aria-label="MailMind home"
        >
          <span className="font-mono text-sm font-semibold tracking-tight text-zinc-900 group-hover:text-zinc-700 dark:text-zinc-100 dark:group-hover:text-zinc-300">
            mailmind
          </span>
          <span className="hidden font-mono text-[11px] text-zinc-400 sm:inline dark:text-zinc-600">
            /v1
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {authed && (
            <>
              <NavLink href="/compose" current={pathname?.startsWith("/compose")}>
                compose
              </NavLink>
              <NavLink href="/history" current={pathname?.startsWith("/history")}>
                history
              </NavLink>
              <span className="mx-2 hidden h-4 w-px bg-zinc-200 sm:inline-block dark:bg-zinc-800" />
            </>
          )}

          {authed ? (
            <div className="flex items-center gap-2">
              {session?.user?.image && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={session.user.image}
                  alt=""
                  width={24}
                  height={24}
                  className="h-6 w-6 rounded-full ring-1 ring-zinc-200 dark:ring-zinc-800"
                />
              )}
              <SignOutButton />
            </div>
          ) : (
            <SignInButton />
          )}
        </nav>
      </div>
    </header>
  );
}

function NavLink({
  href,
  current,
  children,
}: {
  href: string;
  current?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={
        "rounded px-2 py-1 font-mono text-xs transition " +
        (current
          ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100"
          : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100")
      }
    >
      {children}
    </Link>
  );
}
