import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSchool } from "@/lib/school";
import { DocumentSheet } from "@/components/DocumentSheet";
import { buildStudentReport } from "@/lib/academic";

export const dynamic = "force-dynamic";

export default async function RelatorioNotasPage({ params }: { params: { classId: string } }) {
  const [cls, school] = await Promise.all([
    prisma.classGroup.findUnique({
      where: { id: params.classId },
      include: { students: { where: { status: { not: "INACTIVE" } }, orderBy: { name: "asc" } } },
    }),
    getSchool(),
  ]);
  if (!cls) notFound();

  const reports = (await Promise.all(cls.students.map((s) => buildStudentReport(s.id)))).filter(
    (r): r is NonNullable<typeof r> => r !== null
  );

  // conjunto de disciplinas presentes
  const subjectNames = Array.from(
    new Set(reports.flatMap((r) => r.subjects.map((s) => s.subject)))
  ).sort();

  return (
    <DocumentSheet school={school} title="Relatório de Notas" signatureName={school?.secretaryName}>
      <p className="text-sm mb-4"><b>Turma:</b> {cls.name} · <b>Ano:</b> {cls.schoolYear}</p>

      {reports.length === 0 || subjectNames.length === 0 ? (
        <p>Não há notas registradas para esta turma.</p>
      ) : (
        <table className="doc-table">
          <thead>
            <tr>
              <th>Aluno</th>
              {subjectNames.map((s) => (
                <th key={s} className="text-center">{s}</th>
              ))}
              <th className="text-center">Geral</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                {subjectNames.map((sn) => {
                  const sub = r.subjects.find((x) => x.subject === sn);
                  return (
                    <td key={sn} style={{ textAlign: "center" }}>
                      {sub && sub.average !== null ? sub.average.toFixed(1) : "—"}
                    </td>
                  );
                })}
                <td style={{ textAlign: "center" }}>
                  <b>{r.overallAverage === null ? "—" : r.overallAverage.toFixed(1)}</b>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </DocumentSheet>
  );
}
