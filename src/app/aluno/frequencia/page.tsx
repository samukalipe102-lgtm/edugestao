import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { PageHeader, EmptyState } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default async function StudentFrequencyPage() {
  const session = await getSession();
  const student = await prisma.student.findFirst({ where: { userId: session?.user?.id } });

  const records = student
    ? await prisma.attendance.findMany({
        where: { studentId: student.id },
        include: { assignment: { include: { subject: true } } },
        orderBy: { date: "desc" },
      })
    : [];

  return (
    <div className="space-y-6">
      <PageHeader title="Frequência" subtitle="Seus registros de presença e falta" />
      {!student ? (
        <EmptyState message="Seu usuário não está vinculado a um cadastro de aluno." />
      ) : records.length === 0 ? (
        <EmptyState message="Nenhum registro de frequência ainda." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Data</th>
                <th>Disciplina</th>
                <th>Aula</th>
                <th>Situação</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td>{r.date.toISOString().slice(0, 10)}</td>
                  <td>{r.assignment.subject.name}</td>
                  <td>{r.slot}ª</td>
                  <td>
                    <span className={`badge ${r.present ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {r.present ? "Presente" : "Falta"}
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
}
