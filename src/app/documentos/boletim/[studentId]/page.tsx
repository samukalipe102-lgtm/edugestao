import { notFound } from "next/navigation";
import { buildStudentReport } from "@/lib/academic";
import { getSchool } from "@/lib/school";
import { DocumentSheet } from "@/components/DocumentSheet";

export const dynamic = "force-dynamic";

export default async function BoletimPage({ params }: { params: { studentId: string } }) {
  const [report, school] = await Promise.all([
    buildStudentReport(params.studentId),
    getSchool(),
  ]);
  if (!report) notFound();

  return (
    <DocumentSheet
      school={school}
      title="Boletim Escolar"
      signatureName={school?.secretaryName}
    >
      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
        <p><b>Aluno(a):</b> {report.name}</p>
        <p><b>Matrícula:</b> {report.registration}</p>
        <p><b>Turma:</b> {report.className ?? "—"}</p>
        <p><b>Ano letivo:</b> {report.schoolYear ?? school?.schoolYear ?? "—"}</p>
      </div>

      {report.subjects.length === 0 ? (
        <p>Não há notas ou frequência registradas para este aluno.</p>
      ) : (
        <table className="doc-table">
          <thead>
            <tr>
              <th>Disciplina</th>
              <th className="text-center">Média</th>
              <th className="text-center">Frequência</th>
              <th className="text-center">Situação</th>
            </tr>
          </thead>
          <tbody>
            {report.subjects.map((s, i) => (
              <tr key={i}>
                <td>{s.subject}</td>
                <td style={{ textAlign: "center" }}>{s.average === null ? "—" : s.average.toFixed(2)}</td>
                <td style={{ textAlign: "center" }}>{s.frequencyPct === null ? "—" : `${s.frequencyPct}%`}</td>
                <td style={{ textAlign: "center" }}>{s.situation}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td><b>Média geral</b></td>
              <td style={{ textAlign: "center" }}>
                <b>{report.overallAverage === null ? "—" : report.overallAverage.toFixed(2)}</b>
              </td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      )}

      <p className="text-xs text-slate-500 mt-4">
        Médias apresentadas na escala 0–10. Situação: média ≥ 6,0 = Aprovado.
      </p>
    </DocumentSheet>
  );
}
