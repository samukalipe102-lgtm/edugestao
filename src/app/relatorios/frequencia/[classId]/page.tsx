import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSchool } from "@/lib/school";
import { DocumentSheet } from "@/components/DocumentSheet";

export const dynamic = "force-dynamic";

export default async function RelatorioFrequenciaPage({ params }: { params: { classId: string } }) {
  const [cls, school] = await Promise.all([
    prisma.classGroup.findUnique({
      where: { id: params.classId },
      include: {
        students: {
          where: { status: { not: "INACTIVE" } },
          orderBy: { name: "asc" },
          include: { attendances: true },
        },
      },
    }),
    getSchool(),
  ]);
  if (!cls) notFound();

  return (
    <DocumentSheet school={school} title="Relatório de Frequência" signatureName={school?.secretaryName}>
      <p className="text-sm mb-4"><b>Turma:</b> {cls.name} · <b>Ano:</b> {cls.schoolYear}</p>

      {cls.students.length === 0 ? (
        <p>Turma sem alunos ativos.</p>
      ) : (
        <table className="doc-table">
          <thead>
            <tr>
              <th>Aluno</th>
              <th className="text-center">Aulas</th>
              <th className="text-center">Presenças</th>
              <th className="text-center">Faltas</th>
              <th className="text-center">Frequência</th>
            </tr>
          </thead>
          <tbody>
            {cls.students.map((s) => {
              const total = s.attendances.length;
              const present = s.attendances.filter((a) => a.present).length;
              const pct = total > 0 ? Math.round((present / total) * 100) : null;
              return (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td style={{ textAlign: "center" }}>{total}</td>
                  <td style={{ textAlign: "center" }}>{present}</td>
                  <td style={{ textAlign: "center" }}>{total - present}</td>
                  <td style={{ textAlign: "center" }}>{pct === null ? "—" : `${pct}%`}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </DocumentSheet>
  );
}
