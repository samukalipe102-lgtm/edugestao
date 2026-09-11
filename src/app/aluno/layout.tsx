import { requireExactRole } from "@/lib/session";
import { DashboardShell } from "@/components/DashboardShell";
import { STUDENT_NAV } from "@/lib/navigation";
import { ROLE_LABELS } from "@/lib/roles";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireExactRole("STUDENT");
  return (
    <DashboardShell
      title="Portal do Aluno"
      nav={STUDENT_NAV}
      userName={user.name || "Aluno(a)"}
      roleLabel={ROLE_LABELS.STUDENT}
    >
      {children}
    </DashboardShell>
  );
}
