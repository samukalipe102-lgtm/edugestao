import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentTeacher } from "@/lib/teacher";
import { PageHeader, EmptyState } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default async function TeacherClassesPage() {
  const teacher = await getCurrentTeacher();
  const assignments = teacher
    ? await prisma.assignment.findMany({
        where: { teacherId: teacher.id },
        include: {
          classGroup: { include: { _count: { select: { students: true } } } },
          subject: true,
        },
        orderBy: [{ classGroup: { name: "asc" } }, { subject: { name: "asc" } }],
      })
    : [];

  return (
    <div className="space-y-6">
      <PageHeader title="Minhas Turmas" subtitle="Selecione uma turma/disciplina para abrir o diário de classe" />

      {assignments.length === 0 ? (
        <EmptyState message="Você ainda não possui turmas/disciplinas atribuídas." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((a) => (
            <Link
              key={a.id}
              href={`/professor/diario/${a.id}`}
              className="card p-5 hover:shadow-md transition flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">{a.classGroup.name}</span>
                <span className="badge bg-brand-50 text-brand-700">{a.classGroup.schoolYear}</span>
              </div>
              <p className="text-sm text-slate-600">{a.subject.name}</p>
              <p className="text-xs text-slate-400">🎓 {a.classGroup._count.students} alunos</p>
              <span className="mt-2 text-sm text-brand-600">Abrir diário →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
