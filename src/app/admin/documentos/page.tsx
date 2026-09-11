import { prisma } from "@/lib/prisma";
import { getSchool } from "@/lib/school";
import { DocumentsClient } from "./DocumentsClient";
import { PageHeader } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const [students, classes, school] = await Promise.all([
    prisma.student.findMany({ orderBy: { name: "asc" }, include: { classGroup: true } }),
    prisma.classGroup.findMany({ orderBy: { name: "asc" } }),
    getSchool(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documentos"
        subtitle="Gere documentos oficiais usando os dados de Configurações da Escola"
      />
      {!school && (
        <div className="card p-5 border-l-4 border-amber-400">
          <p className="text-sm text-slate-700">
            Configure os dados da escola em{" "}
            <a href="/admin/configuracoes" className="text-brand-600 font-medium">
              Configurações da Escola
            </a>{" "}
            para que apareçam nos documentos.
          </p>
        </div>
      )}
      <DocumentsClient
        students={students.map((s) => ({
          id: s.id,
          name: s.name,
          registration: s.registration,
          className: s.classGroup?.name ?? null,
        }))}
        classes={classes.map((c) => ({ id: c.id, name: c.name, schoolYear: c.schoolYear }))}
      />
    </div>
  );
}
