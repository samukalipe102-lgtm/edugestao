import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { StudentAcademic } from "@/components/StudentAcademic";
import { PageHeader, EmptyState } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default async function GuardianGradesPage() {
  const session = await getSession();
  const guardian = await prisma.guardian.findFirst({
    where: { userId: session?.user?.id },
    include: { students: true },
  });

  const students = guardian?.students ?? [];

  return (
    <div className="space-y-8">
      <PageHeader title="Notas" subtitle="Acompanhe as notas e frequência dos alunos vinculados" />
      {students.length === 0 ? (
        <EmptyState message="Nenhum aluno vinculado a você." />
      ) : (
        students.map((s) => (
          <div key={s.id} className="space-y-4">
            <StudentAcademic studentId={s.id} />
          </div>
        ))
      )}
    </div>
  );
}
