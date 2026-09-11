import { prisma } from "@/lib/prisma";
import { PageHeader, EmptyState } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default async function AdminPlanningPage() {
  const assignments = await prisma.assignment.findMany({
    include: {
      classGroup: true,
      subject: true,
      teacher: { include: { user: true } },
      _count: { select: { plans: true } },
      lessons: { where: { planned: true }, select: { id: true } },
    },
    orderBy: [{ classGroup: { name: "asc" } }, { subject: { name: "asc" } }],
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Planejamento"
        subtitle="Panorama: Turma → Disciplina → Professor → Aulas planejadas → BNCC"
      />
      {assignments.length === 0 ? (
        <EmptyState message="Nenhuma atribuição cadastrada." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Turma</th>
                <th>Disciplina</th>
                <th>Professor</th>
                <th>Planos</th>
                <th>Aulas planejadas</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id}>
                  <td className="font-medium text-slate-800">{a.classGroup.name}</td>
                  <td>{a.subject.name}</td>
                  <td>{a.teacher.user.name}</td>
                  <td>{a._count.plans}</td>
                  <td>{a.lessons.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
