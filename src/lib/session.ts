import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { homeForRole } from "@/lib/roles";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireUser() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  return session.user;
}

export async function requireRole(role: string) {
  const user = await requireUser();
  if (user.role !== role && user.role !== "ADMIN") {
    redirect(homeForRole(user.role || ""));
  }
  return user;
}

/** Requer exatamente este perfil (ADMIN não pode "personificar" quando exclusivo). */
export async function requireExactRole(role: string) {
  const user = await requireUser();
  if (user.role !== role) {
    redirect(homeForRole(user.role || ""));
  }
  return user;
}
