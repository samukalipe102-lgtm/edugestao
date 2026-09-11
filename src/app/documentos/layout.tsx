import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function DocumentosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  // Documentos oficiais: apenas ADMIN
  if (user.role !== "ADMIN") redirect("/");
  return <>{children}</>;
}
