import { requireExactRole } from "@/lib/session";
import { DashboardShell } from "@/components/DashboardShell";
import { ADMIN_NAV } from "@/lib/navigation";
import { ROLE_LABELS } from "@/lib/roles";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireExactRole("ADMIN");
  return (
    <DashboardShell
      title="Administração"
      nav={ADMIN_NAV}
      userName={user.name || "Administrador"}
      roleLabel={ROLE_LABELS.ADMIN}
    >
      {children}
    </DashboardShell>
  );
}
