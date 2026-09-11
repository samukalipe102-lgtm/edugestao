import { notFound } from "next/navigation";
import { buildStudentReport } from "@/lib/academic";
import { getSchool } from "@/lib/school";
import { DocumentSheet } from "@/components/DocumentSheet";

export const dynamic = "force-dynamic";

export default async function RelatorioIndividualPage({ params }: { params: { studentId: string } }) {
  const [report, school] = await Promise.all([
    buildStudentReport(params.studentId),
    getSchool(),
  ]);
  if (!report) notFound();

  return (
    <DocumentSheet school={school} title="Relatório Individual do Aluno" signatureName={school?.secretaryName}>
      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
        <p><b>Aluno(a):</b> {report.name}</p>
        <p><b>Matrícula:</b> {report.registration}</p>
        <p><b>Turma:</b> {report.className ?? "—"}</p>
        <p><b>Média geral:</b> {report.overallAverage === null ? "—" : report.overallAverage.toFixed(2)}</p>
      </div>

      {report.subjects.length === 0 ? (
        <p>Sem registros acadêmicos.</p>
      ) : (
        report.subjects.map((s, i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            <p style={{ fontWeight: 600 }}>
              {s.subject} — Média {s.average === null ? "—" : s.average.toFixed(2)} · Freq.{" "}
              {s.frequencyPct === null ? "—" : `${s.frequencyPct}%`} · {s.situation}
            </p>
            {s.grades.length > 0 && (
              <table className="doc-table" style={{ marginTop: 4 }}>
                <thead>
                  <tr><th>Avaliação</th><th className="text-center">Nota</th><th className="text-center">Máx.</th></tr>
                </thead>
                <tbody>
                  {s.grades.map((g, j) => (
                    <tr key={j}>
                      <td>{g.name}</td>
                      <td style={{ textAlign: "center" }}>{g.value}</td>
                      <td style={{ textAlign: "center" }}>{g.maxValue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))
      )}
    </DocumentSheet>
  );
}
