import { prisma } from "@/lib/prisma";
import { getCurrentTeacher } from "@/lib/teacher";
import { MaterialsClient } from "./MaterialsClient";
import { EmptyState, PageHeader } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default async function MaterialsPage({ searchParams }: { searchParams: { a?: string } }) {
  const teacher = await getCurrentTeacher();
  const assignments = teacher
    ? await prisma.assignment.findMany({
        where: { teacherId: teacher.id },
        include: { classGroup: true, subject: true },
        orderBy: [{ classGroup: { name: "asc" } }, { subject: { name: "asc" } }],
      })
    : [];

  if (assignments.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Materiais" />
        <EmptyState message="Você ainda não possui turmas/disciplinas atribuídas." />
      </div>
    );
  }

  const selectedId =
    searchParams.a && assignments.find((a) => a.id === searchParams.a) ? searchParams.a : assignments[0].id;

  const materials = await prisma.material.findMany({
    where: { assignmentId: selectedId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <MaterialsClient
      assignments={assignments.map((a) => ({ id: a.id, label: `${a.classGroup.name} · ${a.subject.name}` }))}
      selectedId={selectedId}
      materials={materials.map((m) => ({ id: m.id, title: m.title, url: m.url, description: m.description }))}
    />
  );
}
