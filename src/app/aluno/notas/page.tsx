import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { StudentAcademic } from "@/components/StudentAcademic";
import { PageHeader, EmptyState } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default async function StudentGradesPage() {
  const session = await getSession();
  const student = await prisma.student.findFirst({ where: { userId: session?.user?.id } });

  return (
    <div className="space-y-6">
      <PageHeader title="Minhas Notas" subtitle="Notas, médias e frequência por disciplina" />
      {student ? (
        <StudentAcademic studentId={student.id} />
      ) : (
        <EmptyState message="Seu usuário não está vinculado a um cadastro de aluno." />
      )}
    </div>
  );
}
