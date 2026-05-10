import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ComposeClient from "./ComposeClient";

export const metadata = { title: "Compose — MailMind" };

export default async function ComposePage() {
  const session = await auth();
  if (!session?.user) redirect("/");
  return <ComposeClient userEmail={session.user.email ?? ""} userName={session.user.name ?? ""} />;
}
