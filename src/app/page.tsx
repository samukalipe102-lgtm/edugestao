import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { homeForRole } from "@/lib/roles";

export default async function Home() {
  const session = await getSession();
  if (session?.user) {
    redirect(homeForRole(session.user.role || ""));
  }
  redirect("/login");
}
