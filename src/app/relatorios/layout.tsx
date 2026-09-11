import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function RelatoriosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/");
  return <>{children}</>;
}
