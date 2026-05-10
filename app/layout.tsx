import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import Header from "@/components/Header";
import "./globals.css";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "MailMind",
  description:
    "A small tool that drafts emails with AI and sends them. Cloud Computing project — Tudose Razvan, gr. 1147.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen font-sans" suppressHydrationWarning>
        <SessionProvider session={session}>
          <Header />
          <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
            {children}
          </main>
          <footer className="mx-auto mt-20 w-full max-w-6xl px-5 pb-12 sm:px-8 lg:px-12">
            <div className="divider mb-5" />
            <div className="flex flex-wrap items-baseline justify-between gap-2 text-[12px] text-zinc-500">
              <p>
                Made by{" "}
                <span className="text-zinc-900 dark:text-zinc-200">
                  Tudose Răzvan
                </span>{" "}
                — group 1147 · Cloud Computing course
              </p>
              <a
                href="https://github.com/TudoseRazvan/CloudComputing"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              >
                source ↗
              </a>
            </div>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
