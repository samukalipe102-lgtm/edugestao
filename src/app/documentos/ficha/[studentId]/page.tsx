import { notFound } from "next/navigation";
import { buildStudentReport } from "@/lib/academic";
import { getSchool } from "@/lib/school";
import { DocumentSheet } from "@/components/DocumentSheet";
import { STUDENT_STATUS_LABELS } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function FichaPage({ params }: { params: { studentId: string } }) {
  const [report, school] = await Promise.all([
    buildStudentReport(params.studentId),
    getSchool(),
  ]);
  if (!report) notFound();

  return (
    <DocumentSheet
      school={school}
      title="Ficha Individual do Aluno"
      signatureName={school?.secretaryName}
    >
      <h2 className="font-semibold text-slate-800 mb-2">Dados cadastrais</h2>
      <table className="doc-table mb-6">
        <tbody>
          <tr><th style={{ width: "35%" }}>Nome</th><td>{report.name}</td></tr>
          <tr><th>Matrícula</th><td>{report.registration}</td></tr>
          <tr><th>Turma</th><td>{report.className ?? "—"}</td></tr>
          <tr><th>Ano letivo</th><td>{report.schoolYear ?? school?.schoolYear ?? "—"}</td></tr>
          <tr><th>Situação</th><td>{STUDENT_STATUS_LABELS[report.status] ?? report.status}</td></tr>
          <tr><th>Responsável</th><td>{report.guardianName ?? "—"}</td></tr>
          <tr><th>E-mail</th><td>{report.email ?? "—"}</td></tr>
          <tr><th>Telefone</th><td>{report.phone ?? "—"}</td></tr>
        </tbody>
      </table>

      <h2 className="font-semibold text-slate-800 mb-2">Desempenho por disciplina</h2>
      {report.subjects.length === 0 ? (
        <p>Sem registros acadêmicos.</p>
      ) : (
        <table className="doc-table">
          <thead>
            <tr>
              <th>Disciplina</th>
              <th>Professor</th>
              <th className="text-center">Média</th>
              <th className="text-center">Freq.</th>
            </tr>
          </thead>
          <tbody>
            {report.subjects.map((s, i) => (
              <tr key={i}>
                <td>{s.subject}</td>
                <td>{s.teacher || "—"}</td>
                <td style={{ textAlign: "center" }}>{s.average === null ? "—" : s.average.toFixed(2)}</td>
                <td style={{ textAlign: "center" }}>{s.frequencyPct === null ? "—" : `${s.frequencyPct}%`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </DocumentSheet>
  );
}
