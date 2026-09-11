import { prisma } from "@/lib/prisma";
import { ReportsClient } from "./ReportsClient";
import { PageHeader } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const [classes, students] = await Promise.all([
    prisma.classGroup.findMany({ orderBy: { name: "asc" } }),
    prisma.student.findMany({ orderBy: { name: "asc" }, include: { classGroup: true } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        subtitle="Gere relatórios de notas, frequência, individuais e por turma"
      />
      <ReportsClient
        classes={classes.map((c) => ({ id: c.id, name: c.name, schoolYear: c.schoolYear }))}
        students={students.map((s) => ({
          id: s.id,
          name: s.name,
          registration: s.registration,
          className: s.classGroup?.name ?? null,
        }))}
      />
    </div>
  );
}
