import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { computeAverage, situationLabel } from "@/lib/grades";

export const dynamic = "force-dynamic";

export default async function AdminGradesPage() {
  const assignments = await prisma.assignment.findMany({
    include: {
      classGroup: true,
      subject: true,
      teacher: { include: { user: true } },
      assessments: true,
      grades: true,
    },
    orderBy: [{ classGroup: { name: "asc" } }, { subject: { name: "asc" } }],
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Notas & Avaliações" subtitle="Panorama por turma e disciplina (somente leitura)" />

      {assignments.length === 0 ? (
        <EmptyState message="Nenhuma atribuição cadastrada." />
      ) : (
        assignments.map((a) => {
          const students = a.grades.reduce((set, g) => set.add(g.studentId), new Set<string>());
          // média da turma nesta disciplina
          const byStudent: Record<string, { value: number; maxValue: number }[]> = {};
          for (const g of a.grades) {
            const assess = a.assessments.find((x) => x.id === g.assessmentId);
            if (!assess) continue;
            (byStudent[g.studentId] ??= []).push({ value: g.value, maxValue: assess.maxValue });
          }
          const avgs = Object.values(byStudent).map((gs) => computeAverage(gs)).filter((x): x is number => x !== null);
          const classAvg = avgs.length ? computeAverage(avgs.map((v) => ({ value: v, maxValue: 10 }))) : null;
          const sit = situationLabel(classAvg);
          return (
            <div key={a.id} className="card p-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-800">{a.classGroup.name} · {a.subject.name}</p>
                <p className="text-sm text-slate-500">Prof. {a.teacher.user.name}</p>
              </div>
              <div className="flex gap-6 text-sm">
                <div className="text-center">
                  <p className="text-slate-400 text-xs uppercase">Avaliações</p>
                  <p className="font-semibold text-slate-800">{a.assessments.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 text-xs uppercase">Alunos com nota</p>
                  <p className="font-semibold text-slate-800">{students.size}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 text-xs uppercase">Média da turma</p>
                  <p className="font-semibold text-brand-700">{classAvg === null ? "—" : classAvg.toFixed(2)}</p>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
