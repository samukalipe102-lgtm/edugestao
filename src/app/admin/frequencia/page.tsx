import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default async function AdminFrequencyPage() {
  const classes = await prisma.classGroup.findMany({
    orderBy: [{ schoolYear: "desc" }, { name: "asc" }],
    include: {
      students: {
        where: { status: { not: "INACTIVE" } },
        orderBy: { name: "asc" },
        include: { attendances: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Frequência"
        subtitle="Consolidado de frequência por turma (todas as disciplinas)"
      />

      {classes.length === 0 ? (
        <EmptyState message="Nenhuma turma cadastrada." />
      ) : (
        classes.map((c) => {
          const rows = c.students.map((s) => {
            const total = s.attendances.length;
            const present = s.attendances.filter((a) => a.present).length;
            const pct = total > 0 ? Math.round((present / total) * 100) : null;
            return { id: s.id, name: s.name, total, present, absent: total - present, pct };
          });
          return (
            <div key={c.id} className="card p-5">
              <h3 className="font-semibold text-slate-800 mb-3">
                {c.name} <span className="text-sm font-normal text-slate-400">· {c.schoolYear}</span>
              </h3>
              {rows.length === 0 ? (
                <p className="text-sm text-slate-400">Sem alunos.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table-base">
                    <thead>
                      <tr>
                        <th>Aluno</th>
                        <th>Aulas</th>
                        <th>Presenças</th>
                        <th>Faltas</th>
                        <th>Frequência</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.id}>
                          <td className="font-medium text-slate-800">{r.name}</td>
                          <td>{r.total}</td>
                          <td>{r.present}</td>
                          <td>{r.absent}</td>
                          <td>
                            {r.pct === null ? (
                              <span className="text-slate-400">—</span>
                            ) : (
                              <span className={`badge ${r.pct >= 75 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                {r.pct}%
                              </span>
                            )}
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
