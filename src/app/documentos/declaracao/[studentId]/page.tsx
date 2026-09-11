import { notFound } from "next/navigation";
import { buildStudentReport } from "@/lib/academic";
import { getSchool } from "@/lib/school";
import { DocumentSheet } from "@/components/DocumentSheet";

export const dynamic = "force-dynamic";

export default async function DeclaracaoPage({ params }: { params: { studentId: string } }) {
  const [report, school] = await Promise.all([
    buildStudentReport(params.studentId),
    getSchool(),
  ]);
  if (!report) notFound();

  const year = report.schoolYear ?? school?.schoolYear ?? "corrente";

  return (
    <DocumentSheet
      school={school}
      title="Declaração"
      signatureName={school?.secretaryName}
    >
      <p style={{ textAlign: "justify", lineHeight: 1.9 }}>
        Declaramos, para os devidos fins, que <b>{report.name}</b>, portador(a) da matrícula
        nº <b>{report.registration}</b>, encontra-se regularmente matriculado(a)
        {report.className ? <> na turma <b>{report.className}</b></> : null} desta instituição de
        ensino{school?.name ? <>, <b>{school.name}</b></> : null}, referente ao ano letivo de{" "}
        <b>{year}</b>.
      </p>
      <p style={{ textAlign: "justify", lineHeight: 1.9 }}>
        Por ser expressão da verdade, firmamos a presente declaração.
      </p>
    </DocumentSheet>
  );
}
