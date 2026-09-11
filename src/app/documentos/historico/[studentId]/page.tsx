import { notFound } from "next/navigation";
import { buildStudentReport } from "@/lib/academic";
import { getSchool } from "@/lib/school";
import { DocumentSheet } from "@/components/DocumentSheet";

export const dynamic = "force-dynamic";

export default async function HistoricoPage({ params }: { params: { studentId: string } }) {
  const [report, school] = await Promise.all([
    buildStudentReport(params.studentId),
    getSchool(),
  ]);
  if (!report) notFound();

  return (
    <DocumentSheet
      school={school}
      title="Histórico Escolar"
      signatureName={school?.secretaryName}
    >
      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
        <p><b>Aluno(a):</b> {report.name}</p>
        <p><b>Matrícula:</b> {report.registration}</p>
        <p><b>Turma:</b> {report.className ?? "—"}</p>
        <p><b>Ano letivo:</b> {report.schoolYear ?? school?.schoolYear ?? "—"}</p>
      </div>

      {report.subjects.length === 0 ? (
        <p>Não há registros acadêmicos consolidados para este aluno.</p>
      ) : (
        <table className="doc-table">
          <thead>
            <tr>
              <th>Componente Curricular</th>
              <th className="text-center">Média Final</th>
              <th className="text-center">Frequência</th>
              <th className="text-center">Resultado</th>
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
        </table>
      )}

      <p className="text-xs text-slate-500 mt-4">
        Documento gerado eletronicamente pelo sistema EduGestão. Médias na escala 0–10.
      </p>
    </DocumentSheet>
  );
}
