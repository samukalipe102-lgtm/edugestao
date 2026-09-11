import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentTeacher } from "@/lib/teacher";
import { PageHeader, EmptyState } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default async function DiarySelectPage() {
  const teacher = await getCurrentTeacher();
  const assignments = teacher
    ? await prisma.assignment.findMany({
        where: { teacherId: teacher.id },
        include: { classGroup: true, subject: true },
        orderBy: [{ classGroup: { name: "asc" } }, { subject: { name: "asc" } }],
      })
    : [];

  return (
    <div className="space-y-6">
      <PageHeader title="Diário de Classe" subtitle="Escolha uma turma/disciplina para abrir o diário" />
      {assignments.length === 0 ? (
        <EmptyState message="Você ainda não possui turmas/disciplinas atribuídas." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((a) => (
            <Link key={a.id} href={`/professor/diario/${a.id}`} className="card p-5 hover:shadow-md transition">
              <p className="font-semibold text-slate-800">{a.classGroup.name}</p>
              <p className="text-sm text-slate-600">{a.subject.name}</p>
              <span className="mt-2 inline-block text-sm text-brand-600">Abrir diário →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
