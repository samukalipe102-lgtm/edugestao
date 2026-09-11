import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentTeacher } from "@/lib/teacher";
import { PageHeader, EmptyState } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default async function TeacherLessonsPage() {
  const teacher = await getCurrentTeacher();
  const lessons = teacher
    ? await prisma.lesson.findMany({
        where: { assignment: { teacherId: teacher.id }, planned: false },
        include: { assignment: { include: { classGroup: true, subject: true } } },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        take: 100,
      })
    : [];

  return (
    <div className="space-y-6">
      <PageHeader title="Registros de Aula" subtitle="Aulas ministradas em suas turmas" />
      {lessons.length === 0 ? (
        <EmptyState message="Nenhuma aula registrada ainda. Registre pelo diário de cada turma." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Data</th><th>Turma</th><th>Disciplina</th><th>Aula</th><th>Tema</th><th></th>
              </tr>
            </thead>
            <tbody>
              {lessons.map((l) => (
                <tr key={l.id}>
                  <td>{l.date ? l.date.toISOString().slice(0, 10) : "—"}</td>
                  <td>{l.assignment.classGroup.name}</td>
                  <td>{l.assignment.subject.name}</td>
                  <td>{l.number ?? "—"}</td>
                  <td className="font-medium text-slate-800">{l.topic}</td>
                  <td className="text-right">
                    <Link href={`/professor/diario/${l.assignmentId}`} className="text-brand-600 hover:underline text-sm">Diário →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
