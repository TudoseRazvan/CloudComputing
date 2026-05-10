"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded px-2 py-1 font-mono text-xs text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      aria-label="Sign out"
    >
      sign out
    </button>
  );
}
