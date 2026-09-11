import { prisma } from "@/lib/prisma";
import { computeAverage, situationLabel } from "@/lib/grades";

/** Resumo acadêmico (notas + frequência) de um aluno, por disciplina. */
export async function StudentAcademic({ studentId }: { studentId: string }) {
  const [student, grades, attendances] = await Promise.all([
    prisma.student.findUnique({ where: { id: studentId }, include: { classGroup: true } }),
    prisma.grade.findMany({
      where: { studentId },
      include: { assessment: true, assignment: { include: { subject: true } } },
    }),
    prisma.attendance.findMany({
      where: { studentId },
      include: { assignment: { include: { subject: true } } },
    }),
  ]);

  if (!student) return <p className="text-sm text-slate-500">Aluno não encontrado.</p>;

  // agrupa por disciplina (assignment.subject)
  const bySubject: Record<
    string,
    { subject: string; grades: { name: string; value: number; maxValue: number }[]; present: number; total: number }
  > = {};

  for (const g of grades) {
    const key = g.assignmentId;
    const subject = g.assignment.subject.name;
    (bySubject[key] ??= { subject, grades: [], present: 0, total: 0 }).grades.push({
      name: g.assessment.name,
      value: g.value,
      maxValue: g.assessment.maxValue,
    });
  }
  for (const a of attendances) {
    const key = a.assignmentId;
    const subject = a.assignment.subject.name;
    const row = (bySubject[key] ??= { subject, grades: [], present: 0, total: 0 });
    row.total += 1;
    if (a.present) row.present += 1;
  }

  const rows = Object.values(bySubject);

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <p className="font-semibold text-slate-800">{student.name}</p>
        <p className="text-sm text-slate-500">
          Matrícula {student.registration}
          {student.classGroup ? ` · ${student.classGroup.name}` : ""}
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="card p-8 text-center text-sm text-slate-500">
          Ainda não há notas ou frequência registradas.
        </div>
      ) : (
        rows.map((r, i) => {
          const avg = computeAverage(r.grades);
          const sit = situationLabel(avg);
          const freq = r.total > 0 ? Math.round((r.present / r.total) * 100) : null;
          const toneClass =
            sit.tone === "green" ? "bg-green-100 text-green-700"
            : sit.tone === "amber" ? "bg-amber-100 text-amber-700"
            : "bg-slate-100 text-slate-600";
          return (
            <div key={i} className="card p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-slate-800">{r.subject}</h3>
                <div className="flex gap-2 items-center">
                  <span className="text-sm text-slate-500">
                    Média: <b className="text-slate-800">{avg === null ? "—" : avg.toFixed(2)}</b>
                  </span>
                  <span className={`badge ${toneClass}`}>{sit.label}</span>
                  {freq !== null && (
                    <span className={`badge ${freq >= 75 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      Freq. {freq}%
                    </span>
                  )}
                </div>
              </div>
              {r.grades.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="table-base">
                    <thead>
                      <tr>
                        <th>Avaliação</th>
                        <th>Nota</th>
                        <th>Valor máx.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.grades.map((g, j) => (
                        <tr key={j}>
                          <td>{g.name}</td>
                          <td className="font-medium text-slate-800">{g.value}</td>
                          <td>{g.maxValue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
