import { requireExactRole } from "@/lib/session";
import { DashboardShell } from "@/components/DashboardShell";
import { GUARDIAN_NAV } from "@/lib/navigation";
import { ROLE_LABELS } from "@/lib/roles";

export default async function GuardianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireExactRole("GUARDIAN");
  return (
    <DashboardShell
      title="Portal do Responsável"
      nav={GUARDIAN_NAV}
      userName={user.name || "Responsável"}
      roleLabel={ROLE_LABELS.GUARDIAN}
    >
      {children}
    </DashboardShell>
  );
}
