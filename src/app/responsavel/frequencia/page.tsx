import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { PageHeader, EmptyState } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default async function GuardianFrequencyPage() {
  const session = await getSession();
  const guardian = await prisma.guardian.findFirst({
    where: { userId: session?.user?.id },
    include: {
      students: {
        include: {
          attendances: {
            include: { assignment: { include: { subject: true } } },
            orderBy: { date: "desc" },
          },
        },
      },
    },
  });

  const students = guardian?.students ?? [];

  return (
    <div className="space-y-8">
      <PageHeader title="Frequência" subtitle="Frequência dos alunos vinculados" />
      {students.length === 0 ? (
        <EmptyState message="Nenhum aluno vinculado a você." />
      ) : (
        students.map((s) => {
          const total = s.attendances.length;
          const present = s.attendances.filter((a) => a.present).length;
          const pct = total > 0 ? Math.round((present / total) * 100) : null;
          return (
            <div key={s.id} className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-800">{s.name}</p>
                {pct !== null && (
                  <span className={`badge ${pct >= 75 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    Frequência {pct}%
                  </span>
                )}
              </div>
              {total === 0 ? (
                <p className="text-sm text-slate-400">Sem registros.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table-base">
                    <thead>
                      <tr><th>Data</th><th>Disciplina</th><th>Situação</th></tr>
                    </thead>
                    <tbody>
                      {s.attendances.slice(0, 30).map((a) => (
                        <tr key={a.id}>
                          <td>{a.date.toISOString().slice(0, 10)}</td>
                          <td>{a.assignment.subject.name}</td>
                          <td>
                            <span className={`badge ${a.present ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                              {a.present ? "Presente" : "Falta"}
                            </span>
                          </td>
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
