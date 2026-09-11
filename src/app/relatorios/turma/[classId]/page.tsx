import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSchool } from "@/lib/school";
import { DocumentSheet } from "@/components/DocumentSheet";
import { buildStudentReport } from "@/lib/academic";

export const dynamic = "force-dynamic";

export default async function RelatorioTurmaPage({ params }: { params: { classId: string } }) {
  const [cls, school] = await Promise.all([
    prisma.classGroup.findUnique({
      where: { id: params.classId },
      include: { students: { where: { status: { not: "INACTIVE" } }, orderBy: { name: "asc" } } },
    }),
    getSchool(),
  ]);
  if (!cls) notFound();

  const reports = await Promise.all(cls.students.map((s) => buildStudentReport(s.id)));

  return (
    <DocumentSheet school={school} title="Relatório por Turma" signatureName={school?.secretaryName}>
      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
        <p><b>Turma:</b> {cls.name}</p>
        <p><b>Ano letivo:</b> {cls.schoolYear}</p>
        <p><b>Etapa:</b> {cls.stage ?? "—"}</p>
        <p><b>Alunos:</b> {cls.students.length}</p>
      </div>

      {reports.length === 0 ? (
        <p>Turma sem alunos ativos.</p>
      ) : (
        <table className="doc-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Aluno</th>
              <th>Matrícula</th>
              <th className="text-center">Média Geral</th>
              <th className="text-center">Situação</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r, i) =>
              r ? (
                <tr key={r.id}>
                  <td>{i + 1}</td>
                  <td>{r.name}</td>
                  <td>{r.registration}</td>
                  <td style={{ textAlign: "center" }}>
                    {r.overallAverage === null ? "—" : r.overallAverage.toFixed(2)}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {r.overallAverage === null ? "Sem notas" : r.overallAverage >= 6 ? "Aprovado" : "Em recuperação"}
                  </td>
                </tr>
              ) : null
            )}
          </tbody>
        </table>
      )}
    </DocumentSheet>
  );
}
