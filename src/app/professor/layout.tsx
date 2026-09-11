import { requireExactRole } from "@/lib/session";
import { DashboardShell } from "@/components/DashboardShell";
import { TEACHER_NAV } from "@/lib/navigation";
import { ROLE_LABELS } from "@/lib/roles";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireExactRole("TEACHER");
  return (
    <DashboardShell
      title="Portal do Professor"
      nav={TEACHER_NAV}
      userName={user.name || "Professor(a)"}
      roleLabel={ROLE_LABELS.TEACHER}
    >
      {children}
    </DashboardShell>
  );
}
