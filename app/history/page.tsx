import { auth } from "@/auth";
import { redirect } from "next/navigation";
import HistoryClient from "./HistoryClient";

export const metadata = { title: "History — MailMind" };

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user) redirect("/");
  return <HistoryClient />;
}
